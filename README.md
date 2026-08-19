# 个人主页

这是一个无需构建和安装依赖的静态网站。页面上的可见内容均使用
`content/` 目录中的 Markdown 维护。

## 内容模板

`template/` 中提供了各个 section 的详细说明和可复制模板：

- `template/profile.md`：个人信息与联系方式。
- `template/publications.md`：论文列表和排序。
- `template/publication.md`：单篇论文及其资源。

## 修改论文列表

每篇论文使用一个独立目录，Markdown 和预览图放在一起：

```text
content/publications/
└── paper-short-name/
    ├── index.md
    ├── teaser.png
    └── demo.mp4
```

图片和 MP4 视频均可作为卡片预览，路径只需写 `./teaser.png` 或 `./demo.mp4`。
在 `content/publications.md`
中加入论文 `index.md` 的链接即可显示卡片；列表顺序就是页面顺序。

由于浏览器需要读取 Markdown 文件，本地预览时应启动静态服务器，不要直接双击打开
`index.html`：

```powershell
npm run dev
```
