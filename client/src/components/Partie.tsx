import { useNavigate, useParams } from "react-router-dom"
import Chat from "./Chat"

import { GrilleMultijoueur } from "./GrilleMultijoueur"
import { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { MP_WS_URL } from "../env";
import { TableauScores } from "./TableauScores";
import { PlayersContext } from "../pages/GameManager";
interface Player{
    idUser: string;
    login: string;
    score: number;
    mots: string[];
    
}
interface Settings {
    lignes: number,
    colonnes: number,
    temps: number,
    gameID: string,
    bloquerMots: boolean,
    politiqueScore: number,
}
interface GrilleProps {
    lignes: number,
    colonnes: number,
    grilleProps: Array<string>,
}

interface PlayerStats{
    idUser: string;
    login: string;
    score: number;
    words : string[];
}

export const Partie = (props: any) => {
    const [gameID, setGameID] = useState<string>("");
    const { lastMessage, sendMessage } = useWebSocket(MP_WS_URL);
    const { id } = useParams();
    const users = useContext(PlayersContext);
    const [settings, setSettings] = useState<Settings>({ lignes: 4, colonnes: 4, temps: 3, gameID: "", bloquerMots: false, politiqueScore: 1 });
    const [players, setPlayers] = useState<Player[]>([]);
    const [playersStats, setPlayersStats] = useState<PlayerStats[]>([]);
    const navigate = useNavigate();

    const [grilleProps, setGrilleProps] = useState<GrilleProps>({ lignes: 4, colonnes: 4, grilleProps: [] });

    useEffect(() => {
        if (!id)
            return
        setGameID(id);
        connectToGame(id);
        setPlayers(initPlayers());
        
        

    }, []);

    const initPlayers = () => {
        const players: Player[] = [];
        users.forEach((user) => {
            players.push({
                idUser: user.idUser,
                login: user.login,
                score: 0,
                mots: [],
            })
        })
        return players;
    }


    useEffect(() => {
        if (!lastMessage)
            return;
        const lastMessageData = JSON.parse(lastMessage.data);
        console.error(lastMessageData);
        if(lastMessageData.type === "redirect"){
            navigate(lastMessageData.url);
        }
        if (lastMessageData.type === "start") {
            setGrilleProps({
                lignes: lastMessageData.settings.lignes,
                colonnes: lastMessageData.settings.colonnes,
                grilleProps: lastMessageData.grille.split(" "),
            });
            setSettings(lastMessageData.settings);
        }
        if (lastMessageData.type === "move_event") {
            setPlayersStats(lastMessageData.scores);
        }


    }, [lastMessage]);



    function connectToGame(id: string) {
        const joinRoom = {
            type: "join",
            status: "game",
            token: localStorage.getItem("token"),
            gameID: id,
        }
        sendMessage(JSON.stringify(joinRoom));
    }

    function handleWordSend(word: string) {
        const sendWord = {
            type: "guess",
            token: localStorage.getItem("token"),
            gameID: gameID,
            word: word,
        }
        sendMessage(JSON.stringify(sendWord));


    }

    return (
        <div className="multiplayer-line">
        <GrilleMultijoueur lignes={grilleProps.lignes} colonnes={grilleProps.colonnes} grilleProps={grilleProps.grilleProps} onWordSent={handleWordSend} temps={settings.temps*60_000}>
        { playersStats.length > 0 && <TableauScores stats={playersStats} />}

        </GrilleMultijoueur>
        
 

        </div>
    )


}