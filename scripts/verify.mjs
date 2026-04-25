import fs from "node:fs";
import path from "node:path";

function checkFile(filePath, label) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`[OK] ${label}: ${stats.size} bytes`);
    return true;
  } else {
    console.log(`[MISSING] ${label}: ${filePath}`);
    return false;
  }
}

console.log("=== 验证项目文件 ===\n");

const requiredFiles = [
  ["package.json", "package.json"],
  ["tsconfig.json", "tsconfig.json"],
  ["prisma/schema.prisma", "Prisma schema"],
  [".env.example", "环境变量示例"],
];

let allOk = true;

for (const [file, label] of requiredFiles) {
  if (!checkFile(path.join(process.cwd(), file), label)) {
    allOk = false;
  }
}

console.log("\n=== 验证结果 ===");
if (allOk) {
  console.log("所有必需文件已就绪");
  process.exit(0);
} else {
  console.log("部分必需文件缺失，请检查");
  process.exit(1);
}
