#include "structs.h"

int verify_arguments(int argc){
    if (argc != 3){
        return 255;  
    }
    return 0;
}