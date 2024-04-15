package main

import "fmt"

func main() {
    sum := 0
    for i := 0; i < 10; i++ {
        sum += i
    }

    for {
        // ever
        for i := 0; i < 10; i++ {
            sum += i
        }
    }
    var testdata *struct {
    	a *[7]int
    }
    for i, _ := range testdata.a {
    	f(i)
    }
    for i := range 10 {
        f(i)
    }

}
