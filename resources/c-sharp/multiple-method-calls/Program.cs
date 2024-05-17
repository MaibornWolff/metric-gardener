using NamespaceA;

namespace mainNamespace
{
    class MultipleMethodCalls
    {

        static void Main()
        {
            ClassA classA = new ClassA();
            classA.MyMethod1();
            classA.MyMethod2();
            classA.MyMethod3();

            ClassA classA2 = new ClassA();
            classA2.MyMethod1();
            classA2.MyMethod2();
            classA2.MyMethod3();
        }
    }
}
