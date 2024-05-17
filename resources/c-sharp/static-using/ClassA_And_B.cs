using static System.Console;

namespace StaticUsedNamespace1
{
    public class ClassA
    {
        public static void MyMethod()
        {
            WriteLine("Hello from StaticUsedNamespace1.ClassA's MyMethod!");
        }
    }

    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from StaticUsedNamespace1.ClassB's MyMethod!");
        }
    }
}

namespace StaticUsedNamespace2
{

    public class ClassA
    {
        public static void MyMethod2()
        {
            test();
        }

        static void test()
        {
            WriteLine("Hello from test-Method!");
        }
    }
}

namespace NormalUsedNamespace
{
    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from NormalUsedNamespace.ClassB's MyMethod!");
        }
    }

    public class ClassC
    {
        public static void MyMethod()
        {
            WriteLine("Hello from NormalUsedNamespace.ClassC's MyMethod!");
        }
    }
}
