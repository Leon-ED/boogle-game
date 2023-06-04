import { useEffect, useState } from "react";

export const Grid = ({grille,colonnes,lignes} : {grille:Array<Array<string>>, colonnes: number, lignes:number}) => {
    const [grille2D, setGrille2D] = useState<Array<Array<string>>>(
        Array(lignes).fill(Array(colonnes).fill("X"))
      );
    


    return(
    <section style={{display:"flex", justifyContent:"center"}}>
        <div id="grille" className="grille">
        {grille.map((ligne, index) => {
          return (
            <div className="ligne" key={index}>
              {ligne.map((colonne, index) => {
                return (
                  <div className="case" key={index}>
                    <span>{colonne}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
    )


}