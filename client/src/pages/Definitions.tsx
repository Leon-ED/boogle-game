import React, { useState, useEffect } from 'react';
import Definition from '../components/Definition';
import { useParams, } from 'react-router-dom';
import { BACKEND_URL } from "../env";


function Definitions() {
    const [word, setWord] = useState('');
    const [definitions, setDefinitions] = useState([]);
    const [error, setError] = useState(false);


    const { search } = useParams();
    useEffect(() => {
        if (search) {
            setWord(search);
            searchDefinition(null, search);
        }
    }, [search]);








    function searchDefinition(e: any, search?: string) {
        const localWord = search || word;
        const url = BACKEND_URL+'/definitions/' + localWord;
        fetch(url)
            .then(response => {

                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data.status === "error") {
                    setDefinitions([]);
                    setError(true);
                    console.log(error);
                    return;
                }
                setError(false);
                const definitions = JSON.parse(data.definitions);
                setDefinitions(definitions);
                // change the url
                window.history.pushState({}, '', '/definitions/' + word);
            })

    }
    const definitionListe = definitions.map((def: { title: string, definitions: string }, index: number) => (
        <Definition key={index} nom={def.title} liste={def.definitions} />
    ));


    return (
        <>
            <section style={{ width: "50%" }} className="text-center mt-5">
                <div>
                    <h1>Dictionnaire</h1>
                    <p>Cherchez ici les définitions des mots</p>
                </div>
                <input style={{ width: "50%", margin: "auto" }} id="wordField" onKeyDown={
                    (e) => {
                        if (e.key === "Enter") {
                            searchDefinition(null);
                        }
                    }

                } onChange={
                    (e) => {
                        setError(false);
                        setWord(e.target.value);
                    }

                } value={word} />
                <button onClick={searchDefinition}>Rechercher</button>
            </section>
            {(definitions.length > 0 || error) &&
                <section id="defSec" style={{ width: "50%", margin: "auto" }} className="text-center mt-5">
                    <h1>Définitions</h1>
                    <hr />
                    <ul>
                        {definitionListe}
                    </ul>
                    <div>
                        {error && <p>Aucune définition n'est disponible pour {word}</p>}

                    </div>
                </section>}
        </>
    );
}

export default Definitions;
