using ChainingMethodNamespace;

namespace ChainingNamespace{
    class Chaining
    {

        static void Main()
        {
            ClassD classD = new ClassA().returnClass().returnClass().returnClass();
        }
    }
}
