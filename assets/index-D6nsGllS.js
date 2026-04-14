const siteData = {
  title: "Ruihuan Wang Homepage",
  name: "Ruihuan Wang",
  avatar: "./favicon.png",
  introHtml: [
    'I am currently pursuing my PhD degree at <a class="highlight" target="_blank" href="https://sai.pku.edu.cn/">School of Intelligence Science and Technology</a>, <a class="highlight" target="_blank" href="https://www.pku.edu.cn/">Peking University</a>, supervised by <a class="highlight" target="_blank" href="https://wang-ps.github.io/">Peng-Shuai Wang</a>. Before that, I received my B.S. degree from <a class="highlight" target="_blank" href="https://eecs.pku.edu.cn/">EECS</a>, <a class="highlight" target="_blank" href="https://www.pku.edu.cn/">Peking University</a>.',
    'My research interests lie in <i>computer graphics</i> and <i>3D vision</i>, with a special focus on <i>3D content creation</i>.',
  ],
  links: [
    {
      label: "Email",
      href: "mailto:2501112180@stu.pku.edu.cn",
      iconClass: "i-solar:letter-bold",
    },
    {
      label: "GitHub",
      href: "https://github.com/DylanWRh",
      iconClass: "i-mdi:github",
    },
  ],
  sectionTitle: "Publications",
  emphasisNames: ["Rui-Huan Wang", "Ruihuan Wang"],
  publications: [
    {
      conf: "ACM SIGGRAPH 2025",
      teaser: "./assets/papers/octgpt.png",
      title: "OctGPT: Octree-based Multiscale Autoregressive Models for 3D Shape Generation",
      authors: "Si-Tong Wei, Rui-Huan Wang, Chuan-Zhi Zhou, Baoquan Chen, and Peng-Shuai Wang",
      links: [
        { label: "Arxiv", url: "https://arxiv.org/abs/2504.09975" },
        { label: "Code", url: "https://github.com/octree-nn/octgpt" },
      ],
    },
  ],
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function emphasizeAuthors(authors, emphasisNames) {
  let html = escapeHtml(authors || "")
  const orderedNames = [...(emphasisNames || [])].sort(function (a, b) {
    return b.length - a.length
  })

  orderedNames.forEach(function (name) {
    if (!name) return
    const starredPattern = new RegExp(escapeRegex(name + "*"), "g")
    const plainPattern = new RegExp(escapeRegex(name), "g")
    html = html.replace(starredPattern, "<b>" + escapeHtml(name + "*") + "</b>")
    html = html.replace(plainPattern, "<b>" + escapeHtml(name) + "</b>")
  })

  return html
}

function renderProfileLinks(links) {
  return links
    .map(function (link, index) {
      const extraClass = index === 0 ? "" : " ml-5"
      return (
        '<a class="highlight flex items-center' +
        extraClass +
        '" target="_blank" href="' +
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
        '" target="_blank">' +
        escapeHtml(link.label) +
        "</a>"
      )
    })
    .join("")
}

function renderPublicationCard(publication) {
  return (
    '<div class="relative">' +
    '<div class="publication-card flex items-center bg-white dark:bg-gray-800 rounded-md overflow-hidden transition-shadow duration-300 shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 relative phone-flex-col">' +
    '<div class="pc-w-50 phone-w-full h-full flex shadow-md border-r border-gray-200 dark:border-gray-700 pc-absolute bg-white">' +
    '<img src="' +
    escapeHtml(publication.teaser) +
    '" alt="Paper Teaser" class="object-contain">' +
    "</div>" +
    '<div class="pc-ml-50 flex-1 px-6 py-4 min-h-40 flex flex-col justify-between">' +
    "<div>" +
    '<div class="text-xl font-bold mb-2">' +
    escapeHtml(publication.title) +
    "</div>" +
    '<div class="text-base text-gray-700 dark:text-gray-300 mb-2">' +
    emphasizeAuthors(publication.authors, siteData.emphasisNames) +
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

function render() {
  document.title = siteData.title

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
    '<img src="' +
    escapeHtml(siteData.avatar) +
    '" class="w-1/3 mr-5 min-w-50 phone-hidden">' +
    '<img src="' +
    escapeHtml(siteData.avatar) +
    '" class="w-1/3 mr-5 w-50 phone-block hidden">' +
    '<div class="flex-1">' +
    siteData.introHtml.map(function (paragraph) {
      return '<div class="text-wrap">' + paragraph + "</div>"
    }).join("") +
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
    siteData.publications.map(renderPublicationCard).join("") +
    "</div>" +
    '<div class="h-10"></div>' +
    "</div>" +
    "</div>" +
    "</div>"
}

render()
