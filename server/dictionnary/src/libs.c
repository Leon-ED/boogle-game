#include "include/libs.h"
#include <string.h>

/**
 * @brief      Compte le nombre de lignes dans un fichier
 * @param FILE file  Le fichier
 * @return int Le nombre de lignes
 */
int number_of_lines(FILE *file)
{
    int nb_lines = 0;
    char c;
    fseek(file, 0, SEEK_SET);
    while ((c = fgetc(file)) != EOF)
    {
        if (c == '\n')
        {
            nb_lines++;
        }
    }
    fseek(file, 0, SEEK_SET);
    return nb_lines;
}

/**
 * @brief  Renvois le header du fichier
 * @param FILE *export_FILE  Le fichier
 * @return FileHeader Le header
 */
FileHeader getFileHeader(FILE *export_FILE)
{
    FileHeader header;
    fseek(export_FILE, 0, SEEK_SET);
    fread(&header, sizeof(FileHeader), 1, export_FILE);
    return header;
}

/**
 * @brief Créé une cellule
 * @param char letter : lettre de la cellule
 * @param int first_child : index du premier enfant
 * @param int nSibling : nombre de cellules frères
 * @return Cell La cellule créée
 **/
Cell newCell(char letter, int first_child, int nSibling)
{
    Cell cell;
    cell.letter = letter;
    cell.first_child = first_child;
    cell.nSibling = nSibling;
    return cell;
}
