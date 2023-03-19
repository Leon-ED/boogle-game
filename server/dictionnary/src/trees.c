#include "include/trees.h"
#include "include/libs.h"
/**
 * @brief Fonctions sur les arbres faites en TP
 **/

CSTree newTree(Element elem, CSTree firstChild, CSTree nextSibling)
{
    CSTree t = malloc(sizeof(Node));
    if (t == NULL){
        printf("Erreur d'allocation mémoire");
        exit(1);
        return NULL;
    }
    t->elem = elem;
    t->firstChild = firstChild;
    t->nextSibling = nextSibling;
    return t;
}


CSTree example()
{
    CSTree a = newTree('A',
                       newTree('B', NULL, NULL),
                       newTree('C', NULL, NULL));
    CSTree b = newTree('D', NULL, a);
    return b;
}

void printPrefix(CSTree t)
{
    if (t == NULL)
        return;
    printf("%c ", t->elem);
    printPrefix(t->firstChild);
    printPrefix(t->nextSibling);
}

// Imprime le contenu d'un Static Tree (dans l'ordre du tableau)
void printStatic(StaticTree t, unsigned int i)
{
    i = 0;
    printf("\nindex\t\tElement\t\tFirst Child\t\tsiblings\n");
    while (i < t.nNodes)
    {
        // printf("%c \n",t.nodeArray[i].elem);
        // printf("i: %d \n",i);
        printf("%d\t\t%c\t\t%d\t\t%d\n", i, t.nodeArray[i].elem, t.nodeArray[i].firstChild, t.nodeArray[i].nSiblings);
        i++;
    }
}

int size(CSTree t)
{
    if (t == NULL)
        return 0;
    return 1 + size(t->firstChild) + size(t->nextSibling);
}

int nSibling(CSTree t)
{
    if (t == NULL)
        return 0;
    return 1 + nSibling(t->nextSibling);
}

int nChildren(CSTree t)
{
    if (t == NULL)
        return 0;
    return 1 + nChildren(t->firstChild);
}
void exportStaticTreeRec(CSTree t, int *i, ArrayCell *nodeArray)
{
    if (t != NULL)
    {
        nodeArray[*i].elem = t->elem;
        // le 1er fils est après les frères et leurs fils
        if (t->firstChild == NULL)
            nodeArray[*i].firstChild = NONE;
        else
            nodeArray[*i].firstChild = *i + size(t->nextSibling) + 1;
        nodeArray[*i].nSiblings = nSibling(t) - 1;
        (*i)++;
        exportStaticTreeRec(t->nextSibling, i, nodeArray);
        exportStaticTreeRec(t->firstChild, i, nodeArray);
    }
}

StaticTree exportStaticTree(CSTree t)
{
    StaticTree st;
    st.nNodes = size(t);
    st.nodeArray = malloc(st.nNodes * sizeof(ArrayCell));

    int i = 0;
    exportStaticTreeRec(t, &i, st.nodeArray);

    return st;
}

ArrayCell cons(Element e, int firstChild, int nSiblings)
{
    ArrayCell c;
    c.elem = e;
    c.firstChild = firstChild;
    c.nSiblings = nSiblings;
    return c;
}

// Renvoie le premier frere de t contenant l’element e (ou t lui-mˆeme), NULL si aucun n’existe.
CSTree siblingLookup(CSTree t, Element e)
{
    if (t == NULL)
        return NULL;
    if (t->elem == e)
        return t;
    return siblingLookup(t->nextSibling, e);
}

CSTree sortInsertSibling(CSTree *t, Element e)
{
    if (*t == NULL)
    {
        *t = newTree(e, NULL, NULL);
        return *t;
    }
    if ((*t)->nextSibling == NULL)
    {
        (*t)->nextSibling = newTree(e, NULL, NULL);
        return *t;
    }
    if ((*t)->nextSibling->elem > e)
    {
        CSTree tmp = (*t)->nextSibling;
        (*t)->nextSibling = newTree(e, NULL, tmp);
        return *t;
    }
    return sortInsertSibling(&(*t)->nextSibling, e);
}

CSTree sortContinue(CSTree *t, Element e)
{
    if (*t == NULL)
    {
        *t = newTree(e, NULL, NULL);
        return *t;
    }
    if ((*t)->elem > e)
    {
        CSTree tmp = *t;
        *t = newTree(e, NULL, tmp);
        return *t;
    }
    return sortContinue(&(*t)->nextSibling, e);
}

index_ siblingLookupStatic(StaticTree t, Element e, index_ from, index_ len)
{
    if (len == 0)
        return -1;
    if (t.nodeArray[from].elem == e)
        return from;
    return siblingLookupStatic(t, e, from + 1, len - 1);
}

index_ siblingDichotomyLookupStatic(StaticTree t, Element e, index_ from, index_ len)
{
    if (len == 0)
        return -1;
    if (t.nodeArray[from + len / 2].elem == e)
        return from + len / 2;
    if (t.nodeArray[from + len / 2].elem > e)
        return siblingDichotomyLookupStatic(t, e, from, len / 2);
    return siblingDichotomyLookupStatic(t, e, from + len / 2 + 1, len - len / 2 - 1);
}

CSTree importStaticTreeRec(StaticTree t, int i) {
    if (t.nodeArray[i].elem == NONE)
        return NULL;
    if(i >= t.nNodes){
        printf("Error: index out of bounds in importStaticTreeRec\n");
        return NULL;
    }
    // printf("i: %d \t elem: %c \t firstChild: %d \t nSiblings: %d \n", i, t.nodeArray[i].elem, t.nodeArray[i].firstChild, t.nodeArray[i].nSiblings);
    CSTree tree = newTree(t.nodeArray[i].elem, NULL, NULL);

    if(t.nodeArray[i].firstChild != NONE)
        tree->firstChild = importStaticTreeRec(t, t.nodeArray[i].firstChild);
    else
        tree->firstChild = NULL;

    if(t.nodeArray[i].nSiblings > 0)
        tree->nextSibling = importStaticTreeRec(t, i + 1);
    else
        tree->nextSibling = NULL;
    return tree;
}


CSTree importStaticTree(StaticTree t)
{
    int i = 0;
    return importStaticTreeRec(t, 0);
}


StaticTree importStaticTreeFromFile(FILE *lex_FILE)
{
    if (lex_FILE == NULL)
    {
        printf("Erreur ouverture fichier");
        exit(1);
    }
    FileHeader header = getFileHeader(lex_FILE);
    StaticTree st;
    st.nNodes = header.nb_Cells;
    st.nodeArray = malloc(header.nb_Cells * header.cell_size);
    fseek(lex_FILE, header.size, SEEK_SET);

    for (size_t i = 0; i < header.nb_Cells; i++)
    {
        ArrayCell c;
        fread(&c, header.cell_size, 1, lex_FILE);
        st.nodeArray[i] = c;
    }

    // for (int i = 0; i < st.nNodes; i++)
    // {
    //     char elem;
    //     int firstChild;
    //     int nSiblings;
    //     fscanf(lex_FILE, "%c %d %d", &elem, &firstChild, &nSiblings);
    //     st.nodeArray[i] = cons(elem, firstChild, nSiblings);

    // }
    fclose(lex_FILE);
    printf("Fichier lu\n");
    printf("Nombre de noeuds : %d \n", st.nNodes);
    printf("Premier noeud : %c \n", st.nodeArray[0].elem);
    printf("Premier fils : %d \n", st.nodeArray[0].firstChild);
    printf("Nombre de freres : %d \n", st.nodeArray[0].nSiblings);
    return st;
}
