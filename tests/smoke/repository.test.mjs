import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

test("package.json exposes maintainer CI scripts", () => {
  assert.equal(typeof packageJson.scripts?.lint, "string");
  assert.equal(typeof packageJson.scripts?.build, "string");
  assert.equal(typeof packageJson.scripts?.test, "string");
});

test("repository includes core contributor entry points", () => {
  const requiredPaths = [
    ".github/workflows/ci.yml",
    "README.md",
    "app",
    "components",
    "modules",
  ];

  for (const requiredPath of requiredPaths) {
    assert.equal(
      fs.existsSync(path.join(repoRoot, requiredPath)),
      true,
      `${requiredPath} should exist`,
    );
  }
});
