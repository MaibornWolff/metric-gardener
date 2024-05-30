using System.Net.Security;

namespace ChainingMethodNamespace
{
    public class ClassA
    {
        public ClassB returnClass()
        {
            return new ClassB();
        }
    }
    public class ClassB
    {
        public ClassC returnClass()
        {
            return new ClassC();
        }
    }
    public class ClassC
    {
        public ClassD returnClass()
        {
            return new ClassD();
        }
    }
    public class ClassD
    {
        public ClassE returnClass()
        {
            return new ClassE();
        }
    }
    public class ClassE
    {
        public ClassA returnClass()
        {
            return new ClassA();
        }
    }
}
