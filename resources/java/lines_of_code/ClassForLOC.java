public class MyClass {
    private int myNumber; // Variable
    InnerClass innerClass;

    // Constructor
    public MyClass(int initialNumber) {
        this.myNumber = initialNumber;
        this.innerClass = new InnerClass();
        innerClass.key = initialNumber;
    }

    // Method
    public void printNumber() {
        System.out.println("My number is: " + myNumber);
    }

    // Getter for the variable
    public int getMyNumber() {
        return myNumber;
    }
    public class InnerClass {
        int key;
    }
}