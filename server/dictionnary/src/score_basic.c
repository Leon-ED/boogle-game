#include <stdio.h>

/**
 * @brief Retourne simplement 1 point par mot passé en argument
 **/
int main(int argc, char const *argv[])
{
    if (argc <= 1)
    {
        printf("SCORE : Merci de fournir au moins un mot en argument\n");
        return 1;
    }
    printf("%d\n", argc - 1);
}