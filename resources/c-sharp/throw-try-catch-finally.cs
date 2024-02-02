using System;
using System.IO;

try {
    FileStream fs = File.Open("not_existing_file", FileMode.Open);
    throw new Exception("throwing exceptions is my thing");
} catch (Exception e) {
    Console.WriteLine(e);
} finally {
    Console.WriteLine("finally");
}