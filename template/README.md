# 内容维护模板

这个目录包含个人主页各个 section 的可复制模板：

- `profile.md`：姓名、头像、个人简介和联系方式。
- `publications.md`：论文卡片的显示清单与排序。
- `publication.md`：单篇论文的标题、venue、作者、预览图和相关链接。

模板中的 `<!-- ... -->` 是维护说明，复制到 `content/` 后可以保留，页面不会显示这些注释。

## 推荐工作流

1. 修改个人信息时，参考 `profile.md` 编辑 `content/profile.md`。
2. 新增论文时，在 `content/publications/` 下新建以论文简称命名的目录。
3. 将 `publication.md` 复制为新目录中的 `index.md`，同时把预览图等资源放进该目录。
4. 在 `content/publications.md` 中添加新论文的 `index.md` 链接，并调整列表顺序。
5. 运行 `npm run dev`，打开 `http://127.0.0.1:8000/` 预览。
