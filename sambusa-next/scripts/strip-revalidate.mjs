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

for (const file of walk("src/app/api")) {
  let s = fs.readFileSync(file, "utf8");
  const next = s.replace(/\nexport const revalidate = 0;\n?/g, "\n");
  if (next !== s) {
    fs.writeFileSync(file, next);
    console.log("stripped", file);
  }
}
