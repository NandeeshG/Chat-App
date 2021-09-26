const socket = io()
const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')
const messagesBox = document.getElementById('messagesBox')
const changeName = document.getElementById('changeName')
const printUsername = document.getElementById('printUsername')
const usersBox = document.getElementById('usersBox')
const userList = document.getElementById('users')
let username = ''

form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input.value) {
        socket.emit('chat message', input.value, username)
        input.value = ''
    }
})

socket.on('chat message', (msg, userId) => {
    const elem = document.createElement('li')
    elem.innerHTML = `<span style="color:blue">${userId}:</span> ${msg}`
    messages.appendChild(elem)
    messagesBox.scrollTo(0, messagesBox.scrollHeight)
})

socket.on('announcement', (msg, color) => {
    const elem = document.createElement('li')
    elem.textContent = msg
    elem.classList = 'announcement'
    elem.style.color = color
    messages.appendChild(elem)
    messagesBox.scrollTo(0, messagesBox.scrollHeight)
})

socket.on('new user', (userId) => {
    updateUsername(userId)
})

changeName.addEventListener('click', async () => {
    let name = prompt('Please enter new username')
    if (name === null || name.length === 0) return
    if (name.length > 20) {
        alert('Name cannot be more than 20 chars long!')
        return
    }
    if (name === username) {
        alert('Requested name as before!')
        return
    }
    try {
        let res = await fetch('/validateUsername', {
            headers: { username: name },
        })
        if (res.status === 200) {
            socket.emit('change username', name)
            updateUsername(name)
        } else {
            res = await res.json()
            alert(res.showError)
        }
    } catch (e) {
        console.log('Validation failed: ', e)
    }
})

function updateUsername(newUsername) {
    username = newUsername
    printUsername.innerText = `${username}:`
}

socket.on('user list', (users) => {
    userList.innerHTML = ''
    for (let u of users) {
        const newelem = document.createElement('li')
        newelem.innerText = u
        userList.appendChild(newelem)
    }
})

const rightArrow = '&#5171;'
const leftArrow = '&#5176;'
const toggleUsers = document.getElementById('toggleUsers')
let showUsers = 0

toggleUsers.addEventListener('click', () => {
    toggleUsersBox()
})
function toggleUsersBox() {
    if (showUsers) {
        usersBox.style.display = 'none'
        showUsers = 0
        toggleUsers.innerHTML = leftArrow
    } else {
        usersBox.style.display = 'flex'
        showUsers = 1
        toggleUsers.innerHTML = rightArrow
    }
}
toggleUsersBox()
