import { useEffect, useState } from "react";
import { Player } from "./Player"
import { BACKEND_URL } from "../env";

export const GameRecap_player = ({idUser, name, score, mots}: {idUser: string, name: string, score:number,mots:string[]}) => {

    const [namePlayer, setNamePlayer] = useState<string>("");

    useEffect(() => {
        fetch(BACKEND_URL + "/account/get/profile/" + idUser)
            .then((res) => res.json())
            .then((res) => {
                setNamePlayer(res.data.pseudoUser);
            })
    }, [])


return (
<div className="game-recap-player">
    <Player idUser={idUser} name={namePlayer} />
    <details className="game-recap-player-words">
        <summary>Score : {score}</summary>
        {/* <div className="game-recap-player-words-list">
            <p>mot1</p>
            <p>mot2</p>
            <p>mot3</p>
            <p>mot4</p>
            <p>mot5</p>
        </div> */}
    </details>
</div>

)



}