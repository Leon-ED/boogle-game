import { BACKEND_URL } from "../env"

export const Player = ({idUser, name}: {idUser: string, name: string}) => {
    let shortName = name;
    if(name.length > 10){
        shortName = name.substring(0, 10) + "...";
    }


    return(
        <div className="lobby-player">
            <img src={BACKEND_URL+"/account/get/image/"+idUser} alt="profile" />
            <p data-fullName={name}>{shortName}</p>
        </div>



    )
}