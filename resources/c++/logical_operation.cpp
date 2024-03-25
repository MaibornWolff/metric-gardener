#include <iostream>

int main() {
    int x = 1;
    int y = 0;

    if (x > 0 and y > 0) {
        std::cout << "Both x and y are positive." << std::endl;
    }

    if (x > 0 or y > 0) {
        std::cout << "At least one of x and y is positive." << std::endl;
    }

    if (x > 0 && y > 0) {
        std::cout << "Both x and y are positive." << std::endl;
    }

    if (x > 0 || y > 0) {
        std::cout << "At least one of x and y is positive." << std::endl;
    }

    if ((x > 0) ^ (y > 0)) {
        std::cout << "Exactly one of x and y is positive." << std::endl;
    }

    if ((x > 0) xor (y > 0)) {
        std::cout << "Exactly one of x and y is positive." << std::endl;
    }

    return 0;
}
