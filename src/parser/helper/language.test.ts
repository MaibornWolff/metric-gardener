import { describe, expect, it } from "vitest";
import {
    getTestConfiguration,
    mockPosixPath,
    mockWin32Path,
} from "../../../test/metric-end-results/test-helper.js";
import { assumeLanguageFromFilePath, Language } from "./language.js";

describe("assumeLanguageFromFilePath(...)", () => {
    it("should extract the language from a supported file extension in UNIX-Style paths", () => {
        const filePath = "/path/to/the/File.java";
        const config = getTestConfiguration(filePath);

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.Java);
    });

    it("should extract the language from a supported file extension in DOS-Style paths", () => {
        const filePath = "C:\\users\\user\\documents\\File.java";
        const config = getTestConfiguration(filePath);

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.Java);
    });

    it("should treat .h files as C++ per default", () => {
        const filePath = "File.h";
        const config = getTestConfiguration(filePath);

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C if configured", () => {
        const filePath = "File.h";
        const config = getTestConfiguration(filePath, { parseAllHAsC: true });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it lies in a folder specified in the configuration (DOS-style)", () => {
        mockWin32Path();
        const filePath = "C:\\users\\user\\code\\folder-for-c\\sub-folder\\File.h";
        const config = getTestConfiguration("C:\\users\\user\\code", {
            parseSomeHAsC: "folder-for-c",
        });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it lies in a folder specified in the configuration (UNIX-style)", () => {
        mockPosixPath();
        const filePath = "/path/to/the/code/sub-folder/folder-for-c/sub-folder/File.h";
        const config = getTestConfiguration("/path/to/the/code", { parseSomeHAsC: "folder-for-c" });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.C);
    });

    it("should treat a .h file as C++ if it lies outside of folders specified in the configuration (DOS-style)", () => {
        mockWin32Path();
        const filePath = "C:\\users\\user\\code\\folder-for-c++\\sub-folder\\File.h";
        const config = getTestConfiguration("C:\\users\\user\\code", {
            parseSomeHAsC: "folder-for-c, c-file.h",
        });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C++ if it lies in outside of folders specified in the configuration (UNIX-style)", () => {
        mockPosixPath();
        const filePath = "/path/to/the/code/sub-folder/folder-for-c++/sub-folder/File.h";
        const config = getTestConfiguration("/path/to/the/code", {
            parseSomeHAsC: "folder-for-c, c-file.h",
        });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C if it has a name specified in the configuration (DOS-style)", () => {
        mockWin32Path();
        const filePath = "C:\\users\\user\\code\\folder-for-c++\\sub-folder\\c-file.h";
        const config = getTestConfiguration("C:\\users\\user\\code", {
            parseSomeHAsC: "folder-for-c, c-file.h",
        });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it has a name specified in the configuration (UNIX-style)", () => {
        mockPosixPath();
        const filePath = "/path/to/the/code/sub-folder/folder-for-c++/sub-folder/c-file.h";
        const config = getTestConfiguration("/path/to/the/code", {
            parseSomeHAsC: "folder-for-c, c-file.h",
        });

        expect(assumeLanguageFromFilePath(filePath, config)).toBe(Language.C);
    });
});
