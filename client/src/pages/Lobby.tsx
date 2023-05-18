import { useEffect, useState } from "react"
import { auth, getGameUUID } from "../functions"
import { useNavigate } from "react-router-dom"
import { GrilleSettings } from "../components/GrilleSettings"
import Chat from "../components/Chat"

interface Settings{
    largeur: number,
    hauteur: number,
    temps: number,
    gameID: string,
    bloquerMots: boolean,
    politiqueScore: number,
    
}


export const Lobby = () => {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<Settings>({ largeur: 4, hauteur: 4, temps: 3, gameID: "", bloquerMots: false, politiqueScore: 1});
    const [gameID, setGameID] = useState<string>("");
    useEffect(() => {
        auth().then((data) => {
            if (!data) {
                navigate("/login")
            }
        })
        getGameUUID().then((data) => {
            setGameID(data);
        }
        );


    }, [])





    return (
        <>
            <section>
                <h1>Lobby</h1>
                <h2>Créez votre partie et jouez contre vos amis</h2>
                <hr />
                <GrilleSettings setSettings={
                    (settings: Settings) => {
                        setSettings(settings);
                    }
                }
                    gameID={gameID}/>
            </section>
            <Chat gameID={gameID}/>

        </>
    )






}