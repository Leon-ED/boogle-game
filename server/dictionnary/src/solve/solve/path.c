#include "path.h"
#include <stdio.h>
#include "array2D.h"
#include "grid.h"
#include <stdlib.h>
#include <string.h>

_Bool Coord_in_Path(GridPath path,Coord2D coord,unsigned int index){ //regarde les coordonnées dans le path jusqu'à l'index
    for (unsigned int i = 0; i < index; i++)
    {
        if (path.path[i].x == coord.x && path.path[i].y == coord.y){
            return true;
        }
    }
    return false;
}

void print_path_of_word(GridPath path,unsigned int width){
    for (unsigned int i = 0; i < path.length; i++)
    {
        printf("%u ",convert2DTo1D(path.path[i].x,path.path[i].y,width));
    }
    printf("\n");
}

char* convert_path_to_word(Array2D grid,GridPath* path,unsigned int index_path){
    char* word = calloc(index_path*2,sizeof(char));
    if (word == NULL)
    {
        exit(245);
    }
    

    for (unsigned int i = 0; i < index_path; i++) // on concatène les lettres représenté du path jusqu'à index_path
    {
        strcat(word,get_Character_in_grid(path->path[i].x,path->path[i].y,grid).character);
    }
    return word;

}

void freeGridPath(GridPath path){
    free(path.path);
}