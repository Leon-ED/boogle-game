#include "dictionnary_lookup.h"

int lookup(FILE* dictionnary, char* word){
    fseek(dictionnary, 0, SEEK_SET);
    
    int statut = search_word_in_lex(dictionnary, word);
    return statut;
}