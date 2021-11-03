
export function getParseFile(filePath: string): undefined | ParseFile {
    if (filePath.includes(".")) {
        const extension = filePath.split(".").pop()
        return { language: extension.toLowerCase(), filePath: filePath }
    }
}
