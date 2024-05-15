using static System.Console;

namespace StaticUsedNamespace
{
    public class ClassA
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }

    }

    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
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

        void test()
        {
        }
    }
}

namespace NormalUsedNamespace
{
    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }
    }

    public class ClassC
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }
    }
}
