#include <stdio.h>
#include <stdlib.h>

typedef struct
{
    int size;
    int nb_words;
    int nb_Cells;
    int cell_size;

} FileHeader;

// Cellule du dictionnaire, contient la lettre, la position du premier fils et le nombre de frères
typedef char Letter;
typedef struct
{
    Letter letter;
    int first_child;
    int nSibling;

} Cell;

int number_of_lines(FILE *file);
Cell newCell(char letter, int first_child, int nSibling);
FileHeader getFileHeader(FILE *export_FILE);
#define UNKNOW_ERROR 255
#define FILE_NOT_FOUND 254
#define MISSING_PARAMS 253
#define WRONG_PARAMS 252
#define TOO_MANY_PARAMS 251
#define FILE_NOT_CORRECT 250
#define MEMORY_ERROR 249
#define OK 0
