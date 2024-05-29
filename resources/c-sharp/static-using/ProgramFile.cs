using static StaticUsedNamespace.ClassA;
using NormalUsedNamespace;

namespace ProgramNamespace
{
    class ProgramClass
    {
        static void Main()
        {
            MyMethod();
            ClassB.MyMethod();
        }
    }
}
