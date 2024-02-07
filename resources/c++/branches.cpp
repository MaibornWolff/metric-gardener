#include <iostream>
#include <vector>
#include <string>

// Questionable branching statements and boolean operators,
// like various kinds of ifs, loops, and, or, etc.
int main(){

    int result = 0;
    int a = 5;
    int b = 6;

    if(b < 0 && b != 0){
        if(b != 0){
            do {
                    b = b + 1;
                    result = result - 1;
            } while (b < 0);
        } else {
            result = result + 0;
        }
    } else if(b != 0 || (!(b == 0) && b > 0)) {
        while(b < 0){
            b = b - 1;
            result = result + 1;
        }
    } else {
        result = result + 0;
    }

    int i = 10;
    int j = 12;

    std::vector<std::string> output;
    std::string real_output;

    for(int x = 0; x < j; x++){
       for(i = 0; i < j; i++){
            std::cout << "[" << x << "]," << "[" << i << "]" << std::endl;
           output.emplace_back("[" + std::to_string(x) + "]," + "[" + std::to_string(i) + "]");
        }
    }

    for(const std::string &str : output){
        real_output = real_output + '\n' + str;
    }

    std::cout << "The beautiful output is:\n" << real_output << std::endl;

    return 0;
}
