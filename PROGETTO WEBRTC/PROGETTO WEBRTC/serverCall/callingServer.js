var static = require('node-static');
var http = require('http');
var file = new (static.Server)();

const socketRooms = new Map(); // Mappa per tracciare le stanze e i socket


//creo un server in ascolto sulla porta 8181 e abilito la modalità CORS
var app = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    file.serve(req, res);
}).listen(8181);

console.log('Server listening on port ' + app.address().port);

//importo la libreria "socket.io" e abilito CORS
var io = require('socket.io')(app, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
});

//quando qualcuno si connette alla socket,
io.sockets.on('connection', function (socket) {
    console.log(`A user connected: ${socket.id}`); //stampo chi si è connesso

    //se si è connesso l'admin, allora l'admin joina la "admin room"
    socket.on('admin login', function(){
        socket.join('AdminRoom');
        
        console.log('Admin Joined', socket.id);
    })

    //se invece riceve un messaggio di creazione a una stanza, creata dagli utenti.
    socket.on('create', function (room) {
       

        //Recupero info per la stanza dell'admin per verificare che non sia presente!
        const roomAdmin = io.sockets.adapter.rooms.get('AdminRoom');
        const thereisAdmin = roomAdmin ? roomAdmin.size : 0;

        //Se l'admin non è presente nella 'AdminRoom' allora non facciamo creare la stanza.
        if(thereisAdmin===0){
            socket.emit('adminOff')
            return;
        }

        
        //Se tra tutte le stanze, il nome scelto già esiste, mando un messaggio di full.
        for (let value of socketRooms.values()) { 
            if (value === room) {
              socket.emit('full')
              return;
            }
        }
    
        // Crea e unisci la stanza
        socket.join(room);

        socketRooms.set(socket.id, room); // Mappa il socket al nome della stanza
        //memorizzo i dati da inviare (ovvero l'id della socket e il nome della stanza)
        const data = {socketId: socket.id, roomName:room}
        socket.to('AdminRoom').emit('someoneAdded', data) //mando il messaggio sopracitato alla "AdminRoom" e innesco l'evento "someoneAdded" per notificare che qualcuno si è unito alla stanzaq

        //poi ovviamente mando un messaggio di creazione della stanza, riportando il nome della stanza
        socket.emit('created', room);
        console.log(`User ${socket.id} created and joined room ${room}`);
        
    });


    //Richiesta di Join, verrà solo dall'Admin!
    socket.on('join', function (room) {

        const roomClients = io.sockets.adapter.rooms.get(room);

        if(roomClients.size===1){
            // Unisci la stanza esistente
            socket.join(room);
            socket.emit('joined', room);

            socketRooms.set(socket.id, room); // Mappa il socket al nome della stanza
            io.to(room).emit('join', room);//mando a tutti i partecipanti nella room il messaggio che qualcuno ha joinato la stanza
            console.log(`User ${socket.id} joined room ${room}`);
        }

        
        
    })
    
    // Gestione dei messaggi di chat
    socket.on('chat message', function (data) {
        console.log(`Chat message received: ${data.message}`);
        console.log(`Chat message received in the room: ${data.room}`)
        // Invia il messaggio a tutti i client della stessa stanza
        io.to(data.room).emit('chat message', data);
    });

    //se qualcuno si disconnette dalla stanza,
    socket.on('disconnect', (data) => {

        console.log(`User ${socket.id} disconnected`);
        const roomName = socketRooms.get(socket.id); // Recupera il nome della stanza

        

        if (roomName){
            //se il nome della stanza è stato recuperato, notifico la stanza admin che qualcuno ha abbandonato (inviando il messaggio "someoneExited")
            socket.to('AdminRoom').emit('someoneExited', roomName);
            socket.to(data).emit('someoneExited'); //e poi lo mando a tutti gli altri partecipanti
            socketRooms.delete(socket.id)
        }
        
    });
});