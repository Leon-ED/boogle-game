#if !defined(file_manipulation)
#define file_manipulation
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "structs.h"

Header read_header(FILE *dico);
int search_word_in_lex_rec(FILE *file,Header header,char word[],int pos_in_word,unsigned int *pos_where_search);
int search_word_in_lex(FILE *file,char word[]);



#endif // file_manipulation
