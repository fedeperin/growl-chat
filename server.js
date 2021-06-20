const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const port = process.env.PORT || 8080
const fs = require('fs-extra')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/views/chat.html')
})

io.on('connection', (socket) => {
  socket.emit('no broadcast connected')

  socket.on('i connected', nameOfPersonThatConnected => {
    socket.broadcast.emit('i connected', nameOfPersonThatConnected)
    socket.user = nameOfPersonThatConnected

    fs.readJson('./public/json/connections.json', (err, obj) => {
      if (err) console.error(err)
      fs.writeJson('./public/json/connections.json', {
          connected: obj.connected + 1
        })
        .then(() => {
          socket.broadcast.emit('someone connected')
          socket.emit('no broadcast connected')
        })
        .catch(err => {
          console.error(err)
        })
    })
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('someone disconnected', socket.user)

    fs.readJson('./public/json/connections.json', (err, obj) => {
      if (err) console.error(err)
      fs.writeJson('./public/json/connections.json', {
          connected: obj.connected - 1
        })
        .then(() => {})
        .catch(err => {
          console.error(err)
        })
    })
  })

  socket.on('new chat message', (msg, userSent, userImgUrl, userInnerHtml) => {
    socket.broadcast.emit('new chat message', msg, userSent, userImgUrl, userInnerHtml)
  })

  socket.on('i changed name', newUserName => {
    socket.user = newUserName
  })
})

server.listen(port, () => {
  console.log('Listening app at http://localhost:' + port)
})