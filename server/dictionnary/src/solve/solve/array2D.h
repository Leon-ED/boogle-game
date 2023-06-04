//fichier regroupant les fonctions sur la structure array2D

#if !defined(array2D_h)
#define array2D_h
#include "structs.h"
#include <stdbool.h>

Array2D createArray2D(unsigned int width,unsigned int height);
_Bool Coord_in_Array2D(Array2D grid,Coord2D coord);
void freeArray2D(Array2D array2D);
unsigned int convert2DTo1D(int x, int y,unsigned int width);


#endif // array2D_h
