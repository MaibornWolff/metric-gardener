import * as React from 'react';

const MyComponent = () => {
    const x = 10; //inline

    return (
        <div>
            {/*
            This is a multiline comment
             hihihi
             */}
            <h1>{x}</h1>
            <button
                onClick={(event) => {
                    /* comment! */
                }}
            />
        </div>
    );
};

export default MyComponent;