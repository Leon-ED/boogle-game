import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { ViewAccount } from "../components/OtherAccount";
import { MyAccount } from "../components/OwnAccount";

export const Account = () => {
    const idUser = useParams<{ id: string }>().id;
    const [title, setTitle] = useState<string>("Votre compte");
    const [isMyAccount, setIsMyAccount] = useState<boolean>(true);
    useEffect(() => {
        if (!idUser){
            setIsMyAccount(true);
            return;
        }
        setIsMyAccount(false);
        setTitle("Compte de " + idUser);
    }, []);



    return (
        <>
        <section>
            <h1>{title}</h1>
        </section>
        {isMyAccount && <MyAccount />}
        {!isMyAccount && <ViewAccount />}
        
        </>
    );



}