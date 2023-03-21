# Jeu Boogle
Boogle, reproduction du célèbre jeu  **Boggle** où le but est de trouver le plus de mots présents dans une grille de 4*4 lettres en un temps imparti.
Ce projet a été réalisé dans le cadre de la SAÉ unique de la 2ème année de BUT Informatique à l'Université Gustave Eiffel

# Structure du dépôt
Ce dépôt comporte deux parties : 
- **Client** comporte le code Réact afin de faire tourner la partie frontend du projet.
- **Server** comporte de quoi faire tourner le backend du projet, développé ici en NodeJS

## Mise en place
Afin de faire tourner ce projet il est nécessaire de disposer de [NodeJS](https://nodejs.org/en) ainsi que de [Docker](https://www.docker.com/)
Une fois ces outils installés il ne reste qu'à configurer les différentes variables d'environnements qui sont pour le `client` dans le fichier 

> client/src/env.tsx 

Et pour le `server` dans :

> server/.env


Se placer ensuite dans le dossier global et exécuter la commande :

    docker-compose up
Par défaut le frontend est sur le port `8080` et le backend sur le port `3000`

Ne pas oublier de se connecter sur le PHPMyAdmin afin d'installer la base de données qui se trouve dans le dossier `bdd`



