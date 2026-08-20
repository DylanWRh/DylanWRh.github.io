# Page Publishing

This repository uses a single GitHub Pages deployment workflow to publish the personal homepage together with standalone pages maintained in separate repositories.

The registry is:

```text
.github/pages.json
```

The deployment workflow is:

```text
.github/workflows/deploy-pages.yml
```

A page can be a paper project page, blog, demo, documentation site, or any other deploy-ready static website. The deployment mechanism does not depend on the page type.

## Page repository requirements

Each page is maintained in its own repository, typically private, and the selected branch/ref must contain a deploy-ready static website with `index.html` at the repository root.

For a private repository, `PAGE_REPO_TOKEN` in `DylanWRh.github.io` must have read access to it.

## Add a new page

Add an entry to `.github/pages.json`:

```json
{
  "path": "example",
  "type": "paper",
  "repo": "DylanWRh/example-page",
  "ref": "master",
  "publish": false
}
```

Fields:

- `path`: public URL path. Nested paths such as `blog/example` are allowed.
- `type`: descriptive metadata such as `paper`, `blog`, `demo`, or `docs`. It does not affect deployment.
- `repo`: source repository containing the page.
- `ref`: branch or ref to publish.
- `publish`: whether the page is included in the deployed site.

The resulting URL is:

```text
https://dylanwrh.github.io/<path>/
```

For example:

```json
{
  "path": "blog/agent-notes",
  "type": "blog",
  "repo": "DylanWRh/agent-notes-page",
  "ref": "main",
  "publish": false
}
```

publishes to:

```text
https://dylanwrh.github.io/blog/agent-notes/
```

## Develop without publishing

Keep:

```json
"publish": false
```

Develop and push the page repository normally. It will not be included in the public GitHub Pages artifact.

## Publish a page

1. Make sure the desired `ref` in the page repository contains the version to publish.
2. Set its registry entry to:

```json
"publish": true
```

3. Commit and push the change to `DylanWRh.github.io/main`.

The `Deploy GitHub Pages` workflow runs automatically and publishes the page at its configured `path`.

## Update an already published page

1. Push the updated static page to the configured `ref` of its source repository.
2. In `DylanWRh.github.io`, run **Actions → Deploy GitHub Pages → Run workflow**.

The deployment reads the latest version of every entry whose `publish` value is `true` and rebuilds the complete site artifact.

## Unpublish a page

Set:

```json
"publish": false
```

in `.github/pages.json`, then commit and push the change to `DylanWRh.github.io/main`.

The next deployment omits that path, so the corresponding public URL is removed while the source repository remains unchanged.

## Registry example

```json
{
  "pages": [
    {
      "path": "aDSL",
      "type": "paper",
      "repo": "DylanWRh/aDSL-page",
      "ref": "master",
      "publish": false
    },
    {
      "path": "blog/example",
      "type": "blog",
      "repo": "DylanWRh/example-blog-page",
      "ref": "main",
      "publish": true
    }
  ]
}
```

All enabled pages are assembled together with the personal homepage and deployed as one GitHub Pages site.