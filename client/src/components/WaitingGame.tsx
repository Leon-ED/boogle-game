import { Link } from "react-router-dom"

interface GameSettings {
    bloquerMots: boolean,
    colonnes: number,
    lignes: number,
    politiqueScore: number,
}

export const WaitingGame = ({ id, adminID, players, settings }: { id: string, adminID: string, players: number, settings: GameSettings }) => {
    
    return (
        <section className="waiting-game">
            <h4>Partie en attente</h4>
            <p>Créée par <span>{adminID}</span></p>
            <p>Nombre de joueurs : <span>1/4</span></p>
            <div className="waiting-game-infos">
                <p>Taille de la grille : <span>{settings.lignes}x{settings.colonnes}</span></p>
                <p>Temps de jeu : <span>{settings.politiqueScore} minutes</span></p>
                <p>Score: <span>{settings.politiqueScore === 1 ? "Politique" : "Scrabble"}</span></p>
                <p>Mots uniques: <span>{settings.bloquerMots ? "Oui" : "Non"}</span></p>

            </div>
            <Link to={"/join/" + id}>Rejoindre</Link>

        </section>
    )


}