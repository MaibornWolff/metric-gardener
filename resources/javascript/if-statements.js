let x, b, y, z, yz, myList;

if (x > b) {  // complexity +1
    if ((x > 100 && x <= 122) || !x) {    // complexity +3
        x = 2;
    } else if (x > 122) {    // complexity +1
        x = 300;
    } else {
        x = 1;
    }
    x = 1;
}

x = x > 100 ? 101 : 99;    // complexity +1

/*
    if (not) {
    else if (good) {
        echo "won't be counted! yippi!";
    }
 */

x = x + y;

z = x > 0 ? x : false;    // complexity +1
