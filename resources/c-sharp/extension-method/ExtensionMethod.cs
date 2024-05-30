using EnumNamespace;

namespace ExtensionMethodNamespace
{
    public static class MyExtension
    {
        public static int count(this EnumType enumA)
        {
            return 3;
        }
    }

}
