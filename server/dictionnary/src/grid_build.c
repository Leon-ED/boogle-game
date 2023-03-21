#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/grid_build.h"
#include <math.h>
#include <time.h>
#include <sys/time.h>

/**
 * @brief Créé une grille de lettres aléatoires en fonction d'un fichier de lettres et de leur nombre d'occurence
 * @param file : fichier de lettres et de leur nombre d'occurence
 * @param num_lines : nombre de lignes à avoir dans la grille
 * @param num_columns : nombre de colonnes à avoir dans la grille
 * @return 0 si tout s'est bien passé, sinon une erreur
 *
 *
 * @todo : Faire en sorte d'avoir un peu plus de a,e
 * **/
int grid_build(FILE *file, int num_lines, int num_columns)
{
    // Allocation mémoire
    int num_lines2 = 35;
    Letter_occurence counts[num_lines2];
    float total_count = 0.0f;
    Letter_occurence *counts_ptr = counts;
    // On lit le fichier ligne par ligne et on récupère les 2 premières caractères et le nombre d'occurence
    // On mets tout ça dans le tableau
    char line[16];
    int i = 0;
    while (fgets(line, sizeof(line), file) != NULL)
    {
        
        float item_pc;
        sscanf(line, "%2s %f", counts[i].letter, &item_pc);
        total_count += item_pc;
        counts[i].count = total_count;

        i++;
        // counts[i].count = total_count + counts[i].count;
        // printf("%s %f \n", counts[i].letter, counts[i].count);
    }
    struct timeval tps;
    gettimeofday(&tps, NULL);
    fclose(file);
    srand((((long long)tps.tv_sec) * 1000) + (tps.tv_usec / 1000));
    

    for (int i = 0; i < num_lines; i++)
    {
        for (int j = 0; j < num_columns; j++)
        {

            float random = rand() % 101;
            for (int i = 0; i < num_lines2; i++)
            {
                if (random <= counts[i].count)
                {
                    printf("%s ", counts[i].letter);
                    break;
                }
            }
        }
    }


    return 0;
}

int main(int argc, char *argv[])
{

    FILE *freq_FILE = NULL;
    int nbLines = 0;
    int nbCol = 0;

    if (argc > 4)
    {
        printf("GRID_BUILD : Trop d'arguments\nSyntaxe : grid_build <fichier> <nbLignes> <nbColonnes> \n");
        return 4;
    }
    if (argc < 4)
    {
        printf("GRID_BUILD : Pas assez d'arguments\nSyntaxe : grid_build <fichier> <nbLignes> <nbColonnes> \n");
        return 4;
    }

    freq_FILE = fopen(argv[1], "r");
    if (freq_FILE == NULL)
    {
        printf("GRID_BUILD: Erreur lors de l'ouverture du fichier, le chemin spécifié (%s) est-il correct ? \n", argv[1]);
        return 4;
    }
    int build_result = grid_build(freq_FILE, atoi(argv[2]), atoi(argv[3]));
    printf("\n");
    return build_result;
}
