using ClassCNamespace;

namespace ClassBNamespace
{
public class ClassB
{   
    int i;

    public ClassB(int i)
    {
        this.i = i;
    }

    public int getI()
    {
        return i;
    }

    public bool smaller(ClassC c)
    {
        return i < c.getI();
    }
}
}