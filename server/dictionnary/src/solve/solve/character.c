#include "character.h"

Character parse_Character(const char buffer[]){ // converti un tableau de char en un Character
    Character character;
    for (int i = 0; i < maxChar; i++){
        if(buffer[i] == '\0' || buffer[i] == ' '){
            character.character[i] = '\0';
            break;
        }
        character.character[i] = buffer[i];
    }
    character.character[maxChar-1] = '\0';  
    return character;
}
