using static System.Console;

namespace StaticUsedNamespace
{
    public class ClassA
    {
        public static void MyMethod()
        {
            WriteLine("Hello from StaticUsedNamespace.ClassA's MyMethod!");
        }
    }

    public class NotUsedClass
    {
        public static void MyMethod()
        {
            WriteLine("Hello from StaticUsedNamespace.NotUsedClass's MyMethod!");
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
}
