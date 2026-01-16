const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeMoveDirIfExists(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  // Only move if it's a directory
  const stat = fs.statSync(srcDir);
  if (!stat.isDirectory()) return;
  ensureDir(path.dirname(destDir));
  fs.renameSync(srcDir, destDir);
}

function normalizeSourcePath(source) {
  // Typical CRA sourcemap sources look like:
  // "webpack://frontend/./src/App.tsx" or "webpack://frontend/src/App.tsx"
  let s = String(source);
  s = s.replace(/^webpack:\/\//, "");

  // Many production sourcemaps store app paths without a leading src/.
  // Example: "pages/Login.js" or "components/Layout.js".
  // Also ignore webpack runtime sources.
  if (s.startsWith("../webpack/") || s.startsWith("webpack/")) {
    return null;
  }

  // Some sourcemaps include a leading project namespace like "frontend/".
  if (s.startsWith("frontend/")) {
    s = s.slice("frontend/".length);
  }

  // Remove leading ./
  s = s.replace(/^\.\//, "");

  // Remove leading ../ segments
  while (s.startsWith("../")) {
    s = s.slice(3);
  }

  // If the remaining path still starts with src/, drop it because we write into frontend/src/.
  if (s.startsWith("src/")) {
    s = s.slice(4);
  }

  // Remove query/hash fragments if any
  s = s.split("?")[0].split("#")[0];

  // Normalize separators
  s = s.replace(/\\/g, "/");

  return s;
}

function main() {
  const frontendDir = __dirname;
  const buildDir = path.join(frontendDir, "build", "static", "js");

  const mapFile = fs
    .readdirSync(buildDir)
    .find((f) => f.startsWith("main.") && f.endsWith(".js.map"));

  if (!mapFile) {
    throw new Error(`Could not find main.*.js.map in ${buildDir}`);
  }

  const mapPath = path.join(buildDir, mapFile);
  const raw = fs.readFileSync(mapPath, "utf8");
  const map = JSON.parse(raw);

  if (!Array.isArray(map.sources) || !Array.isArray(map.sourcesContent)) {
    throw new Error("Sourcemap is missing sources/sourcesContent");
  }

  const placeholderSrcDir = path.join(frontendDir, "src");
  const backupDir = path.join(
    frontendDir,
    `src__backup_${new Date().toISOString().replace(/[:.]/g, "-")}`
  );

  // Backup current src if exists
  safeMoveDirIfExists(placeholderSrcDir, backupDir);

  const outBase = path.join(frontendDir);

  let written = 0;
  let skipped = 0;

  for (let i = 0; i < map.sources.length; i++) {
    const srcPathRaw = map.sources[i];
    const content = map.sourcesContent[i];

    if (!content || typeof content !== "string") {
      skipped++;
      continue;
    }

    const rel = normalizeSourcePath(srcPathRaw);

    if (!rel) {
      skipped++;
      continue;
    }

    if (rel.includes("node_modules/")) {
      skipped++;
      continue;
    }

    // If source map paths are like "pages/Login.js" (no src/ prefix), place them under src/.
    const outRel = rel.startsWith("public/") ? rel : path.posix.join("src", rel);
    const outPath = path.join(outBase, outRel);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, content, "utf8");
    written++;
  }

  process.stdout.write(
    `Recovered frontend sources from ${mapFile}\n` +
      `- Written files: ${written}\n` +
      `- Skipped sources: ${skipped}\n` +
      (fs.existsSync(backupDir)
        ? `- Previous src backed up to: ${path.relative(frontendDir, backupDir)}\n`
        : "")
  );
}

main();
