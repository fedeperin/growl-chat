// Socket io
const socket = io()

// DOM consts
const channels = document.querySelector('.channels')
const menuBTN = document.querySelector('.menu')
const messages = document.querySelector('.messages')
const sendMessageForm = document.querySelector('form#send-message')
const messageInput = document.querySelector('form#send-message input')
const profileInfoName = document.querySelector('.channels .profile-info p')
const profileImgs = document.querySelector('.profile-imgs')
const profileImg = document.querySelector('.profile-img')
const newNameForm = document.querySelector('form#changeName')
const newNameInput = document.querySelector('form#changeName input')
const opaqueBg = document.querySelector('.bg')
const notificationSound = new Audio('./sounds/notification.mp3')
const addGifBtn = document.querySelector('#add-gif')
const gifsContainer = document.querySelector('.gifs-container')
const closeGifs = document.querySelector('.gifs-container .btn-close')
const searchGifsForm = document.querySelector('.gifs-container form')
const gifsPlace = document.querySelector('.gifs-container .gifs-place')
const connectionsDiv = document.querySelector('.connections')
const modSound = new Audio('./sounds/mod.mp3')

const arrayProfileImgs = [
    '/profile-imgs/1.png',
    '/profile-imgs/2.png',
    '/profile-imgs/3.png',
    '/profile-imgs/4.png',
    '/profile-imgs/5.png',
    '/profile-imgs/6.png',
    '/profile-imgs/7.png',
    '/profile-imgs/8.png',
    '/profile-imgs/9.png',
    '/profile-imgs/10.png',
    '/profile-imgs/11.png',
    '/profile-imgs/12.png',
    '/profile-imgs/13.png',
    '/profile-imgs/14.png',
    '/profile-imgs/15.png',
    '/profile-imgs/16.png',
    '/profile-imgs/17.png',
    '/profile-imgs/18.png',
    '/profile-imgs/19.png',
    '/profile-imgs/20.png',
    '/profile-imgs/21.png'
]

let userName = 'Anónimo '
let lastUserName = 'Anónimo '
let profileImageUrl = '/profile-imgs/1.png'
let messagesSent = 0
let messageIntervalTime = 10000

// Generate random number
function generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

// Create a new message
function createMessage(messageProfileImg, messageUserName, messageTextContent, useTextContent) {
    let contMsg = document.createElement('div')
    contMsg.classList.add('cont-msg')

    let msg = document.createElement('div')
    msg.classList.add('msg')

    let imgCont = document.createElement('div')

    let userImg = document.createElement('img')
    userImg.classList.add('user-image')
    userImg.setAttribute('src', messageProfileImg)
    userImg.setAttribute('alt', userName)

    let textContainer = document.createElement('div')

    let userNameCont = document.createElement('p')
    userNameCont.classList.add('user-name')
    userNameCont.textContent = messageUserName

    let message = document.createElement('p')
    message.classList.add('message-text')

    if (useTextContent) {
        message.textContent = messageTextContent
    } else {
        message.innerHTML = messageTextContent
    }


    contMsg.appendChild(msg)
    msg.appendChild(imgCont)
    imgCont.appendChild(userImg)
    msg.appendChild(textContainer)
    textContainer.appendChild(userNameCont)
    textContainer.appendChild(message)

    messages.appendChild(contMsg)

    // Function for making gifs responsive
    makeGifResponsive()
}

// Function for showing people connected
function showConnections() {
    fetch("./json/connections.json")
    .then(res => res.json())
    .then(res => {
        connectionsDiv.textContent = res.connected
    })
}

// Function for checking spam
function countMessages() {
    if(messagesSent >= 4) {
        if(localStorage.getItem('timesSpamming') == 0) {

            localStorage.setItem('timesSpamming', 1)
            createMessage('./profile-imgs/mod-bot.png', 'Moderador', 'Detecté que estabas haciendo spam... Primera advertencia, a la tercera quedas bloqueado', true)

        }else if(localStorage.getItem('timesSpamming') == 1) {

            localStorage.setItem('timesSpamming', 2)
            createMessage('./profile-imgs/mod-bot.png', 'Moderador', 'Detecté que estabas haciendo spam... Última advertencia, una vez más que haces spam quedas bloqueado', true)

        }else if(localStorage.getItem('timesSpamming') == 2) {

            localStorage.setItem('timesSpamming', 3)

            createMessage('./profile-imgs/mod-bot.png', 'Moderador', 'Lamentablemente quedaste bloqueado permanentemente por hacer spam', true)

            socket.emit('new chat message', `${userName} quedo bloqueado permanentemente por hacer spam`, 'Moderador', './profile-imgs/mod-bot.png', true)

            localStorage.setItem('userBlocked', true)
        }

        // Play blocked sound
        modSound.currentTime = 0
        modSound.play()
    }
}

// Function for making responsive the gifs
function makeGifResponsive() {
    document.querySelectorAll('.imageGif').forEach(gif => {
        if(window.innerWidth <= gif.width + 200) {
            gif.style.width = '100%'
        }
    })
}

// Listen previous function when the device is resized
window.onresize = makeGifResponsive

// Create random name
for (var i = 0; i <= 4; i++) {
    userName = userName + generateRandom(0, 10)
    lastUserName = lastUserName + generateRandom(0, 10)
    console.log(i)
    console.clear()
}

// Keep user data at the local storage

// LocalStorage Image
if (!localStorage.getItem('profileImage')) {
    profileImageUrl = arrayProfileImgs[generateRandom(0, 21)]
    localStorage.setItem('profileImage', profileImageUrl)
    profileImg.setAttribute('src', profileImageUrl)
} else {
    profileImageUrl = localStorage.getItem('profileImage')
    profileImg.setAttribute('src', profileImageUrl)
}

// LocalStorage Name
if (!localStorage.getItem('profileName')) {
    localStorage.setItem('profileName', userName)
    lastUserName = userName
} else {
    userName = localStorage.getItem('profileName')
    profileInfoName.textContent = userName
    lastUserName = userName
}

// LocalStorage blocked
if (!localStorage.getItem('userBlocked')) {
    localStorage.setItem('userBlocked', false)
}

// Times spamming
if (!localStorage.getItem('timesSpamming')) {
    localStorage.setItem('timesSpamming', 0)
}

// Change the name by the created name
profileInfoName.textContent = userName

// Open/close menu
menuBTN.addEventListener('click', () => {
    channels.classList.toggle('opened')
})

// When the message was sent...
sendMessageForm.addEventListener('submit', e => {
    // Don't refresh the page when the form is sended
    e.preventDefault()

    // If the message was not emty...
    if (!messageInput.value.trim() == '' && localStorage.getItem('userBlocked') == 'false') {
        // Socket emit a new message
        socket.emit('new chat message', messageInput.value.trim(), userName, profileImageUrl, true)

        // Create message
        createMessage(profileImageUrl, userName, messageInput.value, true)
        
        // Scroll to the bottom of the chat
        messages.scrollTo(0, messages.scrollHeight)

        messagesSent += 1
        countMessages()
        setInterval(() => {

            messagesSent -= 1

        }, messageIntervalTime)
        
    } else if (!messageInput.value.trim() == '' && localStorage.getItem('userBlocked') == 'true') {
        // Create blocked message
        createMessage('./profile-imgs/mod-bot.png', 'Moderador', 'Estás en modo "Solo lectura" permanentemente por hacer spam', true)
        
        // Scroll to the bottom of the chat
        messages.scrollTo(0, messages.scrollHeight)

        // Play blocked Sound
        modSound.currentTime = 0
        modSound.play()
    }
    
    // Change the input value to ''
    messageInput.value = ''

})

// When the message input was focused close the menu
messageInput.addEventListener('focus', () => {
    channels.classList.remove('opened')
})

// BTN for changing image
profileImg.addEventListener('click', () => {
    profileImgs.style.display = 'block'
    opaqueBg.style.display = 'flex'
})

// Form to change name
newNameForm.addEventListener('submit', e => {
    // Dont refresh the page
    e.preventDefault()


    if (!newNameInput.value.trim() == '') {
        userName = newNameInput.value.trim()
        profileInfoName.textContent = userName
        opaqueBg.style.display = 'none'
        newNameForm.style.display = 'none'
        localStorage.setItem('profileName', userName)

        // Socket emit changed name, for changeing socket.user at server.js
        socket.emit('i changed name', newNameInput.value.trim())

        // Socket emit a new message
        socket.emit('new chat message', `${lastUserName} ahora se llama ${userName}`, 'Bot de nombres', './profile-imgs/names-bot.png', true)

        // Create message
        createMessage('./profile-imgs/names-bot.png', 'Bot de nombres', `Te cambiaste el nombre de ${lastUserName} a ${userName}`, true)

        // Scroll to the bottom of the chat
        messages.scrollTo(0, messages.scrollHeight)


        // Play the sound
        notificationSound.currentTime = 0
        notificationSound.play()


        lastUserName = userName
    } else {
        newNameInput.value = ''
    }
})

// BTN to change name
profileInfoName.addEventListener('click', () => {
    newNameForm.style.display = 'flex'
    opaqueBg.style.display = 'flex'
    newNameInput.value = userName
})

// Close things by touching the background
opaqueBg.addEventListener('click', () => {
    newNameForm.style.display = 'none'
    profileImgs.style.display = 'none'
    opaqueBg.style.display = 'none'
})

// Change profile images
arrayProfileImgs.forEach(img => {
    let image = document.createElement('img')
    image.setAttribute('src', img)
    image.setAttribute('alt', img)

    profileImgs.appendChild(image)

    image.addEventListener('click', () => {
        profileImageUrl = img
        localStorage.setItem('profileImage', profileImageUrl)
        profileImg.setAttribute('src', profileImageUrl)

        profileImgs.style.display = 'none'
        opaqueBg.style.display = 'none'
    })
})

// Recive and send socket events
socket.emit('i connected', userName)

// Display connected people
showConnections()

// When I recive a message...
socket.on('new chat message', (othersMsg, otherUserSent, otherUserImgUrl, otherInnerHTML) => {
    // Create a message
    createMessage(otherUserImgUrl, otherUserSent, othersMsg, otherInnerHTML)

    // Scroll to the bottom of the messages
    messages.scrollTo(0, messages.scrollHeight)

    // Play the sound
    notificationSound.currentTime = 0
    notificationSound.play()

    // Function for making gifs responsive
    if(otherInnerHTML == true) {
        makeGifResponsive()
    }
})

socket.on('i connected', personConnectedName => {
    // Create bot message
    createMessage('./profile-imgs/bot.png', 'Bot de conexiónes', `${ personConnectedName } se conectó`, true)

    // Play the sound
    notificationSound.currentTime = 0
    notificationSound.play()

    // Scroll to the bottom of the messages
    messages.scrollTo(0, messages.scrollHeight)

    // Display connected people
    showConnections()
})

socket.on('someone disconnected', personDisconnectedName => {
    // Create bot message
    createMessage('./profile-imgs/bot.png', 'Bot de conexiónes', `${ personDisconnectedName } se desconectó`, true)
    
    // Play the sound
    notificationSound.currentTime = 0
    notificationSound.play()
    
    // Scroll to the bottom of the messages
    messages.scrollTo(0, messages.scrollHeight)
    
    // Display connected people
    showConnections()
})

socket.on('no broadcast connected', () => {
    // Display connected people
    showConnections()
})

// Add gifs section
function fetchGifs(urlForFetching) {
    gifsPlace.innerHTML = ''

    fetch(urlForFetching)
        .then(res => res.json())
        .then(data => {
            data.results.forEach(gif => {
                let gifsPlaceGif = document.createElement('img')
                gifsPlaceGif.setAttribute('src', gif.media[0].gif.url)

                gifsPlace.appendChild(gifsPlaceGif)

                gifsPlaceGif.addEventListener('click', () => {
                    // Socket emit a new message
                    socket.emit('new chat message', `<img src="${ gif.media[0].gif.url }" class="imageGif">`, userName, profileImageUrl, false)

                    // Create message
                    createMessage(profileImageUrl, userName, `<img src="${ gif.media[0].gif.url }" class="imageGif">`, false)

                    // Scroll to the bottom of the chat
                    messages.scrollTo(0, messages.scrollHeight)

                    // Desappear the gifs container
                    gifsContainer.style.left = '-100vw'
                })
            })
        })
}

// Close the gifs container
closeGifs.addEventListener('click', () => {
    gifsContainer.style.left = '-100vw'

    gifsPlace.innerHTML = ''
    searchGifsForm.querySelector('input').value = ''
})

// Search Gifs
searchGifsForm.addEventListener('submit', e => {
    e.preventDefault()

    if(searchGifsForm.querySelector('input').value.trim()) {
        fetchGifs(`https://g.tenor.com/v1/search?q=${ searchGifsForm.querySelector('input').value }&key=LIVDSRZULELA&limit=16`)
    }
})

// Open the gifs container
addGifBtn.addEventListener('click', () => {
    gifsContainer.style.left = '0'
    fetchGifs("https://g.tenor.com/v1/trending?key=LIVDSRZULELA")
})