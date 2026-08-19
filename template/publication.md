<!--
单篇论文模板。新建 content/publications/<论文简称>/ 目录后，将本文件复制为 index.md。

维护规则：
1. 一级标题是论文标题。
2. 引用行（以 > 开头）是卡片标签中的 venue 和年份。
3. 作者必须放在“**Authors:**”之后；主页使用 [Author Name](@author_key) 引用 content/authors.md 中的 card。
4. card key 不存在时只显示姓名，不生成链接；需要同时添加链接和粗体时使用 [**Your Name**](@your_key)。
5. 预览图片或 MP4 视频与 index.md 放在同一目录，路径只需写 ./teaser.png 或 ./demo.mp4。
6. 图片和视频使用相同的 Markdown 图片语法，均在 1:1 正方形区域内完整显示。
7. MP4 会自动静音、循环播放。
8. 没有预览媒体时，可以直接删除媒体行。
9. 最后一行可添加任意数量的论文资源链接，常用标签包括 Paper、Arxiv、Project 和 Code。
10. Authors 段落里的 card 引用只显示在姓名上，不会进入卡片底部的资源链接区域。
-->

# Full Paper Title

> Venue 20XX

**Authors:** [First Author](@first_author), [**Your Name**](@your_key), Other Author

![Paper teaser](./teaser.png)

[Paper](https://example.com/paper) [Project](https://example.com/project) [Code](https://github.com/example/repository)
