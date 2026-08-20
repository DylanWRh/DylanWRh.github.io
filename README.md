# 个人主页

这是一个无需构建和安装依赖的静态个人主页。主页中的可见内容主要使用 `content/` 目录中的 Markdown 维护；独立的 paper page、blog、demo、docs 等页面则通过统一的 GitHub Pages registry 进行发布。

## 仓库结构

```text
.
├── index.html
├── assets/                 # 主页样式与静态资源
├── content/                # 主页可见内容
├── template/               # content/ 的可复制模板与说明
├── scripts/                # 本地运行脚本
├── .github/
│   ├── pages.json          # 独立 page 发布 registry
│   ├── PAGES.md            # 独立 page 发布流程
│   └── workflows/
│       └── deploy-pages.yml
└── package.json
```

## 本地预览

由于浏览器需要读取 Markdown 文件，本地预览时应启动静态服务器，不要直接双击打开 `index.html`：

```powershell
npm run dev
```

## 主页内容维护

### 内容模板

`template/` 中提供各个 section 的详细说明和可复制模板：

- `template/profile.md`：个人信息与联系方式。
- `template/main.md`：section 展示顺序与显隐入口。
- `template/educations.md`：教育经历。
- `template/services.md`：学术与教学服务。
- `template/authors.md`：作者 key 与主页 URL 注册表。
- `template/publications.md`：论文列表和排序。
- `template/publication.md`：单篇论文及其资源。

### 调整 section

页面只加载 `content/main.md` 中列出的 section。列表顺序就是页面顺序；删除或注释某行即可隐藏对应 section，而不需要删除内容文件：

```markdown
# Sections

- [Profile](./profile.md)
- [Educations](./educations.md)
- [Services](./services.md)
- [Publications](./publications.md)
```

除 Profile 的姓名标题外，Educations、Services、Publications 及其他内容 section 都使用一级 Markdown 标题，并以相同的页面标题样式显示。

## 论文内容

### 维护论文列表

每篇论文使用一个独立目录，Markdown 和预览资源放在一起：

```text
content/publications/
└── paper-short-name/
    ├── index.md
    ├── teaser.png
    └── demo.mp4
```

图片和 MP4 视频均可作为卡片预览，路径只需写 `./teaser.png` 或 `./demo.mp4`。

在 `content/publications.md` 中加入论文 `index.md` 的链接即可显示卡片；列表顺序就是页面顺序。

### 维护作者主页

`content/authors.md` 集中保存唯一 key 与作者主页。论文中引用 key，主页变更时无需逐篇修改：

```markdown
# content/authors.md
- [sitongwei](https://wst2001.github.io/)

# content/publications/example/index.md
**Authors:** [Si-Tong Wei](@sitongwei), [Chuan-Zhi Zhou](@chuanzhizhou)
```

如果 `chuanzhizhou` 尚未登记，页面只显示 `Chuan-Zhi Zhou`，不会生成链接。

## 独立 Pages 发布

Paper project page、blog、demo、documentation site 以及其他独立静态页面统一由：

```text
.github/pages.json
```

登记，并由：

```text
.github/workflows/deploy-pages.yml
```

组装成同一个 GitHub Pages site。

每个独立 page 可以维护在单独的 repository 中，并通过 `publish: true/false` 控制是否上线。完整的新增、开发、发布、更新和下线流程见：

```text
.github/PAGES.md
```

最终所有已启用页面都会与个人主页一起发布到 `https://dylanwrh.github.io/` 下对应的路径。