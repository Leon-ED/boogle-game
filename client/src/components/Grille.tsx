import "../assets/grille.css";
import { useEffect, useState } from "react";
// import env file
import { BACKEND_URL } from "../env";
import Mot from "./MotGrille";



function Grille(props: { largeur: number, hauteur: number }) {
    const { largeur, hauteur } = props;
    const [inputWord, setInputWord] = useState<string>("");
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [grille, setGrille] = useState<Array<Array<string>>>(Array(4).fill(Array(4).fill("X")));
    const [grilleOrigine, setGrilleOrigine] = useState<Array<string>>([]);
    const [foundWords, setFoundWords] = useState<Array<string>>([]);




    // Au chargement de la page, on génère une grille
    useEffect(() => {
        generateGrille();
    }, []);


    function generateGrille() {

        fetch(BACKEND_URL + '/jeu/grille/' + lignes + '/' + colonnes, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Charset': 'utf-8',
                'Accept': 'application/json',
            },

        }).then((response) => {
            return response.json();
        }
        ).then((data) => {
            const grilleJSON = data.grille.split(" ");
            const lignesJSON = data.lignes;
            const colonnesJSON = data.colonnes;
            setColonnes(colonnesJSON);
            setLignes(lignesJSON);
            // remove last 
            grilleJSON.pop();
            while (grilleJSON.length <= lignesJSON * colonnesJSON) {
                grilleJSON.push("A");
            }
            setGrilleOrigine(grilleJSON);



            const grille2D = [];
            for (let i = 0; i < lignesJSON; i++) {
                const row = grilleJSON.slice(i * colonnesJSON, (i + 1) * colonnesJSON);
                grille2D.push(row);
            }
            setGrille(grille2D);



        })

    }



    function verifierMot() {
        if(foundWords.includes(inputWord.toUpperCase())){
            alert("Mot déjà trouvé");
            return
        }

        fetch(BACKEND_URL + '/jeu/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Charset': 'utf-8',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                mot: inputWord,
                grille: grilleOrigine.join(" "),
                lignes: lignes,
                colonnes: colonnes,
                langue: "fr"
            })



        }).then((response) => {
            return response.json();
        }
        ).then((data) => {
            if (data.status === "success") {

                alert("Mot trouvé");
                setFoundWords([...foundWords, inputWord.toUpperCase()]);
            } else {
                alert(data.message);
            }

        })
    }



    return (
        <main className="main-home">
            <section>
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

                    <button value="Générer" onClick={generateGrille} >Générer</button>
                </div>
            </section>
            <section id="grille-sec">
                <h1>Temps: Indisponible</h1>
                <div id="grille-sec-container">
                    <div id="grille" className="grille" >

                        {
                            grille.map((ligne, index) => {
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
                                foundWords.map((mot, index) => {
                                    return (
                                        <Mot mot={mot} index={index} />
                                    )
                                })
                            }

                        </div>
                    </div>
                </div>
            </section>
        </main>

    );
}

export default Grille;
