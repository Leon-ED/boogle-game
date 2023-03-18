import { redirect } from 'react-router-dom';
export function logout(){
    console.log(localStorage);
    if(localStorage.getItem('token') === null){
        
        return redirect('/login');
    }


    console.log('logout');
    // On appelle la fonction logout du back-end
    fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });


    // On supprime le token du localStorage
    localStorage.removeItem('token');
    // On redirige l'utilisateur vers la page d'accueil
    return redirect('/');

}


export function checkAuth(noAuthNeeded: any = false){
    console.log('logout');

    fetch('http://localhost:3000/api/auth/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`

        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.auth === false && noAuthNeeded === false){
        
            redirect('/login');
        } else if(data.auth === true && noAuthNeeded === true){
            redirect('/');
        }
    }
    )
    


}