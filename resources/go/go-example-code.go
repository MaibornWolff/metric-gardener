package main
        
import "fmt"

func notTheMain() {
}

func main() {

    if 7%2 == 0 {
        fmt.Println("7 is even")
    } else {
        fmt.Println("7 is odd")
    }

    if 8%4 == 0 {
        fmt.Println("8 is divisible by 4")
    }

    // go comment line 1
    // go comment line 2
    // go comment line 3

    /*
    go block comment line 1
    go block comment line 2
    go block comment line 3
    */



    if num := 9; num < 0 {  // inline comment goes here
        fmt.Println(num, "is negative")
    } else if num < 10 && num < 11 || num > 1000 {
        fmt.Println(num, "has 1 digit")
    } else {
        fmt.Println(num, "has multiple digits")
    }

    switch time.Now().Weekday() {
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend")
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend")
    default:
        fmt.Println("It's a weekday")
    }

    for num < 100 {
      num -= 1
    }

}