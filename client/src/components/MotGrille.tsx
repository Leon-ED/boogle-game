
function Mot( {mot, index}: {mot: string, index: number} ) {
    const lien:string = "./definitions/" + mot;
    return (
        <div className="mot" key={index}>
            <a href={lien} target="_blank">{mot}</a>
        </div>
    )

}

export default Mot;