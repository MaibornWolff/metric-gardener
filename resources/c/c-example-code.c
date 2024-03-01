#include <stdio.h>
#include <string.h>

st

int main(int argc, char* argv[]) {
    switch(argc) {
        case 0:
            puts("Cannot happen... something went REALLY wrong...");
            break;
        case 1:
            printf("This program is named \"%s\"\n", argv[0]);
        default:
            for(int i = 0; i < argc; i++) {
                printf("Command line argument no. %d is %s\n", i, argv[i]);
            }
    }

    if(argc > 1 && strcmp(argv[1], "hello") == 0){
        puts("Hello there!");
    }

    return 0;
}