import fs from "node:fs";

const roots = [
  "src/app/api/admin/banner/route.ts",
  "src/app/api/admin/categories/route.ts",
  "src/app/api/admin/login/route.ts",
  "src/app/api/admin/logout/route.ts",
  "src/app/api/admin/orders/[id]/route.ts",
  "src/app/api/admin/products/route.ts",
  "src/app/api/admin/products/[id]/route.ts",
  "src/app/api/admin/promotions/route.ts",
  "src/app/api/admin/promotions/[id]/route.ts",
  "src/app/api/admin/session/route.ts",
  "src/app/api/admin/settings/route.ts",
  "src/app/api/admin/store/route.ts",
  "src/app/api/admin/upload/route.ts",
  "src/app/api/orders/route.ts",
  "src/app/api/orders/log/route.ts",
  "src/app/api/store/route.ts",
];

const banner = `export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n\n`;

for (const file of roots) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes('export const dynamic = "force-dynamic"')) {
    console.log("skip", file);
    continue;
  }
  const m = s.match(/^(?:import[\s\S]*?;\r?\n)+/);
  if (m) {
    s = m[0] + "\n" + banner + s.slice(m[0].length);
  } else {
    s = banner + s;
  }
  fs.writeFileSync(file, s);
  console.log("patched", file);
}
