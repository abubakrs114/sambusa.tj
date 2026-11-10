import fs from "node:fs";
import path from "node:path";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "route.ts") out.push(full);
  }
  return out;
}

const files = walk("src/app/api");
const banner = `export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n`;

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(/\n?export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n+/g, "\n");
  // Collect import lines (including multiline imports)
  const lines = s.split(/\r?\n/);
  const importLines = [];
  const rest = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("import ") || line.startsWith("import{") || line.startsWith("import type")) {
      let block = line;
      while (!block.includes(";") && i + 1 < lines.length) {
        i += 1;
        block += "\n" + lines[i];
      }
      importLines.push(block);
      i += 1;
      continue;
    }
    if (line.trim() === "" && rest.length === 0 && importLines.length > 0) {
      i += 1;
      continue;
    }
    rest.push(line);
    i += 1;
  }
  const body = rest.join("\n").replace(/^\n+/, "");
  const next = `${importLines.join("\n")}\n\n${banner}\n${body}`.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(file, next.endsWith("\n") ? next : `${next}\n`);
  console.log("fixed", file);
}
