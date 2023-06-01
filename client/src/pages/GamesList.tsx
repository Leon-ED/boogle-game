import { useEffect, useState } from "react";
import { WaitingGame } from "../components/WaitingGame";
import useWebSocket from "react-use-websocket";
import { MP_WS_URL } from "../env";


interface Games {
    id: string,
    adminID: string,
    players:number,
    settings: GameSettings,
}

interface GameSettings {
    bloquerMots: boolean,
    colonnes: number,
    lignes: number,
    politiqueScore: number,
}




export const GamesList = () => {

    const [games, setGames] = useState<Games[]>([]);
    const { lastMessage, sendJsonMessage, sendMessage } = useWebSocket(MP_WS_URL);

    useEffect(() => {
        sendJsonMessage({
            type: "seek",
            token: localStorage.getItem("token"),
        });
    }, []);

    useEffect(() => {
        if (!lastMessage) return;
        const data = JSON.parse(lastMessage.data);
        if (data.type === "seek") {
            console.log(data.games);
            setGames(data.games);
        }
    }, [lastMessage]);

    const gamesList = games.map((game) => {
        return (
            <WaitingGame key={game.id} id={game.id} adminID={game.adminID} players={game.players} settings={game.settings} />
        )
    })

        

    return (
        <main>
            <section>
                <h1>Parties disponibles</h1>
            </section>
            <div className="games">
                {gamesList}
            </div>
        </main>

    )

}