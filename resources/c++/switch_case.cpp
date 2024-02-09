#include <iostream>

int main(int argc, char *argv[])
{
    switch (argc)
    {
    case 0:
        std::cerr << "Should not be able to happen." << std::endl;
        return -2;
    case 1:
        std::cerr << "Not enough arguments provided!" << std::endl;
        return -1;
    default:
        std::cout << "You have done well :)" << std::endl;
    }
}