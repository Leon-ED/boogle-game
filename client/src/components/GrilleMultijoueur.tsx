import { useEffect, useState } from "react";
import { BACKEND_URL } from "../env";
import Mot from "./MotGrille";

interface GrilleProps {
    lignes: number,
    colonnes: number,
    grilleProps: Array<string>,
}

export const GrilleMultijoueur = ({lignes, colonnes,grilleProps}: GrilleProps) => {
    const [inputWord, setInputWord] = useState<string>("");
    const [grille1D, setGrille1D] = useState<Array<string>>([]);
    const [grille2D, setGrille2D] = useState<Array<Array<string>>>(Array(lignes).fill(Array(colonnes).fill("X")));
    const [wordsList, setWordsList] = useState<Array<string>>([]);

        
    useEffect(displayGrid, [grilleProps]);

    function displayGrid() {
        if(grilleProps[grilleProps.length - 1] === "\n")
            grilleProps.pop();

        if(grilleProps.length === 0 || !grilleProps){
            return;
        }
        const newGrille2D = [];
        for (let i = 0; i < lignes; i++) {
            const row = grilleProps.slice(i * colonnes, (i + 1) * colonnes);
            newGrille2D.push(row);
        }

        setGrille2D(newGrille2D);
        setGrille1D(grilleProps);
        console.log(grilleProps);
        console.log(grille1D);
    }



    function verifierMot() {
        console.log(grille1D);
        console.log(lignes);
        console.log(colonnes);
        fetch(BACKEND_URL + '/jeu/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Charset': 'utf-8',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                mot: inputWord,
                grille: grille1D.join(" "),
                lignes,
                colonnes,
                langue: "fr"
            })



        }).then((response) => {
            return response.json();
        }
        ).then((data) => {
            if (data.status === "success") {

                alert("Mot trouvé");
                setWordsList([...wordsList, inputWord]);
            } else {
                alert(data.message);
            }

        })
    }


    return (
        <section id="grille-sec">
            <h1>Temps: Indisponible</h1>
            <div id="grille-sec-container">
                <div id="grille" className="grille" >

                    {
                        grille2D.map((ligne, index) => {
                            return (
                                <div className="ligne" key={index}>
                                    { }
                                    {
                                        ligne.map((colonne, index) => {
                                            return (
                                                <div className="case" key={index}>
                                                    <span>{colonne}</span>
                                                </div>
                                            )
                                        })

                                    }
                                </div>
                            )
                        })
                    }
                    <input type="text" id="word" placeholder="Mot" onChange={
                        (e) => {
                            setInputWord(e.target.value);
                        }

                    } value={inputWord}
                        onKeyDown={
                            e => {
                                if (e.key === "Enter") {
                                    verifierMot();
                                }

                            }
                        }
                    />

                </div>
                <div id="listeMots">
                    <h2>Mots trouvés</h2>
                    <div id="listeMots-container">
                        {
                            wordsList.map((mot, index) => {
                                return (
                                    <Mot mot={mot} index={index} />
                                )
                            })
                        }

                    </div>
                </div>
            </div>
        </section>
    )

}