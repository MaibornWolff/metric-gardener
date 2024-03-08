/*
 * Unscoped enums:
 */
enum unscoped_enum { Potato, Carrot, Kohlrabi, Coleslaw };
enum unscoped_fixed_type_enum: int { One, Two, Tree };
// unscoped enums with unfixed type cannot be opaque/forward declared.
enum unscoped_fixed_type_opaque_enum: int;

/*
 * Scoped enums:
 */
enum class scoped_class_enum { Potato, Carrot, Kohlrabi, Coleslaw };
enum class scoped_class_fixed_enum: int { One, Two, Tree };
enum class scoped_class_opaque_enum;
enum class scoped_class_fixed_opaque_enum: int;

enum struct scoped_struct_enum { Potato, Carrot, Kohlrabi, Coleslaw };
enum struct scoped_struct_fixed_enum: int { One, Two, Tree };
enum struct scoped_struct_opaque_enum;
enum struct scoped_struct_fixed_opaque_enum: int;

// Should not count, as it is just an alias definition not defining a new enum:
typedef enum unscoped_enum Meals;

union an_union {
    int i;
    char c;
};

typedef union a_second_union {
    int i;
    char c;
} the_second_union;

union another_union {
    int i;
    char c;

    int add(int j) {
        return i + j;
    }
};

struct struct_name {
    int field1;
    // Anonymous union:
    union {
        int one_field2;
        char another_field2;
    };
};

int main() {
    // Anonymous union:
    union {
        int number;
        const char* char_pointer;
    };

    // Anonymous enum:
    enum { a, b, c, d };
    // Anonymous fixed type enum:
    enum: int { e, f, g, h };

    enum unscoped_fixed_type_opaque_enum : int;

    number = 5;
    char_pointer = "Wuhuu!";
}
