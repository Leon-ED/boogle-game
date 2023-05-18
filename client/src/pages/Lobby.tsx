import { useEffect, useState } from "react"
import { auth } from "../functions"
import { useNavigate } from "react-router-dom"
import { GrilleSettings } from "../components/GrilleSettings"
import Chat from "../components/Chat"

interface Settings{
    largeur: number,
    hauteur: number,
    temps: number,
    grille: Array<Array<string>>
    gameID: string
    
}


export const Lobby = () => {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<Settings>({ largeur: 4, hauteur: 4, temps: 4, grille: Array(4).fill(Array(4).fill("X")), gameID: ""});

    useEffect(() => {
        auth().then((data) => {
            if (!data) {
                navigate("/login")
            }
        })
    }, [])





    return (
        <>
            <section>
                <h1>Lobby</h1>
                <h2>Créez votre partie et jouez contre vos amis</h2>
                <hr />
                <GrilleSettings getSettings={(settings: Settings) => { setSettings(settings) }} />
            </section>
            <Chat/>
        </>
    )






}