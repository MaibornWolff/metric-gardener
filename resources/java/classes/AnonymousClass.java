interface HelloWorld {
    public void greetSomeone(String someone);
}
HelloWorld frenchGreeting = new HelloWorld() {
    String name = "tout le monde";

    public void greetSomeone(String someone) {
        name = someone;
        System.out.println("Salut " + name);
    }
};
