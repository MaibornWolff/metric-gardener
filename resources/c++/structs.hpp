#ifndef STRUCTS_18734
#define STRUCTS_18734

// C-style structs with typedef:

struct example_struct {
    int a;
    int b;
    int c;
};

typedef struct {
    int first;
    char* second;
} example_typedef_struct;

typedef struct struct_name {
    char first;
    char second;
    char third;
} typedef_name;

typedef example_struct example_struct_alias;
typedef int Custom_Number;

struct derived_struct : public example_struct {
    Custom_Number d;
};

// C++ class-like struct

struct class_like_struct {
    /**
     * Constructor of the struct class_like_struct.
     * @param str C-style string to use.
     */
    class_like_struct(char* str);

    int get_length();

    int set_string(char* str);

private:
    char* c_style_string;

    struct nested_struct {
        int e;
        int f;
        int g;
    };
};

#endif
