#include "lookup/dictionnary_lookup.h"
/*
dictionnary_lookup
$ dictionnary_lookup dico.lex BONJOUR
[valeur de sortie = 0]
Recherche si un mot (BONJOUR) est dans un dictionnaire (dico.lex). Renvoie 0 si le mot est présent, 1 si c’est un
préfixe valide d’un mot présent (par exemple, BONJ), 2 sinon. Aucune sortie n’est attendue
*/




int main(int argc, char *argv[]){
    int error = verify_arguments(argc);
    
    if (error != 0){
        return error;
    }
    Args args={argv[1], argv[2]};


    FILE *dictionnary = fopen(args.dictionnary_file, "rb");
    if (dictionnary == NULL){
        return 250;
    }

    int statut = lookup(dictionnary, args.word);
    return statut;

}
    