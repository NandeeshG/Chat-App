const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

const exphbs = require('express-handlebars')
const hbs = exphbs.create({
    helpers: {
        print_name: function () {
            return this.username
        },
    },
})
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home', {
        username: req.params.username || req.query.username || 'Guest',
        friends: req.body
            ? req.body.friends
            : [
                  { username: 'Friend1' },
                  { username: 'Friend2' },
                  { username: 'Friend3' },
              ],
    })
})

io.on('connection', (socket) => {
    console.dir(Object.keys(socket))
    console.log(socket.data)
    console.log(socket.id)
    socket.on('chat message', (data) => {
        //socket.broadcast.emit('chat message', data)
        io.emit('chat message', data)
        console.log(data)
    })
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Active at http://localhost:${PORT}`))
