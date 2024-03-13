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
/*comment
*/export default MyComponent; /*more comment
more
more */
//last comment