import * as React from 'react';

interface MyComponentProps {
    data: string[];
}

const MyComponent: React.FC<MyComponentProps> = ({ data }) => {
    return (
        <div>
            <h1>Loop in React using map (TSX)</h1>
            <ul>
                {data.map((item, index) => (
                    // Using the map function to iterate over the data and render a list
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default MyComponent;