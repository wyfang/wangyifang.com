# wangyifang.com

王一方的个人主页，汇集个人介绍、社交平台与长期维护的站点入口。

[访问网站](https://wangyifang.com) · [更新记录](https://blog.wangyifang.com/mywebupdate/) · [English](./README.en.md)

![网站预览](./share/img/201904281548.png)

## 功能

- 响应式布局与自动深色模式。
- 程序化动态头像与静态降级。
- 社交平台入口、好友码与二维码展示。
- 无框架静态页面，以及历史页面和 Wi-Fi 应用介绍。

## 使用

在仓库根目录使用 Python 3 启动本地 HTTP 服务：

```bash
python3 -m http.server 8000
```

打开 `http://127.0.0.1:8000/`。动态头像使用浏览器 ES modules，需要通过 HTTP 访问。

构建 Cloudflare 静态资源并使用 Wrangler 本地预览：

```bash
npm ci
npm run build
npm run dev
```

锁定的 Wrangler 依赖要求 Node.js 22 或更高版本。构建产物位于 `.worker-assets/`，由白名单选择公开文件；源码、配置、环境文件和开发资料不应作为公开资源分发。代码检查命令为 `npm test`。

## 说明

生产发布通过对应 GitHub 仓库的 `main` 分支与 Cloudflare Workers Builds 完成，发布后需要核对构建提交与线上版本。

构建脚本会向 HTML 注入 `analytics.js`，其中包含百度统计、Google Analytics、51.LA、PostHog 和 Microsoft Clarity 等第三方统计服务。访问发布页面可能向这些服务发送访问与设备数据；复用站点时应按自己的数据处理要求核对这些配置。

个人照片、头像、二维码、文案与品牌素材不属于代码授权范围。第三方程序和字体来源见 [第三方说明](./THIRD_PARTY_NOTICES.md)，视觉素材来源见 [素材说明](./ASSET_SOURCES.md)。

## 版权说明

原创代码依据 [Apache License 2.0](./LICENSE) 发布，动态头像程序 `scripts/avatar.js` 与 `scripts/avatar-random.js` 依据 [AGPL-3.0-only](./licenses/AGPL-3.0-only.txt) 发布。头像程序来自 [Wi-Fi Avatar Lab](https://github.com/wyfang/wifi-avatar-lab)，其上游为 Stéphane Montlouis-Calixte 的 [Bible Strong Avatar Lab](https://github.com/smontlouis/bible-strong-avatar-lab)。个人品牌和素材不在许可范围内；完整边界与对应源码说明见 [许可范围](./LICENSE_SCOPE.md) 和 [第三方说明](./THIRD_PARTY_NOTICES.md)。
