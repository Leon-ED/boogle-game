# Jeu Boogle
Boogle, reproduction du célèbre jeu  **Boggle** où le but est de trouver le plus de mots présents dans une grille de 4*4 lettres en un temps imparti.
Ce projet a été réalisé dans le cadre de la SAÉ unique de la 2ème année de BUT Informatique à l'Université Gustave Eiffel

# Structure du dépôt
Ce dépôt comporte deux parties : 
- **Client** comporte le code Réact afin de faire tourner la partie frontend du projet.
- **Server** comporte de quoi faire tourner le backend du projet, développé ici en NodeJS (Express)

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

# Information
Le server est fait pour fonctionner dans un environnement UNIX (Linux, MacOS), il faudra donc le lancer sur un système compatible ou via docker
## Implémentations
Voici ce qui est implémenté actuellement :
- Création, connexion et déconnexion à un compte
- Partie rapide : Choix de la taille de la grille, affichage des mots trouvés
- Dictionnaire : Partie qui permet de chercher la définition des mots (page dédiée, ou clic sur un mot trouvé lors d'une partie)
- Chat global entre utilisateurs authentifiés
- Partie multijoueur : Lien d'invitation, choix de la taille de la grille, du temps, de la politique de score et de d'autres paramètres.
- Lobby, tant que le créateur de la partie multijoueurs, ne l'a pas décidé, tous les joueurs sont en attente dans le lobby avec un chat de lobby et visualisation en direct des paramètres.
- Partie multijoueur, une fois la partie multijoueurs lancée, les joueurs se voient afficher la grille

## Reste à faire
- Enregistrment des parties dans le compte des joueurs respectifs
- Création d'un page de gestion de compte : (public,privé, changement de photo de profil, pseudos), affichage des parties jouées et de tous leurs paramètres
- Afficher les joueurs dans la partie en cours (photo de profil, pseudos), afficher leurs propositions et leur score



