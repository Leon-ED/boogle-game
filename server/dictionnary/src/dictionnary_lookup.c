/**
 * @brief Cherche la lettre dans le dictionnaire et renvoie la cellule correspondante
 * @authors Léon EDMEE, Denis DELMAS
 **/
#include "include/dictionnary_lookup.h"
#include <string.h>

/**
 * @brief Cherche la lettre dans le dictionnaire et renvoie la cellule correspondante
 * Si la lettre n'est pas présente, renvoie une cellule avec un elem à \0 et un firstChild à -1
 * Si la lettre à chercher est \0, renvoie la cellule avec un elem à \0 et un firstChild à -2
 * @param FILE *dico_lex : fichier dictionnaire
 * @param char letter: lettre à chercher
 * @param int  taille_cellule: taille d'une cellule
 * */
Cell cell_from_letter(FILE *dico_lex, char letter, int taille_cellule)
{
    Cell cell;
    Cell NULL_CELL = newCell('\0', -1, -1);
    fread(&cell, taille_cellule, 1, dico_lex);
    while (cell.letter != letter)
    {
        if (cell.nSibling <= 0)
        {
            break;
        }
        fread(&cell, taille_cellule, 1, dico_lex);
    }
    if (letter == '\0' && cell.letter == '\0')
    {
        return newCell('\0', -2, -2);
    }
    if (cell.letter == letter)
    {
        return cell;
    }
    else
    {
        return NULL_CELL;
    }
}
/**
 * @brief Cherche le mot dans le dictionnaire
 * @param FILE dico_name : nom du fichier dictionnaire
 * @param char word[] : mot à chercher
 *
 *  @return 0 si le mot est trouvé, 1 si le mot est un préfixe d'un mot du dictionnaire, 2 si le mot n'est pas trouvé
 **/
int dictionnary_lookup(FILE *dico_lex, char word[])
{

    // Ouvre le fichier, récupère ses infos et se place au début du fichier
    FileHeader header = getFileHeader(dico_lex);
    Cell cell;

    int size_cell = header.cell_size;
    int size_header = header.size;
    fseek(dico_lex, size_header, SEEK_SET);
    // On se place au début du fichier, après le header et on boucle sur chaque lettre du mot à chercher
    for (size_t i = 0; i < strnlen(word, 99); i++)
    {
        char letter = word[i];
        //  On réupère la cellule correspondant à la lettre dans les frères
        cell = cell_from_letter(dico_lex, letter, size_cell);
        // On a pas trouvé la lettre donc on renvoie NOT_FOUND
        if (cell.nSibling == -1 || cell.first_child == -1 || cell.letter != letter)
        {
            return NOT_FOUND;
        }
        // On a trouvé la lettre on se place au premier enfant de la cellule pour ensuite chercher la lettre suivante dans ses frères
        fseek(dico_lex, size_header + size_cell * cell.first_child, SEEK_SET);
    }

    // On a parcouru tout le mot, on regarde si la dernière lettre à comme frère \0
    cell = cell_from_letter(dico_lex, '\0', size_cell);
    // Si elle a un frère \0 on renvoie FOUND car le mot est dans le dictionnaire
    if (cell.nSibling == -2 || cell.first_child == -2)
    {
        return FOUND;
        // Sinon ce n'est pas un mot valide mais un prefixe d'un mot du dictionnaire si la lettre a des enfants
    }
    return FOUND_PREFIX;
}
#ifndef EXTERNAL_DRIVER
int main(int argc, char **argv)
{
    if (argc < 3)
    {
        printf("Erreur : 2 arguments attendus (%d passés)\n", argc);
        printf("Syntaxe : $ dictionnary_lookup <fichier.lex> <MOT>\n");
        return MISSING_PARAMS;
    }
    FILE *dico_LEX = fopen(argv[1], "rb");
    if (dico_LEX == NULL)
    {
        printf("Erreur : Erreur lors de l'ouverture du fichier, le chemin spécifié (%s) est-il correct ? \n", argv[1]);
        return 0;
    }
    int lookup_code = dictionnary_lookup(dico_LEX, argv[2]);
    printf("%d", lookup_code);
    return lookup_code;
}
#endif