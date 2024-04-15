package main

import "fmt"

func notTheMain() {
}

func main() {
    f := func() int { return 7 }

}
func f() (result int) {
	defer func() {
		// result is accessed after it was set to 6 by the return statement
		result *= 7
	}()
	return 6
}
interface {
	Read([]byte) (int, error)
	Write([]byte) (int, error)
	Close() error
}
type Reader interface {
	Read(p []byte) (n int, err error)
	Close() error
}
go func(ch chan<- bool) { for { sleep(10); ch <- true }} (c)
func (p Person) greet() {
    fmt.Printf("Hello, my name is %s and I am %d years old.\n", p.Name, p.Age)
}

