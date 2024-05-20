
using GenericNamespace;
namespace ProgramNamespace
{
    class Program
    {
        static void Main()
        {
            GenericClass<InputTypeForGenericClass> firstGeneric = new GenericClass<InputTypeForGenericClass>();
            ClassWithGenericMethod.genericMethod<InputTypeForGenericMethod>();
        }
    }
}
