import { join } from 'path';
import { Chunk } from 'webpack';

// Import header from each file and prepends to its output
export function generateHeader(data: { hash: string; chunk: Chunk; filename: string }): string {
    const ts_filename = data.filename.substring(0, data.filename.length - 2) + "ts";
    const lines = require("fs").readFileSync(join(__dirname, "../src/", ts_filename), "utf-8").split("\n")
    const headers: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.length < 2) {
            break;
        }
        else if (line[0] != "/" || line[1] != "/") {
            break;
        }

        headers.push(line);
    }

    return headers.join("\n");
}