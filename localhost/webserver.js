const express = require('express')

const app = express()
let port = 3000

app.listen(port, function() {
    console.log('Server is running on localhost' + port)
});

function startHost() {
    app.get('/', function(req, res) {
        res.sendFile('index.html')
    });
}

module.exports = startHost;