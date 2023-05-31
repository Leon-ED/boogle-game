import { createContext, useEffect, useState } from "react"
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



    const { id } = useParams();

    useEffect(() => {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
        auth().then((data) => {
            if (!data) {
                navigate("/login")
            }
        })
        console.log(id);
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
            })


        } else {
            // On crée une partie et on redirige vers la page de la partie
            setIsAdmin(true);
            getGameUUID().then((data) => {
                setGameID(data);
                if (data) {
                    navigate("/lobby/" + data);
                }
            }
            )

        }

    }, [])

    useEffect(() => {
        const path = window.location.pathname.split("/")[1];
        console.log(path);
        switch (path) {
            case "game": setIsGameStarted(true); console.log("handleGameURL"); break;
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
        console.log(data);
        if (data.type === "update") {
            setSettings(data.game.settings);
        }
        if (data.type === "start") {
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
        console.log("game: " + id);
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
        if (!isAdmin || !boolean)
            return;
        console.log("start");
        setIsGameStarted(true);
        sendMessage(JSON.stringify({
            type: "start",
            token: localStorage.getItem("token"),
            gameID: gameID,
        }));
    }

}


