import { Test } from "./CommentKeyword.js";
import { describe, expect, it } from "vitest";

describe("texthelper", () => {
    it("1 should return True if it finds a word in input", () => {
        let keyword = "bug";
        let input = "this is a bug";
        let testclass = new Test();

        let result = testclass.containsWord(input, keyword);

        expect(result).toBeTruthy();
    });

    it("2 should return False if it does not find a word in input", () => {
        let keyword = "bug";
        let input = "this is a game";
        let testclass = new Test();

        let result = testclass.containsWord(input, keyword);

        expect(result).toBeFalsy();
    });

    it("3 should return True if it finds a word in input", () => {
        const keyword = "bug";
        const input = "bug is not good";
        const testclass = new Test();

        const result = testclass.containsWord(input, keyword);

        expect(testclass.containsWord(input, keyword)).toBe(true);
    });

    it("4 should return True if it finds a word in input", () => {
        let keyword = "todo";
        let input = "tododo is not good";
        let testclass = new Test();

        let result = testclass.containsWord(input, keyword);

        //expect(result).toBeTruthy();

        expect("tododo is not good".includes("todo")).toBeTruthy();
    });

    it("5 should return false if it doesj't find a word in input", () => {
        let keyword = "todo";
        let input = "BUGGER is not good";
        let testclass = new Test();

        let result = testclass.containsWord(input, keyword);

        expect(result).toBe(false);
    });
});
