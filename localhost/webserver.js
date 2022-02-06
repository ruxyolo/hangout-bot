const express = require('express')

const app = express()
let port = 3000

app.get('/', function(req, res) {
    res.sendStatus(200)
    res.sendFile('index.html')
});

function startHost() {
    app.listen(port, function() {
        console.log('Server is running on localhost' + port)
    });
}

module.exports = startHost;