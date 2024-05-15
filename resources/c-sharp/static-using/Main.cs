using static StaticUsedNamespace.ClassA;
using NormalUsedNamespace;

namespace Programm
{
    class Program
    {
        static void Main()
        {
            MyMethod();
            ClassB.MyMethod();
            ClassC.MyMethod();
        }
    }
}
