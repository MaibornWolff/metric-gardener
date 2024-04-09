int x, y;
double z;

if (x > y) {

    if ( x > 100 || x < 0) {
        y = 1000;
    } else if ( y % x == 1 ) {
        y = 1001;
    } else {
        y = x;
    }
} else {
    x = y;
}

/*
    if (not) {
    else if (good) {
        echo "won't be counted! yippi!";
    }
*/

bool myBool = true;


if (myBool is true or false) {
    Console.Write("hello");
}

myBool = (x is 1); // this should not increase complexity
myBool = (x is 1 and 5); // this should

int? x = (x > 100) ? 12 : null;

string Answer = Answer1 ?? Answer2 ?? Answer3 ?? Answer4;
List<int>? numbers = null;
(numbers ??= new List<int>()).Add(5);
