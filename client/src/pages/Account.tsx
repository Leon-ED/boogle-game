import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
//import { ViewAccount } from "../components/OtherAccount";
//import { MyAccount } from "../components/OwnAccount";
import { ViewAccount } from "../components/ViewAccount";

export const Account = () => {
    const idUser = useParams<{ id: string }>().id;
    const [title, setTitle] = useState<string>("");
    const [isMyAccount, setIsMyAccount] = useState<boolean>(true);
    const navigate = useNavigate();
    useEffect(() => {
        if (!idUser){
            // get from local storage
            console.log(localStorage.getItem("user"));
            let user = localStorage.getItem("user");
            if (user) {
                const userObj = JSON.parse(user);   
                window.location.href = "/account/" + userObj.idUser;          
                return;
            }
        }
        // check if there is a user in local storage
        else {
            let user = localStorage.getItem("user");
            if (user) {
                const userObj = JSON.parse(user);   
                if (userObj.idUser == idUser) {
                    setIsMyAccount(true);
                    setTitle("Mon compte");
                    return
                }  
            }
            
            setIsMyAccount(false);
            setTitle("Visualisation d'un profil");
            return;

        }
    }, []);



    return (
        <>
        <section>
            <h1>{title}</h1>
        </section>
        
        {/* {isMyAccount && <MyAccount />} */}
        {/* {!isMyAccount && <ViewAccount />} */}
        {idUser && <ViewAccount isMyAccount = {isMyAccount} idUser = {idUser}/>}
        
        </>
    );



}