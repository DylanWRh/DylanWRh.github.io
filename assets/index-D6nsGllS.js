const MAIN_CONTENT_PATH = "./content/main.md"

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]
  })
}

function normalizeMarkdown(markdown) {
  return markdown.replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, "").trim()
}

function resolveUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).href
  } catch {
    return value
  }
}

function renderTextFormatting(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
}

function renderInlineMarkdown(value, baseUrl) {
  const linkPattern = /\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g
  let html = ""
  let cursor = 0
  let match

  while ((match = linkPattern.exec(value)) !== null) {
    html += renderTextFormatting(value.slice(cursor, match.index))
    html +=
      '<a class="highlight" target="_blank" rel="noopener noreferrer" href="' +
      escapeHtml(baseUrl ? resolveUrl(match[2], baseUrl) : match[2]) +
      '">' +
      renderTextFormatting(match[1]) +
      "</a>"
    cursor = match.index + match[0].length
  }

  return html + renderTextFormatting(value.slice(cursor))
}

function extractMarkdownLinks(markdown) {
  const links = []
  const linkPattern = /(?<!!)\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g
  let match

  while ((match = linkPattern.exec(markdown)) !== null) {
    links.push({ label: match[1], href: match[2] })
  }

  return links
}

function extractImage(markdown) {
  const match = markdown.match(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/)
  return match ? { alt: match[1], src: match[2], markdown: match[0] } : null
}

function extractHeading(markdown, level) {
  const pattern = new RegExp("^" + "#".repeat(level) + "\\s+(.+)$", "m")
  const match = markdown.match(pattern)
  return match ? match[1].trim() : ""
}

function iconClassFor(label) {
  const normalized = label.toLowerCase()
  if (normalized.includes("github")) return "i-mdi:github"
  if (normalized.includes("scholar")) return "i-mdi:account-school"
  return "i-solar:letter-bold"
}

function parseProfile(markdown, sourceUrl) {
  const normalized = normalizeMarkdown(markdown)
  const linksHeading = normalized.search(/^##\s+Links\s*$/im)
  const introSource = linksHeading === -1 ? normalized : normalized.slice(0, linksHeading)
  const linksSource = linksHeading === -1 ? "" : normalized.slice(linksHeading)
  const image = extractImage(introSource)
  const name = extractHeading(introSource, 1)

  const paragraphs = introSource
    .replace(/^#\s+.+$/m, "")
    .replace(image ? image.markdown : "", "")
    .split(/\n\s*\n/)
    .map(function (paragraph) {
      return paragraph.replace(/\s*\n\s*/g, " ").trim()
    })
    .filter(Boolean)

  return {
    title: name + " Homepage",
    name,
    profileImage: image ? resolveUrl(image.src, sourceUrl) : "",
    introHtml: paragraphs.map(function (paragraph) {
      return renderInlineMarkdown(paragraph, sourceUrl)
    }),
    links: extractMarkdownLinks(linksSource).map(function (link) {
      return {
        label: link.label,
        href: resolveUrl(link.href, sourceUrl),
        iconClass: iconClassFor(link.label),
      }
    }),
  }
}

function parsePublicationIndex(markdown, sourceUrl) {
  const normalized = normalizeMarkdown(markdown)
  return {
    title: extractHeading(normalized, 1),
    sources: extractMarkdownLinks(normalized).map(function (link) {
      return resolveUrl(link.href, sourceUrl)
    }),
  }
}

function parsePublication(markdown, sourceUrl) {
  const normalized = normalizeMarkdown(markdown)
  const media = extractImage(normalized)
  const venueMatch = normalized.match(/^>\s*(.+)$/m)
  const authorsMatch = normalized.match(/\*\*Authors:\*\*\s*([^\n]+(?:\n(?!\s*\n|#|>|!|\[)[^\n]+)*)/i)
  const authors = authorsMatch ? authorsMatch[1].replace(/\s*\n\s*/g, " ").trim() : ""
  const mediaUrl = media ? resolveUrl(media.src, sourceUrl) : ""

  return {
    conf: venueMatch ? venueMatch[1].trim() : "",
    teaser: mediaUrl,
    teaserAlt: media ? media.alt : "",
    teaserType: /\.mp4(?:$|[?#])/i.test(mediaUrl) ? "video" : "image",
    title: extractHeading(normalized, 1),
    authors,
    links: extractMarkdownLinks(normalized).map(function (link) {
      return { label: link.label, url: resolveUrl(link.href, sourceUrl) }
    }),
  }
}

function parseMain(markdown, sourceUrl) {
  return extractMarkdownLinks(normalizeMarkdown(markdown)).map(function (link) {
    return {
      label: link.label,
      source: resolveUrl(link.href, sourceUrl),
    }
  })
}

function contentTypeFor(sourceUrl) {
  try {
    const pathname = new URL(sourceUrl).pathname.toLowerCase()
    const filename = pathname.slice(pathname.lastIndexOf("/") + 1)
    if (filename === "profile.md") return "profile"
    if (filename === "publications.md") return "publications"
  } catch {
    // Unknown files fall back to the generic Markdown section renderer.
  }
  return "markdown"
}

function parseMarkdownList(lines) {
  const root = []
  const stack = [{ indent: -1, children: root }]

  lines.forEach(function (line) {
    const match = line.match(/^(\s*)-\s+(.+)$/)
    if (!match) return
    const indent = match[1].replace(/\t/g, "  ").length

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const item = { text: match[2].trim(), children: [] }
    stack[stack.length - 1].children.push(item)
    stack.push({ indent, children: item.children })
  })

  return root
}

function renderMarkdownList(items, sourceUrl) {
  if (!items.length) return ""
  return (
    "<ul>" +
    items
      .map(function (item) {
        return (
          "<li>" +
          renderInlineMarkdown(item.text, sourceUrl) +
          renderMarkdownList(item.children, sourceUrl) +
          "</li>"
        )
      })
      .join("") +
    "</ul>"
  )
}

function renderMarkdownBody(markdown, sourceUrl) {
  const lines = markdown.split("\n")
  const html = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^\s*-\s+/.test(line)) {
      const listLines = []
      while (index < lines.length && /^\s*-\s+/.test(lines[index])) {
        listLines.push(lines[index])
        index += 1
      }
      html.push(renderMarkdownList(parseMarkdownList(listLines), sourceUrl))
      continue
    }

    const headingMatch = line.match(/^#{2,6}\s+(.+)$/)
    if (headingMatch) {
      html.push(
        '<h3 class="markdown-subheading">' +
          renderInlineMarkdown(headingMatch[1].trim(), sourceUrl) +
          "</h3>",
      )
      index += 1
      continue
    }

    const paragraphLines = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*-\s+/.test(lines[index]) &&
      !/^#{2,6}\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }
    html.push("<p>" + renderInlineMarkdown(paragraphLines.join(" "), sourceUrl) + "</p>")
  }

  return html.join("")
}

function parseMarkdownSection(markdown, sourceUrl, fallbackTitle) {
  const normalized = normalizeMarkdown(markdown)
  const title = extractHeading(normalized, 1) || fallbackTitle
  const body = normalized.replace(/^#\s+.+$/m, "").trim()
  return {
    title,
    bodyHtml: renderMarkdownBody(body, sourceUrl),
  }
}

async function loadMarkdown(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error("Unable to load " + path + " (HTTP " + response.status + ")")
  }
  return { markdown: await response.text(), sourceUrl: response.url }
}

async function loadSection(entry) {
  const file = await loadMarkdown(entry.source)
  const type = contentTypeFor(file.sourceUrl)

  if (type === "profile") {
    return { type, ...parseProfile(file.markdown, file.sourceUrl) }
  }

  if (type === "publications") {
    const publicationIndex = parsePublicationIndex(file.markdown, file.sourceUrl)
    const publicationFiles = await Promise.all(
      publicationIndex.sources.map(function (source) {
        return loadMarkdown(source)
      }),
    )
    return {
      type,
      title: publicationIndex.title,
      publications: publicationFiles.map(function (publicationFile) {
        return parsePublication(publicationFile.markdown, publicationFile.sourceUrl)
      }),
    }
  }

  return {
    type,
    ...parseMarkdownSection(file.markdown, file.sourceUrl, entry.label),
  }
}

async function loadSiteData() {
  const mainFile = await loadMarkdown(MAIN_CONTENT_PATH)
  const entries = parseMain(mainFile.markdown, mainFile.sourceUrl)
  const sections = await Promise.all(entries.map(loadSection))
  const profile = sections.find(function (section) {
    return section.type === "profile"
  })

  return {
    title: profile ? profile.title : "",
    sections,
  }
}

function renderProfileLinks(links) {
  return links
    .map(function (link, index) {
      const extraClass = index === 0 ? "" : " ml-5"
      return (
        '<a class="highlight flex items-center' +
        extraClass +
        '" target="_blank" rel="noopener noreferrer" href="' +
        escapeHtml(link.href) +
        '">' +
        '<div class="' +
        escapeHtml(link.iconClass) +
        '"></div>' +
        '<span class="ml-1 text-xl">' +
        escapeHtml(link.label) +
        "</span>" +
        "</a>"
      )
    })
    .join("")
}

function renderPublicationLinks(links) {
  return links
    .map(function (link) {
      return (
        '<a class="highlight font-semibold underline underline-offset-4" href="' +
        escapeHtml(link.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(link.label) +
        "</a>"
      )
    })
    .join("")
}

function renderPublicationCard(publication) {
  let teaser = ""
  if (publication.teaserType === "video") {
    teaser =
      '<video src="' +
      escapeHtml(publication.teaser) +
      '" aria-label="' +
      escapeHtml(publication.teaserAlt || publication.title + " demo") +
      '" class="object-contain w-full h-full" autoplay loop muted playsinline preload="metadata"></video>'
  } else if (publication.teaser) {
    teaser =
      '<img src="' +
      escapeHtml(publication.teaser) +
      '" alt="' +
      escapeHtml(publication.teaserAlt || publication.title + " teaser") +
      '" class="object-contain">'
  }

  return (
    '<div class="relative">' +
    '<div class="publication-card flex items-center bg-white dark:bg-gray-800 rounded-md overflow-hidden transition-shadow duration-300 shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 relative phone-flex-col">' +
    '<div class="publication-media pc-w-50 phone-w-full flex shadow-md border-r border-gray-200 dark:border-gray-700 pc-absolute bg-white">' +
    teaser +
    "</div>" +
    '<div class="pc-ml-50 flex-1 px-6 py-4 min-h-40 flex flex-col justify-between">' +
    "<div>" +
    '<div class="text-xl font-bold mb-2">' +
    escapeHtml(publication.title) +
    "</div>" +
    '<div class="text-base text-gray-700 dark:text-gray-300 mb-2">' +
    renderTextFormatting(publication.authors) +
    "</div>" +
    "</div>" +
    '<div class="flex gap-3">' +
    renderPublicationLinks(publication.links) +
    "</div>" +
    "</div>" +
    "</div>" +
    '<span class="conf-label absolute top-5 z-20 px-3 text-base font-bold rounded-sm duration-300">' +
    escapeHtml(publication.conf) +
    "</span>" +
    '<span class="conf-dual-label absolute bottom-1 z-20 px-3 text-base font-bold rounded-sm duration-300">' +
    escapeHtml(publication.conf) +
    "</span>" +
    "</div>"
  )
}

function renderProfileSection(profile, isFirst) {
  const titleMargin = isFirst ? "mt-5" : "mt-10"
  const profileImage = profile.profileImage
    ? '<img src="' +
      escapeHtml(profile.profileImage) +
      '" class="profile-image w-1/3 mr-5 min-w-50 phone-hidden" alt="' +
      escapeHtml(profile.name) +
      '">' +
      '<img src="' +
      escapeHtml(profile.profileImage) +
      '" class="profile-image w-1/3 mr-5 w-50 phone-block hidden" alt="' +
      escapeHtml(profile.name) +
      '">'
    : ""
  const profileLinks = profile.links.length
    ? '<div class="mt-2 flex">' + renderProfileLinks(profile.links) + "</div>"
    : ""

  return (
    '<section data-section-type="profile">' +
    '<div class="' +
    titleMargin +
    ' mr-auto text-5xl font-bold flex">' +
    escapeHtml(profile.name) +
    "</div>" +
    '<div class="mt-5 mr-auto text-base font-bold items-start flex phone-flex-col">' +
    profileImage +
    '<div class="flex-1">' +
    profile.introHtml
      .map(function (paragraph) {
        return '<div class="text-wrap">' + paragraph + "</div>"
      })
      .join("") +
    profileLinks +
    "</div>" +
    "</div>" +
    "</section>"
  )
}

function renderPublicationsSection(section, isFirst) {
  const titleMargin = isFirst ? "mt-5" : "mt-10"
  return (
    '<section data-section-type="publications">' +
    '<div class="' +
    titleMargin +
    ' mr-auto text-3xl font-bold">' +
    escapeHtml(section.title) +
    "</div>" +
    '<div class="mt-5 flex flex-col gap-6 relative">' +
    section.publications.map(renderPublicationCard).join("") +
    "</div>" +
    "</section>"
  )
}

function renderMarkdownSection(section, isFirst) {
  const titleMargin = isFirst ? "mt-5" : "mt-10"
  return (
    '<section data-section-type="markdown">' +
    '<div class="' +
    titleMargin +
    ' mr-auto text-3xl font-bold">' +
    renderInlineMarkdown(section.title) +
    "</div>" +
    '<div class="markdown-section-content mt-5">' +
    section.bodyHtml +
    "</div>" +
    "</section>"
  )
}

function renderSection(section, index) {
  const isFirst = index === 0
  if (section.type === "profile") return renderProfileSection(section, isFirst)
  if (section.type === "publications") return renderPublicationsSection(section, isFirst)
  return renderMarkdownSection(section, isFirst)
}

function render(siteData) {
  if (siteData.title) document.title = siteData.title

  const app = document.getElementById("app")
  app.innerHTML =
    '<div class="main-page" font-sans="" p="x-4 y-10" text="center gray-700 dark:gray-200">' +
    '<div class="flex overflow-x-hidden px-5">' +
    '<div class="mx-auto max-w-200 text-left text-lg">' +
    siteData.sections.map(renderSection).join("") +
    '<div class="h-10"></div>' +
    "</div>" +
    "</div>" +
    "</div>"
}

async function main() {
  try {
    render(await loadSiteData())
  } catch (error) {
    console.error(error)
    document.getElementById("app").textContent = "Content could not be loaded."
  }
}

main()
