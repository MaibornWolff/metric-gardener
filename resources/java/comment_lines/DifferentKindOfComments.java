// Single-line comment

/*
 * Multi-line comment
 *
 * This is another line of the multi-line comment.
 */

/*
  Multi-line comment containing line break



  This is another line of the multi-line comment.
 */
public class CommentExample {
    /**
     * Main method to demonstrate comments.
     * @param number .
     */
    public void doSomething(int number){
        number++; //increment
        number--; /* short comment*/
        System.out.print(/*between the line*/ "hello world"); /*hello*/ //greeting
        System.out.print(/* multiline
        more multiline
        */"hello");
        System.out.print(
                //hello
                "hello"
                //hello
        );
// ╔════════════╗
// ║ Hello!     ║
// ╚════════════╝
    }
}