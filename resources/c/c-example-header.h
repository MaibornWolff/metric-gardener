#ifndef C_EXAMPLE_HEADER_987678
#define C_EXAMPLE_HEADER_987678

enum Food { Potato, Sauerkraut, Sausage, Pretzel, Bread };

// New fixed-type enum introduced in C23.
enum Food_C23: int { Pizza, Pasta, Fish, Steak };

// Should not count as struct, as it defines just an alias.
typedef enum Food Food;
typedef int number_without_comma;

struct not_easily_usable {
    int a;
    char b;
};

// Should not count as struct, as it defines just an alias.
typedef struct not_easily_usable now_easily_usable;

// Should count as struct, as it defines a new struct.
typedef struct {
    char* payload;
    int status;
} message;

typedef struct struct_namespace_name {
    int c;
    int d;
} global_namespace_name;

/*
 * Should also work with unions:
 */
union first_union {
    int number;
    char character;
};

typedef union second_union {
    char character;
    float unnatural_number;
} unnatural_union;

// Should not count as union, as it defines just an alias.
typedef union first_union number_union;

/*
 * Forward declared struct/union. Declares the struct/union, but does not define it.
 * So we should not count it as struct/union to avoid counting one struct two times.
 * Forward-declared enums are not allowed in C.
 */
struct forward_declared;
union forward_declared_union;

typedef struct forward_declared alias_name; // Do not count type aliases as structs/unions.
typedef union forward_declared_union union_alias_name;

// Only works with C++
// typedef forward_declared another_alias_name;

struct forward_declared { // Should only count a struct definition as a struct.
};
union forward_declared_union {
};

int print_some_recipe(Food result, int numberOfGuests);

extern int visible_number;

#endif
