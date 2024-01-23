public class AccessModifierExample {

    public void publicMethod() {
        this.protectedMethod();
        System.out.println("This is a public method.");
    }

    protected void protectedMethod() {
        System.out.println("This is a protected method.");
    }

    void defaultMethod() {
        System.out.println("This is a default (package-private) method.");
    }

    private void privateMethod() {
        System.out.println("This is a private method.");
    }
}