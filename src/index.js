const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const exphbs = require('express-handlebars')
const hbs = exphbs.create({
    helpers: {
        foo: function () {
            return 'Foo!'
        },
        print_name: function () {
            return this.username
        },
    },
})
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static('public'))

io.on('connection', () => {
    console.log('New WebSocket Conn')
})

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

server.listen(PORT, () => console.log(`Active at http://localhost:${PORT}`))
