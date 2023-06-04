#include "grid.h"
#include <stdio.h>
#include "structs.h"
#include "array2D.h"
#include "character.h"
#include <stdlib.h>
#include <string.h>
#include "path.h"
#include "../dictionnary_lookup/lookup/dictionnary_lookup.h"


void fill_grid(Array2D grid,unsigned int argc, char *argv[]){
    for (unsigned int i = 0; i < grid.width; i++)
    {
        for (unsigned int j = 0; j < grid.height; j++)
        {
            Character character;
            for (int k = 0; k < maxChar; k++)
            {
                character = parse_Character(argv[5+i+j*grid.width]);
            }
            set_character(&grid,i,j,character);
        }
    }
    
}
Array2D create_grid(unsigned int argc, char *argv[]){
    int width = atoi(argv[3]);
    int height = atoi(argv[4]);
    Array2D grid = createArray2D(width, height);
    fill_grid(grid, argc, argv);
    return grid;
}

void set_character(Array2D *array2D,unsigned int x,unsigned int y, Character character) {
    unsigned int index = x + y * array2D->width;
    if (index < array2D->width * array2D->height && index >= 0){
        array2D->array[index] = character;
    }
    else{
        exit(EXIT_FAILURE);//les coordonnées données ne sont pas dans la grille 
    }
}

Character get_Character_in_grid(unsigned int x,unsigned int y,Array2D array2D){
    unsigned int index = x + y * array2D.width;
    if (index < array2D.width * array2D.height && index >= 0){
        return array2D.array[index];
    }
    else{
        exit(EXIT_FAILURE);//les coordonnées données ne sont pas dans la grille 
    }
}


void print_grid(Array2D grid){
    for (unsigned int i = 0; i < grid.width; i++)
    {
        for (unsigned int j = 0; j < grid.height; j++)
        {
            Character character = get_Character_in_grid(j,i,grid);
            printf("%s ",character.character);
        }
        printf("\n");
    }
}


int try_letter_adjacent_in_grid(Array2D grid,GridPath* path,unsigned int index_path,unsigned int min_size,FILE* dico_lex){ 

    for(int i = -1; i <= 1;i++){
        for(int j = -1; j <= 1;j++){

            Coord2D coord;
            
            coord.x = path->path[index_path-1].x + i;
            coord.y = path->path[index_path-1].y + j;
            if (Coord_in_Array2D(grid,coord) && !Coord_in_Path(*path,coord,index_path)){ // si la coordonnée est dans la grille et n'est pas déjà dans le path
                path->path[index_path] = coord;
                try_word(grid,path,index_path+1,dico_lex,min_size);
            }
            
        }
    }
    return 0;
}


void try_word(Array2D grid,GridPath* path,unsigned int index_path,FILE* dico_lex,unsigned int min_size){
    char* word = convert_path_to_word(grid,path,index_path);
    int statut = lookup(dico_lex,word);
    if (statut == 0 && min_size<=index_path)
    {
        printf("%s ",word);
    }
    if (statut != 2) // si le mot n'est pas valide, on ne cherche pas les mots qui peuvent en dépendre
    {
        try_letter_adjacent_in_grid(grid,path,index_path,min_size,dico_lex);
    }
    free(word);
}


void solve(Array2D grid,char* dico_lex,unsigned int min_size){
    GridPath path;
    path.length = grid.width*grid.height; // taille maximal du chemin, et donc d'un mot
    path.path = malloc(sizeof(Coord2D)*path.length);
    if (path.path == NULL){
        exit(245);
    }

    FILE* dico = fopen(dico_lex,"rb");
    if (dico == NULL){
        exit(250);
    }

    for (unsigned int i = 0; i < grid.width; i++)
    {
        for (unsigned int j = 0; j < grid.height; j++)
        {
            path.path[0].x = i;
            path.path[0].y = j;
            try_word(grid,&path,1,dico,min_size);
        }
    }
    freeGridPath(path);

}
