
const parsePromises = new Set<Promise<string | null>>();

parsePromises.add(
    fetchData("www.google.com").catch((reason) => { //+0 complexity
        return null;
    }),
);
async function waiting(){
    try {
        await fetchData("google.com");
    }catch (e){ //+1 complexity
        console.log("fail")
    }
}
async function fetchData(url: string): Promise<string> {
    // Simulate an asynchronous operation, like fetching data from an API
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            const data = `Data fetched from ${url}`;
            resolve(data);
        }, 1000); // Simulating a delay of 1 second
    });
}