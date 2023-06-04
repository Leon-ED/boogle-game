#if !defined(structs)
#define structs


typedef char Element;

typedef struct {
    Element elem;
    unsigned int firstChild;
    unsigned int nSiblings;
} ArrayCell;

typedef struct {
    unsigned int headerSize;
    unsigned int numWords;
    unsigned int nNodes;
    unsigned int cellSize;
} Header;

typedef struct {
    char *dictionnary_file;
    char *word;
} Args;

int verify_arguments(int argc);


#endif // structs

