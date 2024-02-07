#ifndef HELPER_TEMPLATE_697843
#define HELPER_TEMPLATE_697843

#include <vector>

namespace helper {

    template <typename Result, typename... Arguments>
    Result variadic_helper_function(Arguments... arguments)
    {

    }

    template <typename Result, typename Argument>
    Result helper_function(Argument argument)
    {

    }

    template <typename T>
    class Adder {

        public:

            T add(T a, T b)
            {
                return a + b;
            }

            T add_slow(T a, T b){
                T result = a;
                if(b < 0){
                    while(b < 0){
                        b = b + 1;
                        result = result - 1;
                    }
                } else {
                    while(b < 0){
                       b = b - 1;
                       result = result + 1;
                    }
                }
            }

            T add(std::vector<T> vector){
                T result = 0;

                for(T &element : vector) {
                    result += element;
                }

                return result;
            }
    };

}

#endif