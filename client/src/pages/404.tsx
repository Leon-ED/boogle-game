import { useEffect, useState } from "react";
import Definition from "../components/Definition";
import { BACKEND_URL } from "../env";

function Error404() {
    const definition= {
        "nom": "fourvoyer",
        "liste": {
            "verbe": [
                "[[égarer|Égarer]], [[détourner]] du bon [[chemin]].",
                "{{figuré|fr}} [[tromper|Tromper]], [[égarer]]."
            ]
        }
    }
    useEffect(() => {
        document.title = "Boogle - 404";
    }, []);
    

    
    return (
        <div>
            <section>
                <h1>Erreur 404</h1>
            </section>
            <section>
                <p className="center">La page que vous cherchez n'existe pas.</p>
                <h3>Voici une définition</h3>
                {/* @ts-ignore */}
                <Definition nom={definition.nom} liste={definition.liste} />
            </section>


        </div>
    );
}

const getRandomDefinition = async () => {
    const response = await fetch(BACKEND_URL + "/api/definitions/random");
    const data = await response.json();
    console.log(data);
    return data;
}

export default Error404;