class Loop {
    public void loopMethod(int n) {
        for (int i = 0; i < n; i++) {
            System.out.println("Iteration " + (i + 1));
        }
        int[] numbers = {1, 2, 3, 4, 5};
        for (int num : numbers) {
            System.out.println("Element: " + num);
        }
        int counter = 0;
        while (counter < n) {
            System.out.println("Iteration " + (counter + 1));
            counter++;
        }
        while (counter < n || counter == 3 && counter > 0) {
            System.out.println("Iteration " + (counter + 1));
            counter++;
        }
        do {
            System.out.print("Enter a number (0 to exit): ");
            userInput = scanner.nextInt();

            // Your code inside the loop goes here
            System.out.println("You entered: " + userInput);

        } while (userInput == 0 || userInput > 0 && userInput == 2);
    }
}
