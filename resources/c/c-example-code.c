#include <stdio.h>
#include <string.h>
#include "c-example-header.h"

int visible_number = 5;

int print_some_recipe(Food meal, int numberOfGuests) {
    if(meal == Kartoffel){
        puts("Recipe for potatoes");
    } else if(meal == Sauerkraut) {
        puts("How to make sauerkraut");
    } else if(meal == Bratwurst) {
        puts("Bratwurst recipe");
    } else if(meal == Brezel || meal == Bauernbrot) {
        puts("Baking guide");
    } else {
        puts("Unknown meal :(");
        return -1;
    }
    return 0;
}

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

    char* string_var = "Awesome text!";
    char* c = string_var;

    while(*c){
        putchar(*c);
        c++;
    }
    putchar('\n');

    int f = 0;
    do {
        f++;
    } while(f < 5);

    printf("Value of variable f is %d\n", f);
    print_some_recipe(Sauerkraut, f);

    return 0;
}