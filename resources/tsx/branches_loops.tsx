function switchFunction(text: string): { message: string } {
    switch (text) {
        case "option1":
            return { message: "helo" };
        case "option2":
            return { message: "bye" };
        default:
            console.log(":(");
    }
    if (text.length > 7) {
        return { message: "too long" };
    } else if (text.length == 7) {
        return { message: "just right" };
    } else {
        console.log(":)");
    }
    const throwError = true;
    if (throwError) throw new Error("Error");

    for (let i = 0; i < 10; i++) {
        console.log("hello");
    }
    let someArray = [1, "string", false];
    for (let entry of someArray) {
        console.log(entry);
    }
    for (let i in someArray) {
        console.log(i);
    }

    let counter = 0;
    while (counter < 5) {
        counter++;
    }
    do {
        counter--;
    } while (counter > 0);
    return { message: "fine" };
}
