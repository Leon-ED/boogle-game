#include <stdio.h>
#include <stdlib.h>
#include "include/dictionnary_build.h"
#include <time.h>

/**
 * @brief Insère un mot dans l'arbre dans l'ordre alphabétique
 * @param t Arbre dans lequel insérer le mot
 * @param word Mot à insérer.
 * @return void
 **/
void insertWord(CSTree *t, char *word)
{
  // Aucun élément trouvé alors on l'insère nous même
  if (*t == NULL)
  {
    *t = newTree(word[0], NULL, NULL);
    if (word[1] != '\0')
      insertWord(&(*t)->firstChild, word + 1);
  }
  // Si c'est la même lettre, on l'insère pas et on continue dans les fils avec la lettre suivante du mot
  else if ((*t)->elem == word[0])
  {
    if (word[1] != '\0')
      insertWord(&(*t)->firstChild, word + 1);
  }
  // Pour insérer dans l'ordre alphabétique
  else if ((*t)->elem > word[0])
  {
    CSTree new = newTree(word[0], NULL, *t);
    *t = new;
    if (word[1] != '\0')
      insertWord(&(*t)->firstChild, word + 1);
  }
  else // On a rien trouvé, on continue dans les frères
  {
    insertWord(&(*t)->nextSibling, word);
  }
}

/**
 * @brief Insère un \0 à la fin du mot
 * @param t Arbre dans lequel insérer le \0
 * @param word Mot à trouver
 * @return void
 **/
void insertEOW(char *word, CSTree *t)
{
  // Si l'arbre est nul on mets un \0
  if (*t == NULL)
  {
    (*t) = newTree('\0', NULL, NULL);
  }
  // Si on a trouvé une lettre, on continue dans les fils
  else if ((*t)->elem == word[0])
  {
    insertEOW(word + 1, &(*t)->firstChild);
  }
  // Si on a pas trouvé la lettre, on continue dans les frères
  else
  {
    insertEOW(word, &(*t)->nextSibling);
  }
}

/**
 * @brief Ecris un StaticTree dans un fichier
 * @param StaticTree *t Arbre statique à écrire
 * @param FILE *dico_LEX E Fichier dans lequel écrire
 * @param FileHeader Entête du fichier
 * @return void
 **/
void writeStaticTree(StaticTree *t, FILE *dico_LEX, FileHeader header)
{
  fseek(dico_LEX, 0, SEEK_SET);
  fwrite(&header, sizeof(FileHeader), 1, dico_LEX);
  fwrite((*t).nodeArray, sizeof(ArrayCell), (*t).nNodes, dico_LEX);
  free((*t).nodeArray);
}

/**
 * @brief Construit le dictionnaire à partir du fichier dico.txt
 * @param char dico_path : Chemin vers le fichier dico.txt où se trouve le dictionnaire
 * @param char ico_lex_path Chemin vers le fichier dico_lexe.lex où sera stocké le dictionnaire lexé
 * @return int 0 si tout s'est bien passé
 */
int dictionnary_build(FILE *dico, FILE *dico_lex)
{
  FileHeader header;
  header.nb_words = number_of_lines(dico);

  char line[256];
  CSTree tree = NULL;
  // On parcourt le fichier dico.txt et on insère les mots dans l'arbre
  while (fgets(line, sizeof(line), dico))
  {
    if (line[strlen(line) - 1] == '\n')
    {
      line[strlen(line) - 1] = '\0';
    }
    insertWord(&tree, line);
    insertEOW(line, &tree);
  }

  fclose(dico);
  StaticTree staticTree = exportStaticTree(tree);
  header.cell_size = sizeof(ArrayCell);
  header.nb_Cells = staticTree.nNodes;
  header.size = sizeof(FileHeader);
  writeStaticTree(&staticTree, dico_lex, header);
  fclose(dico_lex);
  return OK;
}

int main(int argc, char *argv[])
{
  if (argc == 1)
  {
    printf("dictionnary_build : Usage : ./dictionnary_build <dico_INPUT_path> <dico_OUTPUT_path>\n");
    return MISSING_PARAMS;
  }
  if (argc != 3)
  {
    printf("dictionnary_build : Usage : ./dictionnary_build <dico_INPUT_path> <dico_OUTPUT_path>\n");
    return WRONG_PARAMS;
  }
  FILE *dico_INPUT = fopen(argv[1], "r");
  FILE *dico_OUTPUT = fopen(argv[2], "wb");
  if (dico_INPUT == NULL || dico_OUTPUT == NULL)
  {
    printf("dictionnary_build : Impossible de trouver l'un des deux fichiers, etes-vous sur de leur emplacement ? !\n");
    printf("Emplacement dico_INPUT : %s\n", argv[1]);
    printf("Emplacement dico_OUTPUT : %s\n", argv[2]);
    return FILE_NOT_FOUND;
  }

  return dictionnary_build(dico_INPUT, dico_OUTPUT);
}
