using ClassANamespace;
using ClassBNamespace;
using ClassCNamespace;

namespace ProgramNamespace
{
    class Program
    {
        static void Main(string[] args)
        {
            for(ClassB b = new ClassB(0); b.smaller(new ClassC()); b = ClassA.next(b))
            {
                Console.WriteLine(b.getI());
            }
        }
    }
}
