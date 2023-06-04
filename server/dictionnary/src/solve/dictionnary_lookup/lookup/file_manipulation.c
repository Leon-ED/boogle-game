#include "file_manipulation.h"

Header read_header(FILE *dico){
    Header header;
    fread(&header, sizeof(Header), 1, dico);
    return header;
}

//pos_where_search correspond a la position ou on doit chercher dans le dictionnaire la lettre (par rapport a un arbre, on regarde sa position ainsi que ses freres)
int search_word_in_lex_rec(FILE *file,Header header,char word[],int pos_in_word,unsigned int *pos_where_search){

    char letter = word[pos_in_word];    
    
    //on place notre curseur et on recupere la cellule
    fseek(file, header.headerSize + *pos_where_search * header.cellSize, SEEK_SET);
    ArrayCell cell;
    fread(&cell, header.cellSize, 1, file);
    
    if (cell.elem == letter){
        if (cell.elem=='\0')
        {
            return 0;
        }
        *pos_where_search = cell.firstChild;
        return search_word_in_lex_rec(file,header,word,pos_in_word+1,pos_where_search);//on cherche la lettre suivante
    }
    else if (cell.nSiblings!=0)
    {
        *pos_where_search+=1;
        return search_word_in_lex_rec(file,header,word,pos_in_word,pos_where_search); //on cherche la lettre dans les freres
    }
    if (letter=='\0')//le mot fini plus tot que les mots dans le dictionnaire, donc le mot donné est un préfixe
    {
        return 1;
    }
    
    return 2;
}

int search_word_in_lex(FILE *file,char word[]){
    Header header = read_header(file);
    
    unsigned int current_position = 0;
    
    return search_word_in_lex_rec(file,header,word,0,&current_position);
        
}
