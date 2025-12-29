const http = require("http")
const fs = require("fs")
const path = require("path")

const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "./public/index.html" : "./public" + req.url
  const ext = path.extname(filePath)
  let contentType = "text/html"

  if (ext === ".css") contentType = "text/css"
  if (ext === ".js") contentType = "application/javascript"

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end("Not Found")
    } else {
      res.writeHead(200, { "Content-Type": contentType })
      res.end(data)
    }
  })
})

server.listen(3000, () => {
  console.log("http://localhost:3000")
})
