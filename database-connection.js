const mysql = require('mysql')

class DatabaseConnection 
{
    _database
    _databaseConfig

    constructor() {
        this._databaseConfig = {
            host     : 'localhost',
            user     : 'idevart',
            password : 'Lmao123!@#',
            database : 'whatsapp_web_api'
        }
    }

    connect() {
        return new Promise((resolve) => {
            this._database = mysql.createConnection(this._databaseConfig)
            this._database.connect((err) => {
                if (err) {
                    // console.error('MySql connection error: ', err)
                    resolve({ status: 'failed', message: err })
                } else {
                    // console.log('MySql connection success')
                    resolve({ status: 'success', message: null })
                }
            })
        })
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (!this._database) {
                resolve({ status: 'failed', message: 'There is no connection of any database' })
                return
            }

            this._database.end((err) => {
                if (err) {
                    // console.error('MySql connection error: ', err)
                    reject(err)
                } else {
                    // console.log('MySql connection success')
                    resolve()
                }
            })
        })
    }

    query(query, value) {
        return new Promise((resolve) => {
            if (!this._database) {
                resolve({ status: 'failed', message: 'There is no connection of any database' })
                return
            }

            this._database.query(query, value, function (error, results) {
                if (error) {
                    resolve({ status: 'failed', message: error, data: null })
                    return
                } else if (results) {
                    resolve({ status: 'success', message: null, data: results })
                }
            })
        })
    }
}

module.exports = DatabaseConnection