#include "tools.h"
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

_Bool isNumber(char str[])
{
    int i = 0;
    while (str[i] != '\0')
    {
        if (!isdigit(str[i]))
            return false;
        i++;
    }
    return true;
}

unsigned int wordOccurence(char* word,char letter){
    unsigned int occurence = 0;
    for (unsigned int i = 0; i < strlen(word); i++)
    {
        if (word[i]==letter)
        {
            occurence++;
        }
    }
    return occurence;
}


int verif_arguments(unsigned int argc,char *argv[]){
    if (argc <= 4){
        return 255; // pas assez d'arguments
    }
    if (isNumber(argv[2]) && isNumber(argv[3]) && isNumber(argv[4])){
        if (argc == 5+atoi(argv[2])*atoi(argv[3])){
            return 0;   
        }else{
            return 255; //mauvais nombre d'arguments
        }    
    }
    return 254; // mauvais type d'arguments
}