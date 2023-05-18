import { useEffect, useState } from "react";
import { BACKEND_URL, FRONT_HOST } from "../env";
import { getGameUUID } from "../functions";

export const GrilleSettings = ({getSettings} : {getSettings:Function}) => {
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [grille, setGrille] = useState<Array<Array<string>>>(Array(4).fill(Array(4).fill("X")));
    const [grilleOrigine, setGrilleOrigine] = useState<Array<string>>([]);
    const [gameID, setGameID] = useState<string>("");



    useEffect(() => {

        getGameUUID().then((data) => {
            setGameID(data);
        }
        );
    }, []);

    

    return (
        <>
            <h1>Paramètres</h1>
            <div className="grille-header">
                <div className="grille-header-container">
                    <label htmlFor="largeur">Lignes</label>
                    <input name="lignes" value={lignes} min="2" max="10" type="number" onChange={
                        (e) => {
                            let value: any = e.target.value;
                            setLignes(parseInt(value));
                        }

                    } />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="largeur">Colonnes</label>
                    <input type="number" name="colonnes" value={colonnes} min="2" max="10" onChange={
                        (e) => {
                            setColonnes(parseInt(e.target.value));
                        }

                    } />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="temps">Temps : Indisponible</label>
                    <input type="range" name="temps" value="4" min="1" max="10" />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="lien">Lien</label>
                    <input type="text" name="lien" disabled readOnly value={gameID} onClick={() => {
                        navigator.clipboard.writeText(FRONT_HOST + "/game/" + gameID);

                    }} />
                </div>
                <button value="Générer" onClick={launchGame} >Lancer</button>
            </div>
        </>
    );

    function launchGame() {

        getSettings({
            lignes: lignes,
            colonnes: colonnes,
            grille: grilleOrigine,
            gameID: gameID
        });
        }

    }