package employee

import (
	"fmt"
)
type Age int
type (
	T5 struct{ f *T5 }
)
func main() {
    var anyType = struct{ Name string }{Name: "John Doe"}

}
interface {
	Read([]byte) (int, error)
	Write([]byte) (int, error)
	Close() error
}
type Employee struct {
	FirstName  string
	LastName   string
	Salary     int
	SalaryPaid int
}

type PaySalary interface {
	Pay(payment int) int
	Tax(tax float64) float64
}

type DoSomething interface {
	Run()
	Hop()
}

func (employee Employee) SalaryRemaining() {

	fmt.Printf("%s %s still has to be paid %d euros\n", employee.FirstName, employee.LastName, (employee.Salary - employee.SalaryPaid))

}

func (e Employee) Pay(payment int) int {
	e.SalaryPaid += payment
	return e.SalaryPaid
}

func (e Employee) Tax(tax float64) float64 {
	return tax
}

func (e Employee) Run() {
	fmt.Println("Ruunnning!!!")
}

func (e Employee) Hop() {
	fmt.Println("Hop, hop, hoppala!")
}
