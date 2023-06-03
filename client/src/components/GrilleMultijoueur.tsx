import { useEffect, useState } from "react";
import { BACKEND_URL } from "../env";
import Mot from "./MotGrille";

interface GrilleProps {
  lignes: number;
  colonnes: number;
  grilleProps: Array<string>;
  onWordSent: (word: string) => void;
  children?: React.ReactNode;
  temps: number;
}

export const GrilleMultijoueur = ({
  lignes,
  colonnes,
  grilleProps,
  onWordSent,
  children,
  temps,
}: GrilleProps) => {
  const [inputWord, setInputWord] = useState<string>("");
  const [grille1D, setGrille1D] = useState<Array<string>>([]);
  const [grille2D, setGrille2D] = useState<Array<Array<string>>>(
    Array(lignes).fill(Array(colonnes).fill("X"))
  );
  const [wordsList, setWordsList] = useState<Array<string>>([]);
  const [tempsRestant_str, setTempsRestant_str] = useState<string>("00:00");
  const [tempsRestant, setTempsRestant] = useState<number>(3);

  useEffect(displayGrid, [grilleProps]);
  useEffect(initTimer, []);
  useEffect(() => {
    setTempsRestant(parseInt(temps.toString()));
    }, [temps]);

  useEffect(() => {
    setTempsRestant_str(getMinAndSecondsFromMS(tempsRestant));
  }, [tempsRestant]);

  function initTimer() {
    setTempsRestant(parseInt(temps.toString()));
    const interval = setInterval(() => {
      setTempsRestant((prevTempsRestant) => prevTempsRestant - 1000);
      if(tempsRestant <= 0){
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }

  function displayGrid() {
    let updatedGrilleProps = grilleProps;
    if (grilleProps[grilleProps.length - 1] === "\n") {
      updatedGrilleProps = grilleProps.slice(0, -1);
    }

    if (updatedGrilleProps.length === 0 || !updatedGrilleProps) {
      return;
    }

    const newGrille2D = [];
    for (let i = 0; i < lignes; i++) {
      const row = updatedGrilleProps.slice(i * colonnes, (i + 1) * colonnes);
      newGrille2D.push(row);
    }

    setGrille2D(newGrille2D);
    setGrille1D(updatedGrilleProps);
  }

  function verifierMot() {
    onWordSent(inputWord);
    setInputWord("");
    return;
  }

  return (
    <section id="grille-sec">
      <h1>Temps: {tempsRestant_str}</h1>
      <div id="grille-sec-container">
        <div id="grille" className="grille">
          {grille2D.map((ligne, index) => {
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
          <input
            type="text"
            id="word"
            placeholder="Mot"
            onChange={(e) => {
              setInputWord(e.target.value);
            }}
            value={inputWord}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                verifierMot();
              }
            }}
          />
        </div>
        {children}
      </div>
    </section>
  );
};

function getMinAndSecondsFromMS(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  const secondsStr = secondsLeft < 10 ? "0" + secondsLeft : secondsLeft;
  return minutesStr + ":" + secondsStr;
}
