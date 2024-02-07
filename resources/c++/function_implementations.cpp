#include "function_declarations.hpp"
#include <iostream>

int example_function (int a) {
    return a;
}

std::shared_ptr<std::string> example_function_2 (std::string b) {
    return std::make_shared<std::string>(std::move(b));
}

void example_class::member_function (int c, char* chars, std::string &str) {
    str.append(chars, c);
}

int example_class::member_function (int d, std::unique_ptr<std::string> str_ptr)
{
    str_ptr->append("number: " + std::to_string(d));
    return str_ptr->size();
}
