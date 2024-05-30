using System.Net.Security;
using System.Runtime.InteropServices;
using ChainingMethodNamespace;

namespace ChainingNamespace{
    class Chaining
    {

        static void Main()
        {
            ClassC classC = new ClassA().returnClassB().returnClassC();
        }
    }
}
