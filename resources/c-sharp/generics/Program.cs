using ClassANamespace;
using ClassDNamespace;
using GenericClassNamespace;
using ClassCNamespace;

namespace mainNamespace
{
    class Program
    {

        static void Main()
        {
            var genericObject = new GenericClass<ClassA, ClassD, ClassA>();

            genericObject.GenericMethod<ClassC>();
        }
    }
}
