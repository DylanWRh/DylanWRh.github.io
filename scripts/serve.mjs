import { createReadStream, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(fileURLToPath(new URL("../", import.meta.url)))
const port = Number(process.env.PORT || 8000)
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
}

const server = createServer(function (request, response) {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "")
  const filePath = resolve(root, relativePath)

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    response.writeHead(403).end("Forbidden")
    return
  }

  try {
    if (!statSync(filePath).isFile()) throw new Error("Not a file")
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404).end("Not found")
  }
})

server.listen(port, "127.0.0.1", function () {
  console.log(`Homepage preview: http://127.0.0.1:${port}`)
})
