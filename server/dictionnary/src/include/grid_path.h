#include <stdlib.h>
#include <stdio.h>


#define QU '&'
#define VISITED '@'
#define FOUND 0
#define NOT_FOUND 1
// Définition de la structure de données représentant la grille de caractères

typedef struct
{
    int rows;
    int cols;
    char *letters;
    int size;
} Grid;

int grid_path(char *word, Grid *grid,int verbose);