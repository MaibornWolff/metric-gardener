using classANamespace;
using classBNamespace;

namespace ProgramNamespace
{
    class Program
    {
        static void Main()
        {
            ClassAFactory classAFactory = new ClassAFactory();
            ClassB classB = classAFactory.CreateClassA();
            classB.methodOfClassB();

            var classA = classB as ClassA;
        }
    }
}
