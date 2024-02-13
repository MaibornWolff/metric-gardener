public class InitializationBlockExample {
    static {
        System.out.println("Static Initialization Block executed.");
    }//+1 function
    {
        System.out.println("Instance Initialization Block executed.");
    } //+1 function

}