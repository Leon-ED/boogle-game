import { useNavigate } from "react-router-dom";
import moment from "moment";


interface FullGame {
  idPartie: string;
  idVainqueur: string;
  dimensionsGrille: string;
  motsTrouves: string;
  Grille: Array<Array<string>>
  politiqueScore: string;
  DateDebutPartie: string;
  temps: number;
  DateFinPartie: string;
  gameAdmin: string;
  users: Array<string>;
  bloquerMots: boolean;
  statut: string;
}

export const GameOverview = ({ game }: { game: FullGame }) => {

  // convert game.users to array (it's a string in the database)
  if (typeof game.users === "string") {
    game.users = game.users.split(",");
  }

  console.log(game);

  const formattedDate = moment(game.DateDebutPartie).format("DD MMMM YYYY [à] HH[h]mm:ss");
  console.log(formattedDate); // Output: 06 Avril 2023 à 14h52:56


  const navigate = useNavigate();

  return (
    <section className="game-overview" onClick={viewRecap} style={{ cursor: "pointer" }}>
      <p>Partie jouée le {formattedDate}</p>
      <p>Dimensions : {game.dimensionsGrille}</p>
      <p>Temps : {game.temps} min</p>
      <p>{game.users.length} participant(s)</p>
    </section>
  );

  function viewRecap() {
    navigate("/recap/" + game.idPartie);
  }
};



