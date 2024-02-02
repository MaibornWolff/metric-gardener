FunctionsAndMethods obj = new FunctionsAndMethods();
Del d = obj.testFunction1;

void testMethod() {}

int outOfScope() {
    return 3;
}

public class FunctionsAndMethods {

    private string hello;

    public FunctionsAndMethods() {
        hello = "hello";
    }

    public int testFunction1(int x, int y) {
        return 1;
    }

    int testFunction2(int x, int y) {
        return 1;
    }

    private int testFunction3() {
        return 1;
    }

    public static void staticMethod() {}

}

public delegate int Del(int x, int y);
