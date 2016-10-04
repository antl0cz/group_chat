/**
 * Created by Ant on 10/3/16.
 */
var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
    res.render('index');
})

var server = app.listen(8000);

var io = require('socket.io').listen(server);

var group_messages = [];
var group_users = [];

// socket connection
io.sockets.on('connection', function (socket) {
    // takes user info
    socket.on('user', function (data) {
        // user socket id and name
        group_users.push([socket.id, data.name]);
        console.log([socket.id, data.name]);

        // pushes users name to message board
        group_messages.push(["<p class='join'><b>" + data.name + " has entered the group chat</b></p>"]);
        io.emit('displayed_messages', {previous_messages: group_messages});
    })

    // pushes new messages to message board
    socket.on('new_message', function (data) {
        group_messages.push([data.user, data.message]);
        io.emit('displayed_messages', {previous_messages: group_messages});
    })

    // displays all messages to all users
    io.emit('displayed_messages', {previous_messages: group_messages});

    // displays message that user has disconnected from the group message
    socket.on('disconnect', function () {
        for(var user in group_users){
            user = group_users[user];
            if(user[0] === socket.id){
                var dc_user = user[1];
                group_messages.push(["<p class='disco'><b>" + dc_user + socket.id + " has left the group chat... </b></p>"]);
                io.emit('displayed_messages', {previous_messages: group_messages});
            }
        }
    })
})

