#include <stdlib.h>
#include <stdio.h>
#include <limits.h>
#include "libs.h"

#define FOUND 0
#define NOT_FOUND 2
#define FOUND_PREFIX 1
int dictionnary_lookup(FILE *dico_lex, char word[]);
