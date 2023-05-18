import { useEffect, useState } from "react";
import { BACKEND_URL, FRONT_HOST } from "../env";
import { getGameUUID } from "../functions";

export const GrilleSettings = ({gameID,setSettings} : {gameID:string,setSettings:Function}) => {
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [grille, setGrille] = useState<Array<Array<string>>>(Array(4).fill(Array(4).fill("X")));
    const [grilleOrigine, setGrilleOrigine] = useState<Array<string>>([]);




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
                <div className="grille-header-container" onClick={() => {
                        navigator.clipboard.writeText(FRONT_HOST + "/game/" + gameID);

                    }}>
                    <label htmlFor="lien">Lien</label>
                    <input type="text" name="lien" disabled readOnly value={gameID}  />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="lien">Politique de score</label>
                    <select name="politique" id="politique">
                        <option value="1">1 point par mot</option>
                        <option value="2">1 point par lettre</option>
                        <option value="3">Par fréquence des mots</option>
                    </select>
                </div>
                <div className="grille-header-container">
                    <label htmlFor="lien">Bloquer mots déjà trouvés</label>
                    <input type="checkbox" name="bloquer" id="bloquer" />
                </div>
                    
                        
                <button value="Générer" onClick={launchGame} >Save</button>
            </div>
        </>
    );

    function launchGame() {
        setSettings({
            lignes: lignes,
            colonnes: colonnes,
            gameID: gameID,
            temps: 4,
            bloquerMots: false,
            politiqueScore: 1,
        });
        }

    }