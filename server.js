var express = require('express');
var app = express();
app.use(express.static(__dirname));

var server = require('http').Server(app);

//database
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/chat'

mongoose.connect(dbUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err))

var Message = mongoose.model('Message', {
    name: String,
    message: String
})



var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))


//socket
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log("A user is connected, id: " + socket.client.id)

    socket.on('disconnect', function () {
        console.log('User disconnected, id: ' + socket.client.id);
    });
})


//requests

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
})

app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save((err) => {
        if (err) 
            sendStatus(500);
        
        io.emit('message', req.body);
        res.sendStatus(200);
        console.log("New data: " + String(message));
    })
})

app.delete('/messages', (req, res) => {
    Message.deleteMany({}, (err, messages) => {
        res.send("All Data deleted");
        io.emit('delete');
        console.log("All data removed");
    })
})


//start listening
var port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('server is running on port', server.address().port);
});