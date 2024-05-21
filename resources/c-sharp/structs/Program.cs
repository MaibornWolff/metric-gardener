using System;
using StructNamespace;
namespace CsharpStruct {
  class Program {
    static void Main(string[] args) {

      // declare emp of struct Employee
      Employee emp;

      // accesses and sets struct field
      emp.id = 1;

      // accesses struct methods
      emp.getId(emp.id);
    }
  }
}
