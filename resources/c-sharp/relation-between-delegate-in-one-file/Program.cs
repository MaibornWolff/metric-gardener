namespace DelegateNamespace
{
    public class Mainy {
        public static void Main(){
             MyDelegate myDelegate = myFunction;
        }
        public static void myFunction(string message){

        }
    }
    public delegate void MyDelegate(string message);

}

