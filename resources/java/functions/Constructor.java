public class Book {
    private String title;
    private String author;
    private int pageCount;

    // Constructor with no parameters
    public Book() {
        this.title = "Unknown Title";
        this.author = "Unknown Author";
        this.pageCount = 0;
    }

    // Constructor with title and author parameters
    public Book(String title, String author) {
        this.title = title;
        this.author = author;
        this.pageCount = 0; // Default page count
    }

    // Constructor with all parameters
    public Book(String title, String author, int pageCount) {
        this.title = title;
        this.author = author;
        this.pageCount = pageCount;
    }

    // Getter methods for accessing private fields
    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public int getPageCount() {
        return pageCount;
    }

    // Setter methods for modifying private fields
    public void setTitle(String title) {
        this.title = title;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setPageCount(int pageCount) {
        this.pageCount = pageCount;
    }

    // Method to display book information
    public void displayBookInfo() {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Page Count: " + pageCount);
    }

    /**
     * Main method to demonstrate the usage of the Book class with different constructors.
     *
     * @param args Command-line arguments (not used in this example).
     */
    public static void main(String[] args) {
        // Using different constructors to create Book objects
        Book book1 = new Book(); // Using the default constructor
        Book book2 = new Book("Java Programming", "John Doe"); // Using the constructor with title and author
        Book book3 = new Book("Design Patterns", "Jane Smith", 300); // Using the constructor with all parameters

        // Displaying book information
        book1.displayBookInfo();
        System.out.println();

        book2.displayBookInfo();
        System.out.println();

        book3.displayBookInfo();
    }
}