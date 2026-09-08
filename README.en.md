# wangyifang.com

Wang Yifang's personal website, bringing together a personal introduction, social profiles, and links to maintained sites.

[Visit website](https://wangyifang.com) · [Update history](https://blog.wangyifang.com/mywebupdate/) · [简体中文](./README.md)

![Website preview](./share/img/201904281548.png)

## Features

- Responsive layout and automatic dark mode.
- A procedural animated avatar with a static fallback.
- Social links, friend codes, and QR codes.
- Framework-free static pages, historical pages, and Wi-Fi application information.

## Usage

Start a local HTTP server with Python 3 from the repository root:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`. The animated avatar uses browser ES modules and requires HTTP access.

Build Cloudflare static assets and preview locally with Wrangler:

```bash
npm ci
npm run build
npm run dev
```

The pinned Wrangler dependency requires Node.js 22 or later. Build output goes to `.worker-assets/`, using an allowlist of public files. Source, configuration, environment files, and development materials should not be distributed as public assets. Run `npm test` for code checks.

## Notes

Production releases use the corresponding GitHub repository's `main` branch and Cloudflare Workers Builds. Verify the build commit and live version after release.

The build script injects `analytics.js` into HTML. It includes third-party analytics services such as Baidu Analytics, Google Analytics, 51.LA, PostHog, and Microsoft Clarity. Visiting published pages may send visit and device data to those services. Review these settings against your own data handling requirements when reusing the site.

Personal photos, avatars, QR codes, copy, and branding are outside the code license. See [third-party notices](./THIRD_PARTY_NOTICES.md) for libraries and fonts, and [asset sources](./ASSET_SOURCES.md) for visual materials.

## License

Original code is licensed under the [Apache License 2.0](./LICENSE). The animated avatar program, `scripts/avatar.js` and `scripts/avatar-random.js`, is licensed under [AGPL-3.0-only](./licenses/AGPL-3.0-only.txt). It comes from [Wi-Fi Avatar Lab](https://github.com/wyfang/wifi-avatar-lab), derived from Stéphane Montlouis-Calixte's [Bible Strong Avatar Lab](https://github.com/smontlouis/bible-strong-avatar-lab). Personal branding and assets are excluded. See [license scope](./LICENSE_SCOPE.md) and [third-party notices](./THIRD_PARTY_NOTICES.md) for full boundaries and corresponding source details.
