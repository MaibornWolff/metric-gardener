import * as React from "react";

class Person {
    name: { firstname: string; lastname: string } | undefined;
}
type MyProps = {
    // using `interface` is also ok
    message: string;
};
type MyState = {
    count: number; // like this
};
class App extends React.Component<MyProps, MyState> {
    state: MyState = {
        // optional second annotation for better type inference
        count: 0,
    };
    render() {
        return (
            //this is React specific
            <div>
                {this.props.message} {this.state.count}
            </div>
        );
    }
}

type CustomValue = any;
interface Props {
    propA: CustomValue;
}
interface DefinedState {
    otherStateField: string;
}
type State = DefinedState & ReturnType<typeof transformPropsToState>;
function transformPropsToState(props: Props) {
    return {
        savedPropA: props.propA, // save for memoization
        derivedState: props.propA,
    };
}
class Comp extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            //React specific
            otherStateField: "123",
            ...transformPropsToState(props),
        };
    }
    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.propA.equal(state.savedPropA)) return null;
        return transformPropsToState(props);
    }
}
enum CardinalDirections {
    North,
    East,
    South,
    West,
}
