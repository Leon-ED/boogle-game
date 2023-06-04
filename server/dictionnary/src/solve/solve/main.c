#include <stdlib.h>
#include <stdio.h>
#include "../dictionnary_lookup/lookup/dictionnary_lookup.h"
#include "path.h"
#include "grid.h"
#include <ctype.h>
#include "tools.h"
/*
    solve
    $ solve dico.lex 3 4 4 G A I R R U V E QU E O T A S M J
    OUI VIE VIRE ...
    Renvoie tous les mots valides de la grille présents dans le dictionnaire (dico.lex) séparés par des espaces, avec une
    taille minimum (3).
*/



int main(int argc, char *argv[]) {
    int error = verif_arguments(argc,argv);
    if (error == 0){
        return error;
    }
    
    Array2D grid = create_grid(argc,argv);    

    solve(grid,argv[1],atoi(argv[2]));

    freeArray2D(grid);

    return 0;

}

