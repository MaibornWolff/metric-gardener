using System;
using ClassBNamespace;
namespace GenericClassNamespace
{

public class GenericClass<T1, T2> where T2 : ClassB
{
    public void GenericMethod<T>()
    {
        T obj = Activator.CreateInstance<T>();
        Console.WriteLine("Object: "+obj.ToString());
    }
}
}
