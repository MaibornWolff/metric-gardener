public class ExampleClass {
    private static int staticVariable = 0;
    private int instanceVariable = 0;
    private String message = "message";
    public static void incrementStaticVariable() {
        staticVariable++;
    }
    public static String returnStaticMessage() {
        return "Hello";
    }
    public void incrementInstanceVariable() {
        instanceVariable++;
    }
    public String returnMessage() {
        return this.message;
    }
    public static void main(String[] args) {
        ExampleClass obj1 = new ExampleClass(5);
        ExampleClass obj2 = new ExampleClass(10);
    }
}