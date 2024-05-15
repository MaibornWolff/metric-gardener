using static TestNamespace1.ClassA;
using FalsyNamespace;

namespace Programm
{
    class Program
    {
        static void Main()
        {
            MyMethod();
            ClassB.MyMethod();
        }
    }
}
