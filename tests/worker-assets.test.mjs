import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { prepareWorkerAssets } from "../scripts/prepare-worker-assets.mjs";
import { isPublicAsset } from "../scripts/worker-assets-policy.mjs";

async function fixture(t) {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "wangyifang-assets-test-"));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  execFileSync("git", ["init", "--quiet", repositoryRoot], { timeout: 5_000 });
  const write = async (relativePath, content = "fixture") => {
    const filename = path.join(repositoryRoot, relativePath);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, content);
  };
  await write("index.html", '<!doctype html><html><head></head><body></body></html>');
  await write("analytics.js", "// fixture analytics");
  await write("_headers", "/*\n  Access-Control-Allow-Origin: *\n");
  return { repositoryRoot, outputDirectory: path.join(repositoryRoot, ".worker-assets"), write };
}

test("public asset policy excludes operations and keeps website and license files", () => {
  for (const filename of [
    "index.html", "ASSET_SOURCES.md", "LICENSE_SCOPE.md", "NOTICE",
    "scripts/avatar.js", "fonts/GoogleSansFlex.woff2",
    "scripts/pdfviewer/build/pdf.worker.mjs", "scripts/pdfviewer/web/wasm/openjpeg.wasm",
    "scripts/pdfviewer/web/cmaps/LICENSE", "scripts/pdfviewer/web/standard_fonts/LICENSE_FOXIT",
    "licenses/AGPL-3.0-only.txt", "steamgame/Wi-Fi/pets/猫/pet.json",
  ]) {
    assert.equal(isPublicAsset(filename), true, filename);
  }
  for (const filename of [
    "scripts/build-release-package.sh", "scripts/prepare-worker-assets.mjs",
    "scripts/worker-assets-policy.mjs", "scripts/future-maintenance.js",
    "tests/worker-assets.test.mjs", "AGENTS.md", "README.md", "package.json",
    "package-lock.json", "wrangler.jsonc", ".env", ".github/workflows/build.yml",
    "img/.env.production", "img/package.json", "img/wrangler.preview.jsonc",
    "img/preview.test.js", "steamgame/Wi-Fi/vite.config.js", "img/node_modules/library.js",
    "img/tests/fixture.json", "img/dist/output.js", "img/src/private.js",
    "scripts/pdfviewer/web/build/internal.js", "fonts/../package.json",
    "/index.html", "fonts\\private.woff2",
  ]) {
    assert.equal(isPublicAsset(filename), false, filename);
  }
});

test("build includes unstaged assets and PDF resources without publishing build inputs", async (t) => {
  const f = await fixture(t);
  const publicFiles = [
    "fonts/new-font.woff2", "scripts/avatar.js", "LICENSE", "LICENSE_SCOPE.md",
    "scripts/pdfviewer/build/pdf.worker.mjs", "scripts/pdfviewer/web/cmaps/LICENSE",
    "scripts/pdfviewer/web/wasm/openjpeg.wasm",
  ];
  const privateFiles = [
    "scripts/build-release-package.sh", "scripts/worker-assets-policy.mjs",
    "scripts/future-maintenance.js", "tests/worker-assets.test.mjs", "package.json",
    "img/.env", "img/test/fixture.json", "img/wrangler.test.jsonc",
  ];
  for (const filename of [...publicFiles, ...privateFiles]) await f.write(filename);
  await f.write(".gitignore", "fonts/ignored.woff2\n");
  await f.write("fonts/ignored.woff2");
  const result = await prepareWorkerAssets(f);
  assert.equal(result.injectedHtmlCount, 1);
  for (const filename of publicFiles) await access(path.join(f.outputDirectory, filename));
  for (const filename of [...privateFiles, "fonts/ignored.woff2"]) {
    await assert.rejects(access(path.join(f.outputDirectory, filename)), { code: "ENOENT" });
  }
  assert.equal(execFileSync("git", ["ls-files"], { cwd: f.repositoryRoot, encoding: "utf8" }), "");
});

test("analytics injection removes duplicate tags and is stable between builds", async (t) => {
  const f = await fixture(t);
  await f.write("index.html", [
    "<!doctype html><html><head>",
    '<script src="/analytics.js?old=1"></script>',
    "<script src='/analytics.js'></script>",
    "</head><body></body></html>",
  ].join("\r\n"));
  await prepareWorkerAssets(f);
  const first = await readFile(path.join(f.outputDirectory, "index.html"), "utf8");
  assert.equal(first.match(/src="\/analytics\.js"/g)?.length, 1);
  assert.equal(first.includes("analytics.js?old"), false);
  assert.match(first, /<script src="\/analytics\.js"><\/script>\r\n<\/head>/);
  await prepareWorkerAssets(f);
  assert.equal(await readFile(path.join(f.outputDirectory, "index.html"), "utf8"), first);
});

test("hatch-pet downloads include the full skill without publishing unrelated scripts", async (t) => {
  const f = await fixture(t);
  const included = [
    "steamgame/Wi-Fi/skills/hatch-pet.zip",
    "steamgame/Wi-Fi/skills/hatch-pet/SKILL.md",
    "steamgame/Wi-Fi/skills/hatch-pet/LICENSE.txt",
    "steamgame/Wi-Fi/skills/hatch-pet/agents/openai.yaml",
    "steamgame/Wi-Fi/skills/hatch-pet/references/animation-rows.md",
    "steamgame/Wi-Fi/skills/hatch-pet/scripts/compose_atlas.py",
  ];
  const excluded = [
    "steamgame/Wi-Fi/skills/other.zip",
    "steamgame/Wi-Fi/skills/hatch-pet/scripts/private.py",
    "steamgame/Wi-Fi/skills/hatch-pet/.env",
    "steamgame/Wi-Fi/scripts/compose_atlas.py",
  ];
  for (const filename of [...included, ...excluded]) await f.write(filename);
  await prepareWorkerAssets(f);
  for (const filename of included) await access(path.join(f.outputDirectory, filename));
  for (const filename of excluded) {
    await assert.rejects(access(path.join(f.outputDirectory, filename)), { code: "ENOENT" });
  }
});

test("invalid HTML leaves the last successful output intact", async (t) => {
  const f = await fixture(t);
  await prepareWorkerAssets(f);
  const previous = await readFile(path.join(f.outputDirectory, "index.html"), "utf8");
  await f.write("index.html", "<html><body>Missing head</body></html>");
  await assert.rejects(prepareWorkerAssets(f), /missing <\/head>/);
  assert.equal(await readFile(path.join(f.outputDirectory, "index.html"), "utf8"), previous);
  assert.equal((await readdir(f.repositoryRoot)).some((name) => name.startsWith(".worker-assets.stage-")), false);
});

test("symlink assets cannot expose files outside the public inputs", async (t) => {
  const f = await fixture(t);
  await f.write("private.txt");
  await mkdir(path.join(f.repositoryRoot, "fonts"));
  await symlink("../private.txt", path.join(f.repositoryRoot, "fonts/external.woff2"));
  await assert.rejects(prepareWorkerAssets(f), /Public asset must be a regular file/);
  await assert.rejects(access(f.outputDirectory), { code: "ENOENT" });
});
