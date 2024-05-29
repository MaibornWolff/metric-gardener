namespace classBNamespace
{
    public class ClassB
    {
        public void methodOfClassB()
        {
            Console.WriteLine("its classB");
        }
    }

    public class ClassAFactory
    {
        public ClassB CreateClassA()
        {
            return new ClassA();
        }
    }
}
