import { Player } from "./Player"

export const GameRecap_player = ({idUser, name, score, mots}: {idUser: string, name: string, score:number,mots:string[]}) => {

return (
<div className="game-recap-player">
    <Player idUser={idUser} name={name} />
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