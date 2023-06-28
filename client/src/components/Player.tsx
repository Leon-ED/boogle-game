import { Link } from "react-router-dom";
import { BACKEND_URL } from "../env"

export const Player = ({idUser, name}: {idUser: string, name: string}) => {
    let shortName = name;
    let imgClasse = "";
    if(name.length > 10){
        shortName = name.substring(0, 10) + "...";
    }
    if(JSON.parse(localStorage.getItem("user")!).idUser === idUser){
        shortName = "Moi";
        imgClasse = "me";
    }


    return(
        <div className="lobby-player">
            <img  src={BACKEND_URL+"/account/get/image/"+idUser} alt="profile" />
            <Link to={"/account/"+idUser}><p style={{margin:"0"}} className={imgClasse} data-fullname={name}>{shortName}</p></Link>
        </div>



    )
}