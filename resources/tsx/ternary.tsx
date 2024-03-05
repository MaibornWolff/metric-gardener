import * as React from 'react';
const x = 2;
const myElement = <h1>{x < 10 ? "Hello" : "Goodbye"}</h1>;

const count = 0;
const element1 = (
        <div>
            {count && <h1>Messages: {count}</h1>}
        </div>
    );
