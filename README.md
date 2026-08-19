# 个人主页

这是一个无需构建和安装依赖的静态网站。页面上的可见内容均使用
`content/` 目录中的 Markdown 维护。

## 内容模板

`template/` 中提供了各个 section 的详细说明和可复制模板：

- `template/profile.md`：个人信息与联系方式。
- `template/main.md`：section 展示顺序与显隐入口。
- `template/authors.md`：作者 key 与主页 URL 注册表。
- `template/educations.md`：教育经历。
- `template/services.md`：学术与教学服务。
- `template/publications.md`：论文列表和排序。
- `template/publication.md`：单篇论文及其资源。

## 调整 section

页面只加载 `content/main.md` 中列出的 section。列表顺序就是页面顺序；删除或注释某行即可
隐藏对应 section，而不需要删除内容文件：

```markdown
# Sections

- [Profile](./profile.md)
- [Educations](./educations.md)
- [Services](./services.md)
- [Publications](./publications.md)
```

除 Profile 的姓名标题外，Educations、Services、Publications 及其他内容 section 都使用一级
Markdown 标题，并以相同的页面标题样式显示。

## 维护作者主页

`content/authors.md` 集中保存唯一 key 与作者主页。论文中引用 key，主页变更时无需逐篇修改：

```markdown
# content/authors.md
- [sitongwei](https://wst2001.github.io/)

# content/publications/example/index.md
**Authors:** [Si-Tong Wei](@sitongwei), [Chuan-Zhi Zhou](@chuanzhizhou)
```

如果 `chuanzhizhou` 尚未登记，页面只显示 `Chuan-Zhi Zhou`，不会生成链接。

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
