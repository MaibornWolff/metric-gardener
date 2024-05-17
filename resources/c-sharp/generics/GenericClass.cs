using System;

namespace GenericClassNamespace
{
    
public class GenericClass<T1, ClassB>
{
    public void GenericMethod<T>()
    {
        T obj = Activator.CreateInstance<T>();
        Console.WriteLine("Object: "+obj.ToString());
    }
}
}