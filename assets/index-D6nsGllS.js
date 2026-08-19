const CONTENT_PATHS = {
  profile: "./content/profile.md",
  publications: "./content/publications.md",
}

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

function renderInlineMarkdown(value) {
  const linkPattern = /\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g
  let html = ""
  let cursor = 0
  let match

  while ((match = linkPattern.exec(value)) !== null) {
    html += renderTextFormatting(value.slice(cursor, match.index))
    html +=
      '<a class="highlight" target="_blank" rel="noopener noreferrer" href="' +
      escapeHtml(match[2]) +
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
    introHtml: paragraphs.map(renderInlineMarkdown),
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

async function loadMarkdown(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error("Unable to load " + path + " (HTTP " + response.status + ")")
  }
  return { markdown: await response.text(), sourceUrl: response.url }
}

async function loadSiteData() {
  const [profileFile, publicationIndexFile] = await Promise.all([
    loadMarkdown(CONTENT_PATHS.profile),
    loadMarkdown(CONTENT_PATHS.publications),
  ])
  const profile = parseProfile(profileFile.markdown, profileFile.sourceUrl)
  const publicationIndex = parsePublicationIndex(
    publicationIndexFile.markdown,
    publicationIndexFile.sourceUrl,
  )
  const publicationFiles = await Promise.all(publicationIndex.sources.map(loadMarkdown))

  return {
    ...profile,
    sectionTitle: publicationIndex.title,
    publications: publicationFiles.map(function (file) {
      return parsePublication(file.markdown, file.sourceUrl)
    }),
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

function render(siteData) {
  document.title = siteData.title

  const profileImage = siteData.profileImage
    ? '<img src="' +
      escapeHtml(siteData.profileImage) +
      '" class="profile-image w-1/3 mr-5 min-w-50 phone-hidden" alt="' +
      escapeHtml(siteData.name) +
      '">' +
      '<img src="' +
      escapeHtml(siteData.profileImage) +
      '" class="profile-image w-1/3 mr-5 w-50 phone-block hidden" alt="' +
      escapeHtml(siteData.name) +
      '">'
    : ""

  const app = document.getElementById("app")
  app.innerHTML =
    '<div class="main-page" font-sans="" p="x-4 y-10" text="center gray-700 dark:gray-200">' +
    '<div class="flex overflow-x-hidden px-5">' +
    '<div class="mx-auto max-w-200 text-left text-lg">' +
    '<div class="flex flex-col">' +
    '<div class="mt-5 mr-auto text-5xl font-bold flex">' +
    escapeHtml(siteData.name) +
    "</div>" +
    '<div class="mt-5 mr-auto text-base font-bold items-start flex phone-flex-col">' +
    profileImage +
    '<div class="flex-1">' +
    siteData.introHtml
      .map(function (paragraph) {
        return '<div class="text-wrap">' + paragraph + "</div>"
      })
      .join("") +
    '<div class="mt-2 flex">' +
    renderProfileLinks(siteData.links) +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="mt-10 mr-auto text-3xl font-bold">' +
    escapeHtml(siteData.sectionTitle) +
    "</div>" +
    "</div>" +
    '<div class="mt-5 flex flex-col gap-6 relative">' +
    siteData.publications
      .map(function (publication) {
        return renderPublicationCard(publication)
      })
      .join("") +
    "</div>" +
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
