let text;

switch (new Date().getDay()) {
    case 4:  // complexity +1
    case 5:  // complexity +1
        text = "Soon it is Weekend";
        break;
    case 0:  // complexity +1
    case 6:  // complexity +1
        text = "It is Weekend";
        break;
    default:
        text = "Looking forward to the Weekend";
}

console.log(text);
