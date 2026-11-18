# 第三方通知

本仓库直接分发的第三方代码与字体保留原作者的版权和许可证。根目录的 Apache-2.0 不替代下列条款。

## AGPL-3.0-only

`scripts/avatar.js` 是 [Wi-Fi Avatar Lab](https://github.com/wyfang/wifi-avatar-lab) 导出的程序化头像运行引擎；`scripts/avatar-random.js` 是与其共同运行的网站集成代码。两者均按 [GNU Affero General Public License v3.0 only](./licenses/AGPL-3.0-only.txt) 提供。

Wi-Fi Avatar Lab 基于 Stéphane Montlouis-Calixte 的 [Bible Strong Avatar Lab](https://github.com/smontlouis/bible-strong-avatar-lab)，修改版版权归 Wi-Fi Avatar Lab 贡献者所有。生成器的对应源码见 [wifi-avatar-lab@907d8d8](https://github.com/wyfang/wifi-avatar-lab/tree/907d8d843b2cb7456a91a5303e932336f2dc35e9)；网站集成与当前导出文件的源码见本仓库。

## MIT

下列组件按 [MIT License](./licenses/MIT.txt) 分发：

| 路径 | 组件与来源 |
| --- | --- |
| `jquery/` | jQuery 3.7.1；OpenJS Foundation 及贡献者 |
| `bootstrap/` | Bootstrap 3.3.7；Twitter, Inc.；内含 Normalize.css 3.0.3 与 Bootstrap 分发的 Glyphicons Halflings |
| `bootstrap/5.0.2/` | Bootstrap 5.0.2；Twitter, Inc. 与 Bootstrap Authors；bundle 内含 Popper 2.9.2，版权归 Federico Zivolo |
| `scripts/bodymovin.js` | Bodymovin/Lottie 4.6.3；Copyright 2015 Bodymovin |

Glyphicons Halflings 由 Jan Kovařík 创作，并经 Bootstrap 3 分发。Normalize.css 的版权归 Nicolas Gallagher 与 Jonathan Neal。

## OFL-1.1

下列字体按 [SIL Open Font License 1.1](./licenses/OFL-1.1.txt) 分发：

| 路径 | 字体与通知 |
| --- | --- |
| `fonts/GoogleSansFlex.ttf` | Google Sans Flex；Copyright 2015 Google LLC；Google Sans 是 Google 的商标 |
| `fonts/Mona-Sans.woff2` | Mona Sans；Copyright 2023 GitHub；保留字体名称 “Mona Sans” |

## PDF.js

`scripts/pdfviewer/` 是 [PDF.js 5.4.394](https://github.com/mozilla/pdf.js)，Copyright 2024 Mozilla Foundation，主体代码依据 [Apache License 2.0](./LICENSE) 分发。

该分发包同时包含 Adobe CMaps、ICC profiles、PDFium/Foxit 标准字体、Liberation Sans、OpenJPEG 与 qcms 等资源。它们保留各自的版权和许可证，完整通知位于 `scripts/pdfviewer/web/cmaps/`、`iccs/`、`standard_fonts/` 与 `wasm/` 的 `LICENSE*` 文件中。

## CSS3 PIE

`2.0/index.hyperesources/PIE.htc` 是 CSS3 PIE 1.0.0，Copyright 2010 Jason Johnston。本仓库选择其双许可证中的 [Apache License 2.0](./LICENSE)；上游源码位于 [lojjic/PIE](https://github.com/lojjic/PIE)。

## Tumult Hype

`2.0/index.hyperesources/HYPE-596.*.js` 与 `index_hype_generated_script.js` 是 Tumult Hype 导出的历史运行时和项目文件。它们不是本仓库所有者依据 Apache-2.0 再许可的原创代码；使用与再分发仍受生成这些文件时适用的 Tumult Hype 条款约束。

图片、动画数据、品牌图标与其他视觉内容的权利边界见 [ASSET_SOURCES.md](./ASSET_SOURCES.md)。未在此列出的第三方权利不会因遗漏而失效。
