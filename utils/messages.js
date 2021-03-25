const moment = require('moment')

function formatMessage(text, username) {
    return {
        
        text,
        username,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;