import React from 'react';

function Definition(props: { nom: string, liste: string }) {
    console.log(props);
    const sousDefinitions = Object.keys(props.liste).map((key:any, index) => (
        <SousDefinition key={index} type={key} definition={props.liste[key]} />
    ));

    

    return (
        <div className="definitions">
            <h1 className='def_nom' onClick={copyLink}>{props.nom}</h1>
            <div className="sous-definitions-liste">
                {sousDefinitions}
            </div>
        </div>
    );

function copyLink(e : React.MouseEvent<HTMLHeadingElement, MouseEvent>){
    const text = window.location.href;
    navigator.clipboard.writeText(text);
    const el = e.target as HTMLHeadingElement;
    el.classList.add('copied');
    setTimeout(() => {
        el.classList.remove('copied');
    }
        , 1000);


}


}

function SousDefinition(props: any) {

    // replace [[mot|Mot]] by <a href="mot2">mot</a> or [[mot]] by <a href="mot">mot</a>
    const liste2 = props.definition.map((def: string, index: number) => {
        let newDef = def;
        const regex = /\[\[(.*?)\]\]/g;
        const regex2 = /\[\[(.*?)\|(.*?)\]\]/g;
        const matches = def.match(regex);
        const matches2 = def.match(regex2);
        newDef = newDef.replace(/{{.*?}}/g, "");
        if (matches) {
            matches.forEach((match) => {
                // if matches contains . or : , remove match
                if (match.includes(".") || match.includes(":")) {
                    newDef = newDef.replace(match, "");
                    return;
                }



                const word = match.replace("[[", "").replace("]]", "");
                const word2 = word.split("|")[0];
                newDef = newDef.replace(match, `<a href="/definitions/${word2}">${word2}</a>`);
            });
        }
        if (matches2) {
            
            matches2.forEach((match) => {
                if (match.includes(".") || match.includes(":")) {
                    newDef = newDef.replace(match, "");
                    return;
                }
                const word = match.replace("[[", "").replace("]]", "").split("|")[1];
                const word2 = word.split("|")[0];
                newDef = newDef.replace(match, `<Link to="/definitions/${word2}">${word2}</Link>`);
            });
        }
        return (
            <li key={index} dangerouslySetInnerHTML={{ __html: newDef }}></li>
        );
    });



    const liste = liste2.map((def: string, index: number) => (
        <li key={index}>{def}</li>
    ));


    return (
        <div className="sous-definitions">
            <h3>{props.type}</h3>
            <ul>
                {liste}
            </ul>


        </div>
    );
}

export default Definition;
