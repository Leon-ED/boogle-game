interface Player{
    idUser: string;
    login: string;
    score: number;
    mots: string[];
    
}



export const TableauScores = ({players}: {players: Player[]}) => {

    
return(
    <section className="tableau-scores">
        <h2>Tableau des scores</h2>
        </section>
)

}