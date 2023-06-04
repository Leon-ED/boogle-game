//fichier regroupant les fonction sur la grid

#if !defined(grid_h)
#define grid_h
#include "array2D.h"
#include "structs.h"
#include <stdio.h>

Array2D create_grid(unsigned int argc, char *argv[]);
void set_character(Array2D *array2D,unsigned int x,unsigned int y, Character character);
Character get_Character_in_grid(unsigned int x,unsigned int y,Array2D array2D);

void try_word(Array2D grid,GridPath* path,unsigned int index_path,FILE* dico_lex,unsigned int min_size);
int try_letter_adjacent_in_grid(Array2D grid,GridPath* path,unsigned int index_path,unsigned int min_size,FILE* dico_lex);
void solve(Array2D grid,char* dico_lex,unsigned int min_size);


#endif // grid_h
