import { getParserTestConfiguration } from "../../../test/metric-end-results/TestHelper";
import { formatPrintPath } from "./Helper";
import { Configuration } from "../Configuration";
import path from "path";

describe("Helper.ts", () => {
    describe("formatPrintPath(...)", () => {
        it("should change nothing when the config does not say otherwise", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getParserTestConfiguration("/some/path");

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(filePath);
        });

        it("should replace forward slashes when configured", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = new Configuration(
                "/some/path",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                false,
                true,
            );

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "\\some\\path\\for\\the\\test.extension",
            );
        });

        it("should not replace backward slashes", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\file.extension";
            const config = new Configuration(
                "C:\\Users\\user\\documents\\code",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                false,
                true,
            );

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(filePath);
        });

        it("should create UNIX-style relative paths when configured", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = new Configuration(
                "/some/path",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                true,
                false,
            );

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("for/the/test.extension");
        });

        it("should create DOS-style relative paths when configured", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = new Configuration(
                "C:\\Users\\user\\documents\\code",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                true,
                false,
            );

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(
                "more-code\\file.extension",
            );
        });

        it("should return the file name if the file path equals the sources path (UNIX-style)", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = new Configuration(
                "/some/path/for/the/test.extension",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                true,
                false,
            );

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("test.extension");
        });

        it("should return the file name if the file path equals the sources path (DOS-style)", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = new Configuration(
                "C:\\Users\\user\\documents\\code\\more-code\\file.extension",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                true,
                false,
            );

            expect(formatPrintPath(filePath, config, path.win32)).toEqual("file.extension");
        });

        it("should both create relative paths and replace forward slashes when configured", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = new Configuration(
                "/some/path",
                "invalid/output/path",
                false,
                "",
                false,
                "",
                false,
                true,
                true,
            );

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "for\\the\\test.extension",
            );
        });
    });
});
