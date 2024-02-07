#ifndef STRUCTS_18734
#define STRUCTS_18734

struct example_struct {
    int a;
    int b;
    int c;
};

struct derived_struct : public example_struct {
    int d;
};

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
