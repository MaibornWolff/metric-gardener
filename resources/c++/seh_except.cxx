#include <stdio.h>
#include <Windows.h>
#include <exception>
/**
 * Structured Exception Handling (SEH) is a Microsoft extension only available on Windows.
 */
int main()
{
    __try
    {
        throw std::exception("");
    }
    __except(EXCEPTION_EXECUTE_HANDLER)
    {
        printf("Inside SEH __except block");
    }

    return 0;
}