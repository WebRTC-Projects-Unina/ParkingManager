var static = require('node-static');
var http = require('http');
var file = new (static.Server)();

const socketRooms = new Map(); // Mappa per tracciare le stanze e i socket



var app = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    file.serve(req, res);
}).listen(8181);

console.log('Server listening on port ' + app.address().port);

var io = require('socket.io')(app, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
});

io.sockets.on('connection', function (socket) {
    console.log(`A user connected: ${socket.id}`);

    socket.on('admin login', function(){
        socket.join('AdminRoom');
        console.log('Admin Joined');
    })

    socket.on('create or join', function (room) {
        // Recupera i dettagli della stanza
        const roomClients = io.sockets.adapter.rooms.get(room);
        const numClients = roomClients ? roomClients.size : 0;

        socketRooms.set(socket.id, room); // Mappa il socket al nome della stanza

        console.log(`Room ${room} has ${numClients} client(s)`);
        console.log(`Request to create or join room: ${room}`);

        if (numClients === 0) {
            // Crea e unisci la stanza
            socket.join(room);

            const data = {socketId: socket.id, roomName:room}
            socket.to('AdminRoom').emit('someoneAdded', data)

            socket.emit('created', room);
            console.log(`User ${socket.id} created and joined room ${room}`);
        } else if (numClients === 1) {
            // Unisci la stanza esistente
            socket.join(room);
            socket.emit('joined', room);
            io.to(room).emit('join', room);
            console.log(`User ${socket.id} joined room ${room}`);
        } else {
            // La stanza Ã¨ piena
            socket.emit('full', room);
            console.log(`Room ${room} is full`);
        }
    });

    
    // Gestione dei messaggi di chat
    socket.on('chat message', function (data) {
        console.log(`Chat message received: ${data.message}`);
        console.log(`Chat message received in the room: ${data.room}`)
        // Invia il messaggio a tutti i client della stessa stanza
        io.to(data.room).emit('chat message', data);
    });


    socket.on('disconnect', (data) => {

        console.log(`User ${socket.id} disconnected`);
        const roomName = socketRooms.get(socket.id); // Recupera il nome della stanza

        if (roomName){

            socket.to('AdminRoom').emit('someoneExited', roomName);
            socket.to(data).emit('someoneExited');
        }
        
    });
});