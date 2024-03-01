
enum unscoped_enum { Kartoffel, Karotte, Kohlrabi, Krautsalat };
enum unscoped_fixed_type_enum: int { Eins, Zwei, Drei };
// unfixed forward declaration not allowed by ISO C++ according to clang compiler.
enum unscoped_fixed_type_opaque_enum: int;

enum class scoped_class_enum { Kartoffel, Karotte, Kohlrabi, Krautsalat };
enum class scoped_class_fixed_enum: int { Eins, Zwei, Drei };
enum class scoped_class_opaque_enum;
enum class scoped_class_fixed_opaque_enum: int;

enum struct scoped_struct_enum { Kartoffel, Karotte, Kohlrabi, Krautsalat };
enum struct scoped_struct_fixed_enum: int { Eins, Zwei, Drei };
enum struct scoped_struct_opaque_enum;
enum struct scoped_struct_fixed_opaque_enum: int;

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
