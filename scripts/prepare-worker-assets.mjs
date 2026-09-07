import { execFile } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { isPublicAsset, publicInputPaths } from "./worker-assets-policy.mjs";

const execFileAsync = promisify(execFile);
const defaultRepositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const analyticsScript = '<script src="/analytics.js"></script>';
const analyticsScriptPattern =
  /[ \t]*<script\b[^>]*\bsrc=(["'])\/analytics\.js(?:\?[^"']*)?\1[^>]*>\s*<\/script>[ \t]*(?:\r?\n)?/gi;

export async function prepareWorkerAssets({
  repositoryRoot = defaultRepositoryRoot,
  outputDirectory = path.join(repositoryRoot, ".worker-assets"),
} = {}) {
  // 本地预览包含尚未暂存且未被忽略的站点资源，搜索范围限于公开输入清单。
  const { stdout } = await execFileAsync("git", [
    "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--",
    ...publicInputPaths,
  ], {
    cwd: repositoryRoot,
    encoding: "buffer",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 25_000,
  });
  const publicFiles = [...new Set(
    stdout.toString("utf8").split("\0").filter(isPublicAsset),
  )].sort();
  const temporaryOutput = await mkdtemp(`${outputDirectory}.stage-`);
  let copiedFileCount = 0;
  let injectedHtmlCount = 0;

  try {
    for (const relativePath of publicFiles) {
      const sourcePath = path.join(repositoryRoot, relativePath);
      const destinationPath = path.join(temporaryOutput, relativePath);
      if (!(await lstat(sourcePath)).isFile()) {
        throw new Error(`Public asset must be a regular file: ${relativePath}`);
      }

      await mkdir(path.dirname(destinationPath), { recursive: true });
      await cp(sourcePath, destinationPath, {
        dereference: false,
        preserveTimestamps: true,
      });
      copiedFileCount += 1;

      if (relativePath.toLowerCase().endsWith(".html")) {
        let html = await readFile(destinationPath, "utf8");
        const newline = html.includes("\r\n") ? "\r\n" : "\n";
        const closingHeadPattern = /([ \t]*)<\/head\s*>/i;

        html = html.replace(analyticsScriptPattern, "");

        if (!closingHeadPattern.test(html)) {
          throw new Error(`Cannot inject analytics into ${relativePath}: missing </head>`);
        }

        html = html.replace(
          closingHeadPattern,
          (_closingHead, indentation) =>
            `${indentation}${analyticsScript}${newline}${indentation}</head>`,
        );
        await writeFile(destinationPath, html, "utf8");
        injectedHtmlCount += 1;
      }
    }
    // 输入或 HTML 校验失败时，保留上次成功生成的预览产物。
    await rm(outputDirectory, { force: true, recursive: true });
    await rename(temporaryOutput, outputDirectory);
  } finally {
    await rm(temporaryOutput, { force: true, recursive: true });
  }

  return { copiedFileCount, injectedHtmlCount, outputDirectory };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { copiedFileCount, injectedHtmlCount, outputDirectory } = await prepareWorkerAssets();
  console.log(
    `Prepared ${copiedFileCount} Worker assets and injected analytics into ${injectedHtmlCount} HTML files in ${outputDirectory}`,
  );
}
