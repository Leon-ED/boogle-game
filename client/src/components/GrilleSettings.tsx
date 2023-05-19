import { useEffect, useState } from "react";
import { BACKEND_URL, FRONT_HOST } from "../env";
import { getGameUUID } from "../functions";


interface Settings{
    lignes: number,
    colonnes: number,
    temps: number,
    gameID: string,
    bloquerMots: boolean,
    politiqueScore: number,
}

export const GrilleSettings = ({settings, onSettingsChange,gameID,isAdmin} : {settings:Settings, onSettingsChange:Function,gameID:string,isAdmin:boolean }) => {
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [time, setTime] = useState<number>(3);
    const [politiqueScore, setPolitiqueScore] = useState<number>(1);
    const [bloquerMots, setBloquerMots] = useState<boolean>(false);


    useEffect(() => {
        if(!settings)
            return;

        setLignes(settings.lignes);
        setColonnes(settings.colonnes);
        setTime(settings.temps);
        setPolitiqueScore(settings.politiqueScore);
        setBloquerMots(settings.bloquerMots);

    }, [settings]);

    useEffect(() => {
        onSettingsChange({lignes, colonnes,time,politiqueScore,bloquerMots});
    }, [lignes, colonnes, time, politiqueScore, bloquerMots]);

    useEffect(() => {
        if(!politiqueScore)
            return;
        selectPolitiqueScoreElement(parseInt(politiqueScore.toString()));
    }, [politiqueScore]);

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

                    } { ...(isAdmin ? {} : {disabled: true}) } />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="largeur">Colonnes</label>
                    <input type="number" name="colonnes" value={colonnes} min="2" max="10" onChange={
                        (e) => {
                            setColonnes(parseInt(e.target.value));
                        }

                    } { ...(isAdmin ? {} : {disabled: true}) } />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="temps">Temps : Indisponible</label>
                    <input type="range" name="temps"  value={time} min="1" max="10" onChange={
                        () =>{
                            setTime(parseInt(time.toString()));
                        }

                    }{ ...(isAdmin ? {} : {disabled: true}) }  />
                </div>
                <div className="grille-header-container" onClick={() => {
                        navigator.clipboard.writeText(FRONT_HOST + "/game/" + gameID);

                    }}>
                    <label htmlFor="lien">Lien</label>
                    <input type="text" name="lien" disabled readOnly value={gameID}  />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="lien">Politique de score</label>
                    <select name="politique" id="politique" onChange={
                        (e) => {
                            setPolitiqueScore(parseInt(e.target.value));
                        }
                    } { ...(isAdmin ? {} : {disabled: true}) } >

                        <option id="politique_1" value="1" selected>1 point par mot</option>
                        <option id="politique_2" value="2">1 point par lettre</option>
                        <option  id="politique_3"value="3">Par fréquence des mots</option>
                    </select>
                </div>
                <div className="grille-header-container">
                    <label htmlFor="lien">Bloquer mots déjà trouvés</label>
                    {bloquerMots && <input type="checkbox" name="bloquer" checked onChange={handleBloquerMots} { ...(isAdmin ? {} : {disabled: true}) }  />}
                    {!bloquerMots && <input type="checkbox" name="bloquer" onChange={handleBloquerMots}  { ...(isAdmin ? {} : {disabled: true}) } />}

                </div>
                    
                        
                <button value="Générer">Save</button>
            </div>
        </>
    );

    function selectPolitiqueScoreElement(id:number){
        const elements = document.querySelectorAll("[id^='politique_']");
        elements.forEach((element) => {
            element.removeAttribute("selected");
        });

        const element = document.getElementById("politique_"+id.toString());

        if(!element)
            return;
        element.setAttribute("selected","selected");

    }

    function handleBloquerMots(e: any) {
        setBloquerMots(e.target.checked);
    }
 

    }
