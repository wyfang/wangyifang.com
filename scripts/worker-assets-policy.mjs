import path from "node:path";

// 只有这些站点输入可以公开，构建和测试代码不属于公开资源。
export const publicRootFiles = new Set([
  "404.html",
  "_headers",
  "_redirects",
  "analytics.js",
  "background.css",
  "index.css",
  "index.html",
  "og-image.png",
  "robots.txt",
  "sitemap.xml",
  "ASSET_SOURCES.md",
  "LICENSE",
  "LICENSE_SCOPE.md",
  "NOTICE",
  "THIRD_PARTY_NOTICES.md",
]);

export const publicDirectories = new Set([
  "1.0",
  "2.0",
  "This-is-my-website",
  "bootstrap",
  "comingsoon",
  "favicon",
  "fonts",
  "img",
  "jquery",
  "licenses",
  "share",
]);

export const publicScripts = new Set([
  "scripts/avatar-random.js",
  "scripts/avatar.js",
  "scripts/background.js",
  "scripts/bodymovin.js",
  "scripts/click-to-copy.js",
  "scripts/image-loading.js",
  "scripts/site-age.js",
  "scripts/theme.js",
  "scripts/visitor-stats.js",
]);

const staticExtensions = new Set([
  ".bcmap", ".css", ".eot", ".ftl", ".gif", ".htc", ".html", ".icc",
  ".ico", ".jpeg", ".jpg", ".js", ".json", ".map", ".mjs", ".pdf",
  ".pfb", ".plist", ".png", ".svg", ".ttf", ".txt", ".wasm", ".webm",
  ".webp", ".woff", ".woff2", ".xml",
]);
const privateDirectories = new Set([
  "node_modules", "dist", "build", "coverage", "test", "tests", "__tests__",
  "src", "source", "server", "cache", "backups", "backup",
]);
const privateFilename = /^(?:AGENTS\.md|README(?:\.[^.]+)?\.md|package(?:-lock)?\.json|(?:npm-shrinkwrap|composer)\.json|(?:yarn|pnpm-lock|bun)\.lock.*|wrangler(?:\..+)?|tsconfig(?:\..+)?\.json|jsconfig\.json)$|(?:\.(?:test|spec|config)\.)/i;

export const publicInputPaths = [
  ...publicRootFiles,
  ...publicDirectories,
  ...publicScripts,
  "scripts/pdfviewer",
];

export function isPublicAsset(relativePath) {
  const parts = relativePath.split("/");
  if (parts.some((part) => !part || part.startsWith(".")) || relativePath.includes("\\")) {
    return false;
  }
  if (publicRootFiles.has(relativePath) || publicScripts.has(relativePath)) {
    return true;
  }

  const pdfViewer = relativePath.startsWith("scripts/pdfviewer/");
  if (!pdfViewer && !publicDirectories.has(parts[0])) {
    return false;
  }
  if (parts.slice(0, -1).some((part, index) =>
    privateDirectories.has(part.toLowerCase()) &&
    !(pdfViewer && index === 2 && part === "build")
  )) {
    return false;
  }

  const filename = parts.at(-1);
  if (privateFilename.test(filename)) {
    return false;
  }
  // 第三方分发包必须保留许可证和归属通知。
  if (/^(?:LICENSE|NOTICE)(?:[._-].*)?$/i.test(filename)) {
    return true;
  }
  return staticExtensions.has(path.posix.extname(filename).toLowerCase());
}
