public class SwitchStatementExample {
    public static void main(String[] args) {
        int dayOfWeek = 3; // Assuming 1 represents Sunday, 2 represents Monday, and so on...

        switch (dayOfWeek) {
            case 1:
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

    }
}