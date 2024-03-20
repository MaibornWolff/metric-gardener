#ifndef CLASSES_HEADER_367734
#define CLASSES_HEADER_367734

#include <string>
#include <memory>

int example_function (int a);

std::shared_ptr<std::string> example_function_2 (std::string b);

class example_class {
    private:
        void member_function (int c, char* chars, std::string &str);
    public:
        int member_function (int d, std::unique_ptr<std::string> str_ptr);

        // Default comparison function, new in C++20
        auto operator<=>(const example_class&) const = default;

        void you_shall_not_pass(const int number) = delete;
};

#endif
