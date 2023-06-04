#include "array2D.h"
#include <stdlib.h>

Array2D createArray2D(unsigned int width,unsigned int height) {
    Array2D array2D;
    array2D.width = width;
    array2D.height = height;
    array2D.array = (Character*)malloc(width * height * sizeof(Character));
    if(array2D.array == NULL) {
        exit(245);
    }
    return array2D;
}

void freeArray2D(Array2D array2D) {
    free(array2D.array);
}

// retourne true si les coordonnées sont dans la grille
_Bool Coord_in_Array2D(Array2D grid,Coord2D coord){
    return coord.x >= 0 && coord.x < grid.width && coord.y >= 0 && coord.y < grid.height;

}

unsigned int convert2DTo1D(int x, int y,unsigned int width){
    return y * width + x;
}
