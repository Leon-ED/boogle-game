#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/solve.h"
#include "include/trees.h"
#include "include/grid_path.h"






void readEachWordInCSTree(CSTree *tree, char word[], int max_word_len, int level)
{
    if (*tree == NULL)
        return;

    char letter = (*tree)->elem;
    if (strlen(word) >= max_word_len)
        return;

    if (letter == '\0')
    {
        printf("%s \n", word);
    }

    word = realloc(word, sizeof(char) * (strlen(word) + 1));
    word[strlen(word)] = letter;
    word[strlen(word) + 1] = '\0';

    readEachWordInCSTree(&(*tree)->firstChild, word, max_word_len, level + 1);
    readEachWordInCSTree(&(*tree)->nextSibling, word, max_word_len, level + 1);
}





/**
 *
 * @brief Parcours un CSTree et appelle grid_path pour chaque mot trouvé s'il est plus grand ou égal à min_word_len
 * @param grid Grille de jeu
 * @param tree Arbre de recherche
 * @param min_word_len Taille minimale des mots à trouver
 * **/
void solve_rec(Grid *grid, CSTree *tree, int min_word_len, char word[], int max_word_len,int level)
{
    if (*tree == NULL) {
        // printf("Arbre vide \n");
        return;
    }

    if(strlen(word) >= max_word_len){
        // printf("Mot trop long : %s ee \n", word);
        return;

    }

    char letter = (*tree)->elem;
    printf("%c", letter);
    if (letter == '\0')
    {
        if (strlen(word) >= min_word_len)
        {
            printf("%s \n", word);
            if(grid_path(word, grid,0) == 0)
                printf("Mot trouvé : %s \n", word);
        }
    }
    // char *new_word = malloc(sizeof(char) * (strlen(word) + 2));
    // strcpy(new_word, word);
    // new_word[strlen(new_word)] = letter;
    // new_word[strlen(new_word) + 1] = '\0';
    // printf("new_word : %s \n", new_word);
    solve_rec(grid, &(*tree)->firstChild, min_word_len, "", max_word_len, level + 1);
    printf(" \n");
    if(level > -1){
        // char empty_word[max_word_len];
        solve_rec(grid, &(*tree)->nextSibling, min_word_len, "empty_word", max_word_len, level + 1);
    }
    // free(new_word);
    // free(word);



}


int solve(Grid *grid, CSTree *tree, int min_word_len)
{
    // char *word = malloc(sizeof(char));
    // word[0] = '\0';
    // readEachWordInCSTree(tree, "", 50, 0);
    solve_rec(grid, tree, min_word_len,"", grid->size,0);
    // free(word);
    return 0;
}

/**
 * @bug : MARCHE PAS
 ***/
int main(int argc, char const *argv[])
{
    if (argc < 6)
    {
        printf("Usage: %s <dico.lex> <taille_mot> <num_lignes> <num_columns> <grille>\n", argv[0]);
        return 1;
    }

    FILE *dico_LEX = fopen(argv[1], "rb");
    if (dico_LEX == NULL)
    {
        printf("Erreur : Erreur lors de l'ouverture du fichier, le chemin spécifié (%s) est-il correct ? \n", argv[1]);
        return 0;
    }
        int taille_mot = atoi(argv[2]);
    int rows = atoi(argv[3]);
    printf("rows : %d \n", rows);
    int cols = atoi(argv[4]);
    printf("cols : %d \n", cols);
    Grid grid;
    grid.rows = rows;
    grid.cols = cols;
    grid.letters = malloc(rows * cols * sizeof(char));
    char letters[argc - 4];
    for (int i = 5; i < argc; i++)
    {
        if ((i - 1) % 4 == 0 && i != 5)
            printf("\n");

        letters[i - 5] = argv[i][0];
        if (strcmp(argv[i], "QU") == 0)
        {
            letters[i - 5] = '&';
            printf("%c ", letters[i - 5]);
            continue;
        }
        printf("%c ", letters[i - 5]);
        letters[i - 5] = argv[i][0];
    }
    strcpy(grid.letters, letters);
    StaticTree tree = importStaticTreeFromFile(dico_LEX);
    // printStatic(tree,0);
    CSTree cstree = importStaticTree(tree);
    solve(&grid, &cstree, 3);
    // printPrefix(cstree);





    // List *list_all_words = NULL;

    // for (int i = 0; i < rows; i++)
    // {
    //     for (int j = 0; j < cols; j++)
    //     {
    //         findAllWordInGrid(&grid, i, j, &list_all_words, dico_LEX, taille_mot);
    //     }
    // }

    // solve(taille_mot, num_lines, num_columns, lettres, dico_LEX);
}