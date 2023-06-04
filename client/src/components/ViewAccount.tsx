import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../env";
import { GameOverview } from "./GameOverview";
import { getUserInfo } from "../functions";

interface User {
  idUser: string;
  pseudoUser: string;
  email: string;
  photoProfil: string;
}

interface FullGame {
  idPartie: string;
  idVainqueur: string;
  dimensionsGrille: string;
  motsTrouves: string;
  Grille: Array<Array<string>>;
  politiqueScore: string;
  DateDebutPartie: string;
  temps: number;
  DateFinPartie: string;
  gameAdmin: string;
  users: Array<string>;
  bloquerMots: boolean;
  statut: string;
}

export const ViewAccount = (props: { isMyAccount: boolean; idUser: string }) => {
  const [user, setUser] = useState<User>();
  const [image, setImage] = useState<string>();
  const [playedGames, setPlayedGames] = useState<Array<FullGame> | null>([]);
  const navigate = useNavigate();

  console.log(props.isMyAccount);

  if (props.idUser == undefined) {
    return null;
  }

  useEffect(() => {
    getUserInfos(props.idUser);
  }, []);

  useEffect(() => {
    if (user) {
        console.log(user);

      fetch(BACKEND_URL + "/jeu/fetchAll/" + user.idUser)
        .then((res) => res.json())
        .then((res) => {
          setPlayedGames(res.games);
        });
      setImage(BACKEND_URL + "/account/get/image/" + user.idUser);
    }
  }, [user]);

  return (
    <>
      {user && (
        <>
          {props.isMyAccount && <section>
          <h2>Bienvenue {user.pseudoUser}</h2>
          </section>}
          <section>
            <div className="profile-container">
              <div className="profile-picture">
                <img onClick={props.isMyAccount ? uploadPicture : undefined} src={image} alt="profile" />
              </div>
              <div className="profile-info">
                <div className="profile-info-item">
                  {props.isMyAccount && <h4>
                    Email: <span className="profile-info-item-value">{user.email}</span>
                  </h4>}
                </div>
                <div className="profile-info-item">
                  <h4>
                    Parties jouées :{" "}
                    <span className="profile-info-item-value">
                      {playedGames ? playedGames.length : 0}
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2>Parties récentes</h2>
          </section>
          {playedGames ? (
            playedGames.map((game) => <GameOverview game={game} />)
          ) : (
            <section>
              <h2>Vous n'avez pas encore joué de parties</h2>
            </section>
          )}
        </>
      )}
    </>
  );

  function uploadPicture() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";
    fileInput.addEventListener("change", (e) => {
      const file = fileInput.files?.item(0);
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("token", localStorage.getItem("token") || "");
        fetch(BACKEND_URL + "/account/upload", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((res) => {
            setImage(BACKEND_URL + "/account/get/image/" + user?.idUser + "?" + Date.now());
          });
      }
    });
    fileInput.click();
  }

  async function getUserInfos(id: string) {
    let userInfos = await getUserInfo(id);
    console.log(userInfos);
    setUser(userInfos);
  }
}
