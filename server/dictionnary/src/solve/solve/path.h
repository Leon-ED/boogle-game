//fichier regroupant des fonctions sur la structure path

#if !defined(path_h)
#define path_h
#include "structs.h"
#include <stdbool.h>

_Bool Coord_in_Path(GridPath path,Coord2D coord,unsigned int index);
void print_path_of_word(GridPath path,unsigned int width);
char* convert_path_to_word(Array2D grid,GridPath* path,unsigned int index_path);
void freeGridPath(GridPath path);
#endif // path
