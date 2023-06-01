interface PlayerStats{
    idUser: string;
    login: string;
    score: number;
    words : string[];
}


export const TableauScores = ({stats}: {stats: PlayerStats[]}) => {

    
return(
    <section className="tableau-scores">
        <h2>Tableau des scores</h2>
        {
            stats.map((player, index) => {
                return (
                    <div className="player-score" key={index}>
                        <h5 className="player-name">{player.login}</h5>
                        <span className="player-points">Score : {player.score}</span>
                        <details className="player-words">
                        <summary className="player-words">
                            Mots trouvés
                        </summary>
                        {player.words.toString()}

                        </details>

                    </div>
                )
            })
        }
        </section>
)

}