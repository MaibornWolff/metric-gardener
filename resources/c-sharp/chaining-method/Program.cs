using ChainingMethodNamespace;

namespace ChainingNamespace{
    class Chaining
    {

        static void Main()
        {
            ClassD classD = new ClassA().returnClassB().returnClassC().returnClassD();
        }
    }
}
