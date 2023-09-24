const { Client, LocalAuth } = require('whatsapp-web.js')
const Events = require('events')

class WhatsAppWeb extends Events
{
    _client = {}

    constructor() {
        super() 
    }

    initialize(client_id) {
        if (this._client[client_id]) {
            this._handleOnWhatsappEvent(client_id)
            return
        }

        this._client[client_id] = new Client({
            authStrategy: new LocalAuth({ clientId:  client_id}),
            puppeteer: { headless: false }
        })

        this._client[client_id].initialize()

        this._handleOnWhatsappEvent(client_id)
    }

    _handleOnWhatsappEvent(client_id) {
        if (this._client[client_id]) {
            this._client[client_id].on('qr', (qr) => {
                this.emit('newQR', qr)
            })

            this._client[client_id].on('loading_screen', () => {
                this.emit('onLoadingScreen')
            })
            
            this._client[client_id].on('ready', () => {
                this.emit('ready', client_id)
            })
        }
    }
}

module.exports = WhatsAppWeb