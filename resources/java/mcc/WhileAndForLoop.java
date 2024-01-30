class Loop {
    public void loopMethod(int n) {
        for (int i = 0; i < n; i++) {
            System.out.println("Iteration " + (i + 1));
        }
        int counter = 0;
        while (counter < n) {
            System.out.println("Iteration " + (counter + 1));
            counter++;
        }
    }
}
