using System.Net.Security;

namespace ChainingMethodNamespace
{
    public class ClassA
    {
        public ClassB returnClassB()
        {
            return new ClassB();
        }
    }
    public class ClassB
    {
        public ClassC returnClassC()
        {
            return new ClassC();
        }
    }
    public class ClassC
    {

    }

}
