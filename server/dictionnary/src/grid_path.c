#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/grid_path.h"
#include "include/libs.h"

/**
 * @brief Vérifie si une position est dans la grille
 * @param Grid *grid - La structure grille à vérifier
 * @param int row - La position verticale
 * @param int col - La position horizontale
 * @return 0 si la position est dans la grille, 1 sinon
 *
 */
int checkBounds(Grid *grid, int row, int col)
{
    return (row < 0 || row >= grid->rows || col < 0 || col >= grid->cols);
}

/**
 * @brief Cherche récursivement si un mot est dans la grille
 * @details Regarde les voisins diagonaux et adjacents de la position donnée jusqu'à avoir trouvé le mot ou si toutes les cases sont épuisée
 * @param Grid *grid - Structure de la grille à chercher
 * @param int row - Ligne de la position initiale à chercher
 * @param int col - Colonne de la position initiale à chercher
 * @param char *word - Mot à chercher
 * @param int *found_positions - Liste des positions déjà trouvées de taille = à strlen(word)
 * @return int 0 si le mot a été trouvé, 1 sinon
 *
 *
 * **/
int grid_path_continue(Grid *grid, int row, int col, const char *word, int *found_positions)
{
    // Si le mot est vide, c'est qu'il a été entièrement trouvé dans la grille
    if (*word == '\0')
        return 1;
 
    int position = row * grid->cols + col;
    // printf("%s ", word);
    // Si la position actuelle est en dehors de la grille ou si le caractère actuel n'est pas le même que le caractère du mot, on arrête la recherche
    if (checkBounds(grid, row, col) || grid->letters[position] != *word)
        return 0;

    // On marque la position actuelle comme visitée
    // ca permet de ne pas revenir sur une position déjà visitée car on ne peut pas revenir sur une lettre déjà utilisée
    char buffer = grid->letters[position];
    grid->letters[position] = VISITED;

    // On check les voisins de la position actuelle
    int found = grid_path_continue(grid, row + 1, col, word + 1, found_positions) ||
                grid_path_continue(grid, row - 1, col, word + 1, found_positions) ||
                grid_path_continue(grid, row, col + 1, word + 1, found_positions) ||
                grid_path_continue(grid, row, col - 1, word + 1, found_positions) ||
                grid_path_continue(grid, row + 1, col + 1, word + 1, found_positions) ||
                grid_path_continue(grid, row - 1, col - 1, word + 1, found_positions) ||
                grid_path_continue(grid, row + 1, col - 1, word + 1, found_positions) ||
                grid_path_continue(grid, row - 1, col + 1, word + 1, found_positions);

    grid->letters[position] = buffer;

    // Si le mot a été trouvé, on ajoute la position actuelle à la liste des positions trouvées
    if (found)
        found_positions[strlen(word) - 1] = position;

    return found;
}

/**
 *@brief Change tous les 'QU' par un caractère spécial et décale les caractères suivants
 *@param char *word - Mot à nettoyer
 **/
void cleanWord(char *word)
{
    for (int i = 0; i < strlen(word); i++)
    {
        if (word[i] == 'Q' && word[i + 1] == 'U')
        {
            word[i] = QU;
            for (int j = i + 1; j < strlen(word); j++)
                word[j] = word[j + 1];
        }
    }
}

/**
 *@brief Change tous les 'QU' par un caractère spécial dans la grille
 *@param int argc - Nombre d'arguments
 *@param char **argv - Arguments
 *@param char *letters - Tableau de caractères à remplir
 **/
void cleanGrid(int argc, char **argv, char *letters)
{
    for (int i = 4; i < argc; i++)
    {
        letters[i - 4] = argv[i][0];
        // printf("%c ", letters[i - 4]);
        if (strcmp(argv[i], "QU") == 0)
        {
            letters[i - 4] = '&';
            continue;
        }
        letters[i - 4] = argv[i][0];
    }
}

/**
 * @brief Cherche un mot dans la grille et affiche les positions dans l'ordre
 * @param char *word - Mot à chercher
 * @param Grid *grid - Structure de la grille à chercher
 * @return int 0 si le mot a été trouvé, 1 sinon
 **/
int grid_path(char *word, Grid *grid,int verbose)
{
    int found_positions[strlen(word)];

    // Recherche du mot dans la grille
    for (int i = 0; i < grid->rows; i++)
    {
        for (int j = 0; j < grid->cols; j++)
        {
            if (grid_path_continue(grid, i, j, word, found_positions) && verbose)
            {
                // printf("Mot trouvé en commençant par la position (%d, %d)\n", i, j);
                // on a trouvé alors on affiche les positions dans le l'ordre (donc ordre inverse de la liste)
                for (int i = strlen(word) - 1; i >= 0; i--)
                    printf("%d ", found_positions[i]);
                printf("\n");
                return FOUND;
            }
        }
    }
    printf("%d", NOT_FOUND);
    return NOT_FOUND;
}

/**
 * @brief Affiche la grille
 * @param Grid *grid - Structure de la grille à afficher
 **/
void printGrid(Grid *grid)
{
    printf("Grille de %d lignes et %d colonnes:\n", grid->rows, grid->cols);
    for (size_t i = 0; i < grid->cols; i++)
    {
        for (size_t j = 0; j < grid->rows; j++)
        {
            if (grid->letters[i * grid->cols + j] == QU)
                printf("QU ");
            else
                printf("%c ", grid->letters[i * grid->cols + j]);
        }
        printf("\n");
    }
}

#ifndef EXTERNAL_DRIVER
int main(int argc, char **argv)
{
    // Vérification du nombre d'arguments
    if (argc < 5)
    {
        printf("Usage: %s <mot> <nombre de lignes> <nombre de colonnes> <grille>\n", argv[0]);
        return MISSING_PARAMS;
    }

    Grid grid;
    // Récupération des arguments
    grid.rows = atoi(argv[2]);
    grid.cols = atoi(argv[3]);
    grid.size = grid.rows * grid.cols;
    grid.letters = malloc((grid.size + 1) * sizeof(char));
    char *word = argv[1];
    // On remplace les QU par un caractère spécial
    cleanWord(word);
    // Vérification de la longueur du mot
    if (strlen(word) > grid.size)
    {
        printf("Le mot ne doit pas dépasser %d caractères\n", grid.size);
        return WRONG_PARAMS;
    }

    // printf("Mot à chercher: %s\n", word);
    char letters[argc - 4];
    // On fait pareil pour la grille
    cleanGrid(argc, argv, letters);
    strncpy(grid.letters, letters, grid.size); // On met le résultat dans la struct
    grid.letters[grid.size] = '\0'; // On ajoute le caractère nul de fin de chaîne
    // printGrid(&grid);
    int result = grid_path(word, &grid, 1);
    free(grid.letters);
    // printf("%d", result);
    return OK;
}

#endif


// int main(int argc, char *argv[])
// {
//     if (argc < 4)
//     {
//         printf("Usage: %s grid_file rows cols word1 [word2 ...]\n", argv[0]);
//         exit(EXIT_FAILURE);
//     }

//     char *grid_file = argv[1];
//     int rows = atoi(argv[2]);
//     int cols = atoi(argv[3]);

//     // Alloue suffisamment d'espace pour stocker la chaîne de caractères d'entrée
//     int word_length = strlen(argv[4]);
//     char *word = malloc(word_length + 1);
//     strcpy(word, argv[4]);

//     // Utilisez la chaîne de caractères allouée pour effectuer les opérations nécessaires
//     // ...

//     free(word); // N'oubliez pas de libérer la mémoire allouée après utilisation
//     return 0;
// }
