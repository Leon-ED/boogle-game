import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserInfo } from "../functions";
import { BACKEND_URL } from "../env";
interface User {
    idUser: string;
    login: string;
    photoProfil: string;
}

export const ViewAccount = () => {
    const [user, setUser] = useState<User | null>(null);
    const [image, setImage] = useState<string>();
    const idUser = useParams().id;
    const navigate = useNavigate();

    useEffect(() => {
        if(!idUser) {
            return navigate("/");
        }
        getUserInfo(idUser).then((user) => {
            if (user) {
                setImage(BACKEND_URL + "/account/get/image/" + user.idUser);
                setUser(user);
            } else {
                setUser(null);
                return navigate("/");
            }
        });

    }, []);

    return (
        <>
            <section>
                <h2>Profil de  {user?.login}</h2>
            </section>
            <section>
                <div className="profile-container">
                    <div className="profile-picture">
                        <img src={image} alt="profile" />
                    </div>
                    <div className="profile-info">
                        <div className="profile-info-item">
                            <h4>Parties jouées : <span className="profile-info-item-value">Pas d'informations</span></h4>
                        </div>
                    </div>


                </div>
            </section>
        </>
    );
}