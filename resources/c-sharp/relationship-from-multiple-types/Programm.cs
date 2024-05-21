
using implementClassNamespace;
namespace mainNamespace
{
    class Program
    {
        static void Main()
        {
            ImplementClass theClass = new ImplementClass();
        }
    }
    class DoThing
    {
        static void doSomething(ImplementClass t)
        {
        }
    }
    class ClassAsReturnType
    {
        static ImplementClass returnClass()
        {
        return new ImplementClass();
        }
    }
}
