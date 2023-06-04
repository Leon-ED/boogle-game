import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../env";
import { GameOverview } from "./GameOverview";

interface User {
    idUser: string;
    pseudoUser: string;
    email: string;
    photoProfil: string;
    hash: string;
}
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


export const MyAccount = () => {
    const [user, setUser] = useState<User | null>(null);
    const [image, setImage] = useState<string>();
    const [playedGames, setPlayedGames] = useState<Array<FullGame> | null>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const userOBj: User = JSON.parse(user);
            fetch(BACKEND_URL + "/jeu/fetchAll/" + userOBj.idUser)
            .then((res) => res.json())
            .then((res) => {
                setPlayedGames(res.games);
            })
            setImage(BACKEND_URL + "/account/get/image/" + userOBj.idUser);
            setUser(userOBj);
        } else {
            setUser(null);
        }
    }, []);





    if (!user) {
        navigate("/login");
        return null;
    }




    return (
        <>
            <section>
                <h2>Bienvenue {user.pseudoUser}</h2>
            </section>
            <section>
                <div className="profile-container">
                    <div className="profile-picture">
                        <img onClick={uploadPicture} src={image} alt="profile" />
                    </div>
                    <div className="profile-info">
                        <div className="profile-info-item">
                            <h4>Email: <span className="profile-info-item-value">{user.email}</span></h4>
                        </div>
                        <div className="profile-info-item">
                            <h4>Parties jouées : <span className="profile-info-item-value">{playedGames == null ? 0 : playedGames.length}</span></h4>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <h2>Mes parties</h2>
            </section>
            {playedGames == null ? <section><h2>Vous n'avez pas encore joué de parties</h2></section> :
            playedGames.map((game) => {
                return(<GameOverview key={game.idPartie} {...game} />)
            })
            
            }
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
}