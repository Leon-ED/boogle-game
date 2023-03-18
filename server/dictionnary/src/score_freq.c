#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/libs.h"

/**
 * @brief Calcule le score des mots fournis
 * @details Le score d'un mot est calculé en fonction de la fréquence de chaque lettre
 * @todo faire la fonction
 **/
int getScore(FILE *freq_FILE, char *wordList[])
{

    return NULL;
}

int main(int argc, char *argv[])
{
    if (argc <= 2)
    {
        return MISSING_PARAMS;
    }
    FILE *freq_FILE = fopen(argv[1], "r");
    if (freq_FILE == NULL)
    {
        return FILE_NOT_FOUND;
    }

    return getScore(freq_FILE, argv + 2);
}