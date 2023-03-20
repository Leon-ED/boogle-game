import React from 'react';

function Definition(props: { nom: string, liste: any }) {

    const sousDefinitions = Object.keys(props.liste).map((key, index) => (
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
    const liste = props.definition.map((def: string, index: number) => (
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
