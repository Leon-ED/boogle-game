import { useNavigate } from "react-router-dom";

interface FullGame {
    idPartie: string;
    idVainqueur: string;
    dimensionsGrille: string;
    motsTrouves: string;
    Grille: Array<Array<string>>
    politiqueScore: string;
    DateDebutPartie: string;
    temps: number;
    DateFinPartie: string;
    gameAdmin: string;
    users: Array<string>;
    bloquerMots: boolean;
    statut: string;
}

export const GameOverview = (game: FullGame) => {
    const navigate = useNavigate();


    return (
        <section className="game-overview" onClick={viewRecap} style={{ cursor: "pointer" }}>
            <p>Partie jouée le {game.DateDebutPartie}</p>
            <p>Dimensions : {game.dimensionsGrille}</p>
            <p>Temps : {game.temps} min</p>
            <p>{game.users.length} participant(s)</p>
        </section>


    )
    function viewRecap() {
        navigate("/recap/" + game.idPartie);
    }

}


