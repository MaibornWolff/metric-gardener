#ifndef C_EXAMPLE_HEADER_987678
#define C_EXAMPLE_HEADER_987678

enum Food { Kartoffel, Sauerkraut, Bratwurst, Brezel, Bauernbrot };

// Scoped enum:
enum struct Scoped_Enum { Pizza, Pasta, Schnitzel, Backfisch };
// Opaque scoped enum:
enum struct Scoped_Enum: int;

// Should not count as struct, as it defines just an alias.
typedef enum Food Food;

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
 * Forward declared struct/class/union. Declares the struct/class/union, but does not define it.
 * So we should not count it as struct/class/union to avoid counting one struct two times.
 * Scoped enums are not forward declared, but opaque enums which can be used as-is (see above).
 */
struct forward_declared;
class forward_declared_class;
union forward_declared_union;

// Do not count type aliases as structs/classes/unions.
typedef struct forward_declared alias_name;
typedef class forward_declared_class;
typedef union forward_declared_union union_alias_name;

// Only works with C++. Should also not be counted.
typedef forward_declared another_alias_name;
typedef forward_declared_class another_class_alias_name;
typedef forward_declared_union another_union_alias_name;

// Should only count a struct/class/union definition as a struct/class/union, like the following:
struct forward_declared {
};
class forward_declared_class {
};
union forward_declared_union {
};

int print_some_recipe(Food result, int numberOfGuests);

extern int visible_number;

#endif