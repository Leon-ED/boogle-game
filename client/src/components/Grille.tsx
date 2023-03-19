import "../assets/grille.css";
import { useEffect, useState } from "react";

function Grille(props: { largeur: number, hauteur: number }) {
    const { largeur, hauteur } = props;
    const [inputWord, setInputWord] = useState<string>("");
    const [colonnes, setColonnes] = useState<number>(4);
    const [lignes, setLignes] = useState<number>(4);
    const [grille, setGrille] = useState<Array<Array<string>>>(Array(lignes).fill(Array(colonnes).fill("X")));



    function grilleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value, name } = e.target;
        if (name == "colonnes") {
            // setColonne with callback
            setColonnes(parseInt(value));
        } else {
            setLignes(parseInt(value));
        }
    }

    useEffect(() => {
        generateGrille();
    }, [colonnes, lignes]);


    function generateGrille() {

        fetch('http://localhost:3000/api/jeu/grille/' + lignes + '/' + colonnes, {
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
            while(grilleJSON.length <= lignes * colonnes){
                grilleJSON.push("A");
            }




            const grille2D = [];
            for (let i = 0; i < lignes; i++) {
                const row = grilleJSON.slice(i * colonnes, (i + 1) * colonnes);
                grille2D.push(row);
            }
            setGrille(grille2D );



        })

    }

    return (
        <div id="grille" className="grille" >
            <div className="grille-header">
                <div className="grille-header-container">
                    <label htmlFor="largeur">Lignes</label>
                    <input name="lignes" min="2" max="10" type="number" value={lignes} onChange={grilleChange} />
                </div>
                <div className="grille-header-container">
                    <label htmlFor="largeur">Colonnes</label>
                    <input name="colonnes" min="2" max="10" value={colonnes} type="number" onChange={grilleChange} />
                </div>

            </div>
            {
                grille.map((ligne, index) => {
                    return (
                        <div className="ligne" key={index}>
                            {}
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

            } value={inputWord} />

        </div>
    );
}

export default Grille;
