#include <stdlib.h>
#include <stdio.h>
#include <limits.h>
#include <string.h>

#define NONE -1
typedef unsigned int index_;
// Définition du type child Sibling Tree (CSTree)

typedef char Element;

typedef struct node
{
    Element elem;
    struct node *firstChild;
    struct node *nextSibling;
} Node;

typedef Node *CSTree;

typedef struct
{
    Element elem;
    unsigned int firstChild;
    unsigned int nSiblings;
} ArrayCell;

typedef struct
{
    unsigned int nNodes;
    ArrayCell *nodeArray;

} StaticTree;

void printPrefix(CSTree t);
CSTree newTree(Element elem, CSTree firstChild, CSTree nextSibling);
CSTree sortInsertSibling(CSTree *t, Element e);
CSTree sortContinue(CSTree *t, Element e);
int size(CSTree t);
StaticTree exportStaticTree(CSTree t);
void printStatic(StaticTree t, unsigned int i);
CSTree example();
CSTree siblingLookup(CSTree t, Element e);
StaticTree importStaticTreeFromFile(FILE *lex_FILE);
CSTree importStaticTree(StaticTree t);