#if !defined(structs_h)
#define structs_h


#define maxChar 3  // nombre de caractères maximum pour un charactere (\0 compris)



typedef struct Character{
    char character[maxChar];
} Character;

typedef struct Array2D {
    Character *array;
    unsigned int width;
    unsigned int height;
} Array2D;

typedef struct Coord2D{
    int x;
    int y;
} Coord2D;


typedef struct GridPath {
    Coord2D *path;
    unsigned int length;
} GridPath;


#endif // structs_h
