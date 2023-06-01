import { BACKEND_URL } from "./env"
import useWebSocket from 'react-use-websocket';

export const auth = async (): Promise<boolean> => {
    return fetch(BACKEND_URL + "/auth/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
        }),
    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        if (data.status === "success") {
            return true;
        } else {
            return false;
        }
    }
    );
}
interface Response {
    status: string,
    message: string,
    game: GameDB,
}
interface GameDB {
    admin :boolean
    gameAdmin : string
    idPartie : string

}
export const verifGameID = async (gameID: string): Promise<Response> => {
    return fetch(BACKEND_URL + "/jeu/verifID", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uuid: gameID,
            token: localStorage.getItem("token"),
        }),
    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        return data;
        
    }
    );
}


export const getGameUUID = async (): Promise<string> => {
    return fetch(BACKEND_URL + "/jeu/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
        }),

    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        if (data.status === "success") {
            return data.uuid;
        } else {
            return "";
        }
    }
    );
}


export const isGameAdmin = async (gameID: string): Promise<boolean> => {
    return fetch(BACKEND_URL + "/jeu/isAdmin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
            uuid: gameID,
        }),

    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        if (data.status === "success") {
            return data.isAdmin;
        } else {
            return false;
        }
    }
    );
}


export const getProfilePicture = async (): Promise<File> => {
    return fetch(BACKEND_URL + "/profile/getProfilePicture", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
        }),

    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        if (data.status === "success") {
            return data.file;
        } else {
            return null;
        }
    }
    );
}

interface User {
    idUser: string;
    login: string;
    photoProfil: string;
}




export const getUserInfo = async (idUser:string): Promise<User> => {
    return fetch(BACKEND_URL + "/account/get/profile/"+idUser, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }

    }).then((response) => {
        return response.json();
    }
    ).then((data) => {
        if (data.status === "success") {
            return data.data;
        } else {
            return null;
        }
    }
    );

}
