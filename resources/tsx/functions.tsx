import * as React from 'react';

type AppProps = {
    message: string;
};
const el = (
    <button onClick={(event) => {
            /* event will be correctly typed automatically! */
        }}
    />
);
const App = ({ message }: AppProps): React.JSX.Element => <div>{message}</div>; //lambda expression
function useCallbackCustom<T extends (...args: any[]) => any>(
    callback: T,
    deps: []
): T{
    return useCallback(callback, deps);
}
useCallbackCustom((e) => {console.log("hi")}, []);
class UseFunction{
    thisIsAFunction(){
        console.log("hello");
    }
    private testFunction3(): number {
        return 2;
    }
    public static staticMethod() {}
}
const myFunction = function myFunctionDefinition() {
    return 42;
};
let sum = (x: number, y: number): number => {
    return x + y;
}