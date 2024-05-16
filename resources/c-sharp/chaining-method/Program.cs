using System.Net.Security;
using System.Runtime.InteropServices;
using ChainingMethodNamespace;
namespace ChainingNamespace{
    class Chaining
    {

        static void Main()
        {
            var classC = new ClassA().returnClassB().returnClassC();
        }
    }
}
