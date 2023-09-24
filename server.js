const express = require('express'),
app = express(),
bodyParser = require('body-parser'),
http = require('http'),
server = http.createServer(app),
jsonParser = bodyParser.json(),
io = require('socket.io')(server)
const { MongoClient } = require('mongodb'),
WhatsAppWeb = require('./whatsapp-web')


// Start server
const PORT = 40000
server.listen(PORT, async () => {
    console.log(`Server listen on port: ${PORT} | url: http://localhost:${PORT}`)

    // Init MongoDB
    const uri = 'mongodb://127.0.0.1:27017'
    const dbName = 'whatsapp_api'
    const collectioName = 'api_auth'
    const mongoClient = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    const mongoConnect = await mongoClient.connect()
    if (!mongoConnect) {
        console.log('Cannot connect to MongoDB')
        return 
    }

    const db = mongoClient.db(dbName)
    const whatsapp = new WhatsAppWeb()


    // Handle socket from client side
    io.on('connection', (socket) => {
        console.log('Client connected')

        socket.on('join', async ({ channel, key }) => {
            const authUser = await db.collection(collectioName).find({ auth_channel: channel, auth_key: key }).toArray()
            if (authUser.length > 0) {
                socket.join(channel)

                console.log(`User join room: ${channel}`)
                socket.emit('serverResponse', { status: 200, message: `Successfully join room: ${channel}`, data: { socket_connect: true } })
                
                // Init whatsapp web
                whatsapp.initialize(channel)

                whatsapp.on('newQR', (data) => {
                    console.log('New QR', data)
                    socket.emit('whatsappResponse', { status: 200, message: `New QR code detected`, data: { event: 'new-qr', data } })
                })

                whatsapp.on('onLoadingScreen', (data) => {
                    console.log('Loading screen')
                    socket.emit('whatsappResponse', { status: 200, message: `New QR code detected`, data: { event: 'loading-screen' } })
                })

                whatsapp.on('ready', async (data) => {
                    console.log('WhatsApp ready!')
                    socket.emit('whatsappResponse', { status: 200, message: `WhatsApp Ready`, data: { event: 'server-status', data: 'ready' } })
                })

            } else {
                console.log(`Room: ${channel} not found`)
                socket.emit('serverResponse', { status: 404, message: `Room: ${channel} not found`, data: { socket_connect: false } })
            }
        })
    })



    app.get('/', (req, res) => {
        res.send('<h1>Hello world</h1>')
    })
})
