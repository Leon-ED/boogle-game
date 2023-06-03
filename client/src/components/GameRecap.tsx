import { useEffect, useState } from "react"
import { GameRecap_player } from "./GameRecap-player"
import { Grid } from "./Grid"
import Grille from "./Grille"
import { GrilleMultijoueur } from "./GrilleMultijoueur"
import { Player } from "./Player"
import { BACKEND_URL } from "../env"
import { useParams } from "react-router-dom"

interface FullGame {
    idPartie: string;
    idVainqueur: string;
    dimensionsGrille: string;
    motsTrouves: string;
    Grille:Array<Array<string>>
    politiqueScore: string;
    DateDebutPartie: string;
    temps: number;
    DateFinPartie: string;
    gameAdmin: string;
    users: Array<string>;
    bloquerMots: boolean;
    statut: string;
    solveur: Array<string>;
}



export const GameRecap = () => {

    const id = useParams<{ id: string }>().id;

    const [game, setGame] = useState<FullGame>({} as FullGame);
    useEffect(() => {
        if (!id) return;
        fetch(BACKEND_URL + "/jeu/fetch/" + id)
            .then((res) => res.json())
            .then((res) => {
                console.log(res.game);
                res.game.users = res.game.users.split(",");
                setGame(res.game);
            })
    }, [])
 

    // if(game.statut === "FINISHED")
    return (
        <div className="game-recap">
            <section>
                <h1>Récapitulatif de la partie</h1>
            </section>
            <section>
                <h2>Paramètres</h2>
                <hr />
                <div className="game-recap-settings">
                    <p>Dimensions : {game.dimensionsGrille}</p>
                    <p>Temps : {game.temps}</p>
                    <p>Politique de score : {game.politiqueScore}</p>
                    <p>Blocage des mots : {game.bloquerMots ? "Oui" : "Non"}</p>
                </div>
                <details className="game-recap-solve">
                    <summary>Solveur, nombre de mots : {game.solveur?.length}</summary>
                    <div className="game-recap-solve-words">
                        {game.solveur?.map((mot, index) => {
                            return (
                                <p key={index}>{mot}</p>
                            )

                        })}
                    </div>
                </details>
                <h2>Participants</h2>
                <hr />
                <div className="game-recap-players">
                    { 
                        game.users?.map((user, index) => {
                            return (
                                <GameRecap_player key={index} idUser={user} name={user} score={index} mots={["mot1", "mot2", "mot3", "mot4", "mot5"]} />
                            )
                        }
                        )
                    }
            
                </div>
            </section>
            {
                game.Grille && <Grid lignes={4} colonnes={2} grille={JSON.parse(game.Grille)} />
                 
            }
        </div>

    )



}