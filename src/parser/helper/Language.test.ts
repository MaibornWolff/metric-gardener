import { assumeLanguageFromFilePath, Language } from "./Language";
import { getParserTestConfiguration } from "../../../test/metric-end-results/TestHelper";
import { Configuration } from "../Configuration";

describe("assumeLanguageFromFilePath(...)", () => {
    it("should extract the language from a supported file extension in UNIX-Style paths", () => {
        const path = "/path/to/the/File.java";
        const config = getParserTestConfiguration(path);

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.Java);
    });

    it("should extract the language from a supported file extension in DOS-Style paths", () => {
        const path = "C:\\users\\user\\documents\\File.java";
        const config = getParserTestConfiguration(path);

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.Java);
    });

    it("should treat .h files as C++ per default", () => {
        const path = "File.h";
        const config = getParserTestConfiguration(path);

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C if configured", () => {
        const path = "File.h";
        const config = getParserTestConfiguration(path, true);

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it lies in a folder specified in the configuration (DOS-style)", () => {
        const path = "C:\\users\\user\\code\\folder-for-c\\sub-folder\\File.h";
        const config = new Configuration(
            "C:\\users\\user\\code",
            "C:\\users\\user\\code",
            false,
            "",
            false,
            "folder-for-c",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it lies in a folder specified in the configuration (UNIX-style)", () => {
        const path = "/path/to/the/code/sub-folder/folder-for-c/sub-folder/File.h";
        const config = new Configuration(
            "/path/to/the/code",
            "invalid/output/path",
            false,
            "",
            false,
            "folder-for-c",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.C);
    });

    it("should treat a .h file as C++ if it lies outside of folders specified in the configuration (DOS-style)", () => {
        const path = "C:\\users\\user\\code\\folder-for-c++\\sub-folder\\File.h";
        const config = new Configuration(
            "C:\\users\\user\\code",
            "C:\\users\\user\\code",
            false,
            "",
            false,
            "folder-for-c, c-file.h",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C++ if it lies in outside of folders specified in the configuration (UNIX-style)", () => {
        const path = "/path/to/the/code/sub-folder/folder-for-c++/sub-folder/File.h";
        const config = new Configuration(
            "/path/to/the/code",
            "invalid/output/path",
            false,
            "",
            false,
            "folder-for-c, c-file.h",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.CPlusPlus);
    });

    it("should treat a .h file as C if it has a name specified in the configuration (DOS-style)", () => {
        const path = "C:\\users\\user\\code\\folder-for-c++\\sub-folder\\c-file.h";
        const config = new Configuration(
            "C:\\users\\user\\code",
            "C:\\users\\user\\code",
            false,
            "",
            false,
            "folder-for-c, c-file.h",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.C);
    });

    it("should treat a .h file as C if it has a name specified in the configuration (UNIX-style)", () => {
        const path = "/path/to/the/code/sub-folder/folder-for-c++/sub-folder/c-file.h";
        const config = new Configuration(
            "/path/to/the/code",
            "invalid/output/path",
            false,
            "",
            false,
            "folder-for-c, c-file.h",
            false,
            false,
            false,
        );

        expect(assumeLanguageFromFilePath(path, config)).toBe(Language.C);
    });
});
