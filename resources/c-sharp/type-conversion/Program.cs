using classANamespace;
using classBNamespace;

namespace ProgramNamespace
{
    class Program
    {
        static void Main()
        {
            var classB = new ClassB();
            var transfer = classB as ClassA;
        }
    }
}
