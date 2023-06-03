import React, { useEffect, useState } from "react";
import { FRONT_HOST } from "../env";
import { getGameUUID } from "../functions";

interface Settings {
  lignes: number;
  colonnes: number;
  temps: number;
  gameID: string;
  bloquerMots: boolean;
  politiqueScore: number;
}

export const GrilleSettings = ({
  settings,
  onSettingsChange,
  gameID,
  isAdmin,
  isStarted,
}: {
  settings: Settings;
  onSettingsChange: Function;
  gameID: string;
  isAdmin: boolean;
  isStarted: Function;
}) => {
  const [colonnes, setColonnes] = useState<number>(4);
  const [lignes, setLignes] = useState<number>(4);
  const [time, setTime] = useState<number>(3);
  const [politiqueScore, setPolitiqueScore] = useState<number>(1);
  const [bloquerMots, setBloquerMots] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setLignes(settings.lignes);
      setColonnes(settings.colonnes);
      setTime(settings.temps);
      setPolitiqueScore(settings.politiqueScore);
      setBloquerMots(settings.bloquerMots);
    }
  }, [settings]);

  useEffect(() => {
    onSettingsChange({
      lignes,
      colonnes,
      temps: time,
      politiqueScore,
      bloquerMots,
    });
  }, [lignes, colonnes, time, politiqueScore, bloquerMots]);

  const handlePolitiqueScoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPolitiqueScore(parseInt(e.target.value));
  };

  const handleBloquerMotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBloquerMots(e.target.checked);
  };

  const handleStart = () => {
    isStarted(true);
  };

  return (
    <>
      <h3>Paramètres</h3>
      <div className="grille-header">
        <div className="grille-header-container">
          <label htmlFor="largeur">Lignes</label>
          <input
            name="lignes"
            value={lignes}
            min="2"
            max="10"
            type="number"
            onChange={(e) => setLignes(parseInt(e.target.value))}
            disabled={!isAdmin}
          />
        </div>
        <div className="grille-header-container">
          <label htmlFor="largeur">Colonnes</label>
          <input
            type="number"
            name="colonnes"
            value={colonnes}
            min="2"
            max="10"
            onChange={(e) => setColonnes(parseInt(e.target.value))}
            disabled={!isAdmin}
          />
        </div>
        <div className="grille-header-container">
          <label htmlFor="temps">Temps</label>
          <input
            type="number"
            name="temps"
            max = "10"
            min = "1"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
            disabled={!isAdmin}
          />
        </div>
        <div className="grille-header-container">
          <label htmlFor="lien">Politique de score</label>
          <select
            name="politique"
            id="politique"
            value={politiqueScore}
            onChange={handlePolitiqueScoreChange}
            disabled={!isAdmin}
          >
            <option value={1}>1 point par mot</option>
            <option value={2}>2 points par mot</option>
            <option value={3}>3 points par mot</option>
          </select>
        </div>
        <div className="grille-header-container">
          <label htmlFor="bloquer-mots">Bloquer les mots</label>
          <input
            type="checkbox"
            name="bloquer-mots"
            checked={bloquerMots}
            onChange={handleBloquerMotsChange}
            disabled={!isAdmin}
          />
        </div>
        {isAdmin && (
          <div className="grille-header-container">
            <button onClick={handleStart} disabled={!lignes || !colonnes || !time}>
              Démarrer
            </button>
          </div>
        )}
      </div>
    </>
  );
};
