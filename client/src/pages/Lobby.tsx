import { useEffect, useState } from "react"
import { auth, getGameUUID, verifGameID } from "../functions"
import { useNavigate, useParams } from "react-router-dom"
import { GrilleSettings } from "../components/GrilleSettings"
import Chat from "../components/Chat"
import useWebSocket from 'react-use-websocket';
import { BACKEND_URL, MP_WS_URL } from '../env';


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

export const Lobby = () => {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<Settings>({ lignes: 4, colonnes: 4, temps: 3, gameID: "", bloquerMots: false, politiqueScore: 1 });
    const [gameID, setGameID] = useState<string>("");
    const { lastMessage, sendJsonMessage, sendMessage } = useWebSocket(MP_WS_URL);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);



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
                if(data){
                    navigate("/lobby/" + data);
                }
            }
            )

        }

    }, [])


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
            navigate("/game/" + gameID);
        }
        

    }, [lastMessage]);




    return (
        <>
            <section>
                <h1>Lobby</h1>
                <p>Créez votre partie et jouez contre vos amis</p>
                <hr />
                <GrilleSettings onSettingsChange={handleChange} settings={settings} gameID={gameID} isAdmin={isAdmin} isStarted={handleGameStart} />
            </section>
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



    function handleGameStart(boolean: boolean) {
        if (!isAdmin || !boolean)
            return;
        console.log("start");
        sendMessage(JSON.stringify({
            type: "start",
            token: localStorage.getItem("token"),
            gameID: gameID,
        }));
    }

}