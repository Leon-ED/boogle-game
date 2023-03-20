import "../assets/grille.css";
import { useEffect, useState } from "react";
// import env file
import { BACKEND_URL } from "../env";




function Grille(props: { largeur: number, hauteur: number }) {
    const { largeur, hauteur } = props;
    const [inputWord, setInputWord] = useState<string>("");
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [grille, setGrille] = useState<Array<Array<string>>>(Array(lignes).fill(Array(colonnes).fill("X")));
    const [temps, setTemps] = useState<number>(3);
    const [tempsSec, setTempsSec] = useState<number>(3*60);
    const [tempsString, setTempsString] = useState<string>("3:00");
    const [intervalG, setTInterval] = useState<any>(null);
    const [grilleOrigine, setGrilleOrigine] = useState<Array<string>>([]);





    // initi grid only once
    useEffect(() => {
        generateGrille();
    }, []);


    function generateGrille() {

        fetch(BACKEND_URL+'/jeu/grille/' + lignes + '/' + colonnes, {
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
            // remove last 
            grilleJSON.pop();
            while (grilleJSON.length <= lignes * colonnes) {
                grilleJSON.push("A");
            }
            setGrilleOrigine(grilleJSON);



            const grille2D = [];
            for (let i = 0; i < lignes; i++) {
                const row = grilleJSON.slice(i * colonnes, (i + 1) * colonnes);
                grille2D.push(row);
            }
            setGrille(grille2D);



        })
        lancerTemps();

    }

    function lancerTemps() {
        if(intervalG){
            clearInterval(intervalG);

        }
        setTempsSec(temps*60);
        setTempsString(temps+":00");
  

    }


    function verifierMot() {
        fetch(BACKEND_URL+'/jeu/verify/', {
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
            if (data.reponse === "ok") {
                alert("Mot trouvé");
            } else {
                alert("Mot non trouvé");
            }

        })
    }

    return (
        <main className="main-home">
            <section >
                <h1>Paramètres</h1>
                <div className="grille-header">
                    <div className="grille-header-container">
                        <label htmlFor="largeur">Lignes</label>
                        <input name="lignes" value={lignes} min="2" max="10" type="number" onChange={
                            (e) => {
                                setLignes(parseInt(e.target.value));
                            }

                        }/>
                    </div>
                    <div className="grille-header-container">
                        <label htmlFor="largeur">Colonnes</label>
                        <input type="number" name="colonnes" value={colonnes} min="2" max="10" onChange={
                            (e) => {
                                setColonnes(parseInt(e.target.value));
                            }

                        }/>
                    </div>
                    <div className="grille-header-container">
                        <label htmlFor="temps">Temps : {temps} min</label>
                        <input type="range" name="temps" value={temps} min="1" max="10"  onChange={
                            (e) => {
                                setTemps(parseInt(e.target.value));
                            }
                        } />
                    </div>

                    <button value="Générer" onClick={generateGrille} >Générer</button>
                </div>
            </section>
            <section>
                <h1>Temps: {temps} min </h1>
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
            </section>
        </main>

    );
}

export default Grille;
