import React from 'react';
import { useNavigate } from 'react-router-dom';


export default function Logout() {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log(localStorage);

    if (localStorage.getItem('token') === null) {
      navigate('/', { replace: true });
      return;
    }

    console.log('logout');
    // On appelle la fonction logout du back-end
    fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    // On supprime le token du localStorage
    localStorage.removeItem('token');

    // On redirige l'utilisateur vers la page d'accueil
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}