import { BACKEND_URL } from "./env"
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


export const getGameUUID = async (): Promise<string> => {
    return fetch(BACKEND_URL + "/jeu/create", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
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