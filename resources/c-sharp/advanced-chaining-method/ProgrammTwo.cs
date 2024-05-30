using ChainingMethodNamespace;

namespace ChainingNamespaceTwo{
    class ChainingTwo
    {

        static void MainTwo()
        {
            ClassB classB = new ClassB();
            ClassE classE = new ClassC().returnClass().returnClass();
        }
    }
}
