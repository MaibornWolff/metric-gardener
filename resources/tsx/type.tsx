import { string } from "yargs";
type ObjectType = {
    message: string;
    name: string;
    number: number;
};
type union = { a: 1 } & { b: 2 };
type intersect = { a: 1 } | { b: 2 }; // object
type func = (() => string) | (() => void); // function
type tuple = [name: string, age: number];

const data = { info1: string, info2: string };
type NewType = typeof data;
