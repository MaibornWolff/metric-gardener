import * as React from 'react';

interface MyComponentProps {
    condition: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ condition }) => {
    return (
        <div>
            <h1>Conditional Rendering in React (TSX)</h1>
            {condition ? (
                <p>Condition is true, rendering this content.</p>
            ) : (
                <p>Condition is false, rendering alternative content.</p>
            )}
        </div>
    );
};

export default MyComponent;