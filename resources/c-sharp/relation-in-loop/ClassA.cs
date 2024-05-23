using ClassBNamespace;

namespace ClassANamespace
{
public class ClassA
{
    public static ClassB next(ClassB b)
    {   
        return new ClassB(b.getI()+1);
    }
}
}