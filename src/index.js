const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

app.use(express.static('public'))

const idNameMap = {}

app.get('/validateUsername', (req, res) => {
    const name = req.headers.username
    if (Object.values(idNameMap).includes(name))
        res.status(401).send({ showError: 'Username already taken.' })
    else res.send()
})

io.on('connection', (socket) => {
    idNameMap[socket.id] = `Guest(${socket.id.substr(0, 3)})`
    io.emit('announcement', `${idNameMap[socket.id]} joined`, 'green')
    socket.emit('new user', idNameMap[socket.id])
    io.emit('user list', Object.values(idNameMap))
    //console.log('Joined ', idNameMap)

    socket.on('chat message', (data, username) => {
        //console.log('Chat message event ', idNameMap)
        if (idNameMap[socket.id] === username)
            io.emit('chat message', data, username)
        else
            socket.emit(
                'announcement',
                'Invalid user! Please rejoin chat...',
                'red'
            )
    })

    socket.on('change username', (username) => {
        const oldName = idNameMap[socket.id]
        idNameMap[socket.id] = username
        //console.log('Change username event ', idNameMap)
        io.emit(
            'announcement',
            `${oldName} changed their username to ${username}`,
            'orange'
        )
        io.emit('user list', Object.values(idNameMap))
    })

    socket.on('disconnect', () => {
        //console.log('Disconnect event ', idNameMap)
        io.emit(
            'announcement',
            `${idNameMap[socket.id]} has left the chat`,
            'red'
        )
        delete idNameMap[socket.id]
        io.emit('user list', Object.values(idNameMap))
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Active at http://localhost:${PORT}`))
