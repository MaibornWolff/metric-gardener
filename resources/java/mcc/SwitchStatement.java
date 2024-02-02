public class SwitchStatementExample {
    public static void main(String[] args) {
        int dayOfWeek = 3; // Assuming 1 represents Sunday, 2 represents Monday, and so on...

        switch (dayOfWeek) {
            case 1:
                System.out.println("It's Sunday!");
                break;
            case 2:
                System.out.println("It's Monday!");
                break;
            case 3:
                System.out.println("It's Tuesday!");
                break;
            case 4:
                System.out.println("It's Wednesday!");
                break;
            case 5:
                System.out.println("It's Thursday!");
                break;
            case 6:
                System.out.println("It's Friday!");
                break;
            case 7:
                System.out.println("It's Saturday!");
                break;
            default:
                System.out.println("Invalid day of the week!");
        }
        int number = 15;

        switch (true) {
            case (number > 0 && number < 10):
                System.out.println("The number is between 1 and 9");
                break;
            case (number >= 10 || number < 20):
                System.out.println("The number is between 10 and 19");
                break;
            case (number >= 20):
                System.out.println("The number is 20 or greater");
                break;
            default:
                System.out.println("The number is either negative or zero");
        }
    }
}