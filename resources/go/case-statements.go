package main

import "fmt"

func main() {

    switch time.Now().Weekday() {
        case time.Saturday, time.Sunday:
            fmt.Println("It's the weekend")
        case time.Saturday, time.Sunday:
            fmt.Println("It's the weekend")
        default:
            fmt.Println("It's a weekday")
    }
    var a []int
    var c, c1, c2, c3, c4 chan int
    var i1, i2 int

    select {
    case i1 = <-c1:
    	print("received ", i1, " from c1\n")
    case c2 <- i2:
    	print("sent ", i2, " to c2\n")
    case i3, ok := (<-c3):  // same as: i3, ok := <-c3
        print(hello)
    case a[f()] = <-c4:
    	// same as:
    	// case t := <-c4
    	//	a[f()] = t
    default:
    	print("no communication\n")
    }
}
