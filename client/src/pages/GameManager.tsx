import { createContext, useEffect, useRef, useState } from "react"
import { auth, getGameUUID, verifGameID } from "../functions"
import { useNavigate, useParams } from "react-router-dom"
import { GrilleSettings } from "../components/GrilleSettings"
import Chat from "../components/Chat"
import useWebSocket from 'react-use-websocket';
import { BACKEND_URL, MP_WS_URL } from '../env';
import { Partie } from "../components/Partie"
import { Player } from "../components/Player"

export const PlayersContext = createContext<User[]>([]); 
interface Settings {
    lignes: number,
    colonnes: number,
    temps: number,
    gameID: string,
    bloquerMots: boolean,
    politiqueScore: number,
}

interface Response {
    status: string,
    message: string,
    game: GameDB,
}
interface GameDB {
    admin: boolean
    gameAdmin: string
    idPartie: string

}

interface User{
    idUser: string,
    login: string,
}

export const GameManager = () => {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<Settings>({ lignes: 4, colonnes: 4, temps: 3, gameID: "", bloquerMots: false, politiqueScore: 1 });
    const [gameID, setGameID] = useState<string>("");
    const { lastMessage, sendJsonMessage, sendMessage } = useWebSocket(MP_WS_URL);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const webSocketRef = useRef<WebSocket | null>(null);




    const { id } = useParams();

    useEffect(() => {
        webSocketRef.current = new WebSocket(MP_WS_URL);


        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
        auth().then((data) => {
            if (!data) {
                navigate("/login")
            }
        })
        // S'il y a un id alors on vérifie que la partie existe, sinon on redirige vers la page d'accueil
        if (id) {
            verifGameID(id).then((data) => {
                if (!data) {
                    navigate("/");
                }
                setIsAdmin(data.game.admin);
                setGameID(id);
                const joinRoom = {
                    type: "join",
                    token: localStorage.getItem("token"),
                    gameID: gameID,
                }
                sendJsonMessage(joinRoom);
                navigate("/lobby/" + id);
            })


        } else {
            sendJsonMessage({
                type: "new_game",
                token: localStorage.getItem("token"),
            });

            
            // setIsAdmin(true);
            // getGameUUID().then((data) => {
            //     setGameID(data);
            //     if (data) {
            //         navigate("/lobby/" + data);
            //     }
            // }
            // )

        }
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }else{
            }
        }

    }, [])

    useEffect(() => {
        const path = window.location.pathname.split("/")[1];
        switch (path) {
            case "game": setIsGameStarted(true); break;
            case "create": if(gameID){ navigate("/lobby/" + gameID); } else { } break;
        }
    }, [window.location.pathname]);



    useEffect(() => {
        if (!gameID)
            return;
        const joinRoom = {
            type: "join",
            token: localStorage.getItem("token"),
            gameID: gameID,
        }
        sendJsonMessage(joinRoom);
    }, [gameID]);



    useEffect(() => {
        if (lastMessage === null)
            return;
        const data = JSON.parse(lastMessage.data);
        if(data.type === "redirect"){
            navigate(data.url);
        }
        if (data.type === "update") {
            setSettings(data.game.settings);
        }
        if(data.type === "game_created"){
            if(data?.status === "error"){
                console.error("Une erreur est survenue : " + data.message);
                return;
            }

            setIsAdmin(true);
            setGameID(data.gameID);
            navigate("/lobby/" + data.gameID);
        }
        if (data.type === "start") {
            if(webSocketRef.current){
                webSocketRef.current.close();
            }else{
            }

            setIsGameStarted(true);
            navigate("/game/" + gameID);

        }if (data.type === "players_update") {
            setUsers(data.players);
        }


    }, [lastMessage]);

    const lobby: JSX.Element = (
        <section>
            <h1>Lobby</h1>
            <p>Créez votre partie et jouez contre vos amis</p>
            <hr />
            <GrilleSettings onSettingsChange={handleChange} settings={settings} gameID={gameID} isAdmin={isAdmin} isStarted={handleGameStart} />
            <hr />
            <div className="lobby-player-list">
            {users.map((user) => {
                return (
                    <Player idUser={user.idUser} name={user.login} />
                )
            })}
            </div>
            <hr />
        </section>
    )


    return (
        <>
            {!isGameStarted && lobby }
            {isGameStarted &&
            
            <PlayersContext.Provider value={users}>
            <Partie gameID={gameID} />
            </PlayersContext.Provider>
            }
            <Chat gameID={gameID} />

        </>
    )
    function handleChange(settings: Settings) {
        if (!isAdmin)
            return;
        setSettings(settings);

        sendMessage(JSON.stringify({
            type: "settings",
            token: localStorage.getItem("token"),
            gameID: gameID,
            settings: settings,
        }));
    }


    function handleGameURL() {
        if (!id)
            return;
        const JSON = {
            id,
            type: "rejoin",
            token: localStorage.getItem("token"),
        }
        sendJsonMessage(JSON);
    }

    function handleGameStart(boolean: boolean) {
        if(webSocketRef.current){
            webSocketRef.current.close();
        }else{
        }
        if (!isAdmin || !boolean)
            return;
        setIsGameStarted(true);
        sendMessage(JSON.stringify({
            type: "start",
            token: localStorage.getItem("token"),
            gameID: gameID,
        }));
    }

}


