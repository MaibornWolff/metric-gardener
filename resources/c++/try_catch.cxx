#include <stdexcept>
#include <string>
#include <iostream>
#include <cstring>

/**
 * Some try-catch-structures
 */

int main(int argc, char* argv[]) {
    try {
        if(argc < 2){
            throw std::invalid_argument("Not enough arguments provided!");
        }
        if(strcmp(argv[0], "bestprogram") != 0) {
            throw std::domain_error("HOW DARE YOU TO RENAME MY PROGRAM!!!!!");
        }
    }
    catch(const std::invalid_argument &ia){
        std::cerr << ia.what() << std::endl;
        return -1;
    }
    catch(const std::domain_error &d){
        std::cerr << "This is the bestprogram, I WILL NOT ARGUE ABOUT IT!!!!!!" << std::endl;
        std::cerr << d.what() << std::endl;
        return -9;
    }

    try{
        if(std::stoi(argv[1]) > 9000) {
            std::cout << "You estimated the epicness of this program correctly." << std::endl;
        } else {
            throw std::logic_error("NO THIS PROGRAMM IS WAY MORE EPIC THAN " + std::string(argv[1]) + "!!!!");
        }
    } catch(const std::exception &e){
        try {
            std::cout << e.what() << std::endl;
                    std::cout << "YOU ARE WRONG!!! YOU!!! NOT ME!!!!!" << std::endl;
        } catch ( ... ) 
        {
            std::cout << "Okay, okay, I was actually wrong with something I guess..." << std::endl;
        }

    }

    return 0;
}