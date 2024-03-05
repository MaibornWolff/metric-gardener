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
function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: []
): T{
    return useCallback(callback, deps);
}
useCallback((e) => {console.log("hi")}, []);
class UseFunction{
    thisIsAFUnction(){
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
