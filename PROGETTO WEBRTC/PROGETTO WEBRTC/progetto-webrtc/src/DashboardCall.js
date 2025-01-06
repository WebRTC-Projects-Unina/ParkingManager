import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './DashboardCall.css'
import  toast from 'react-hot-toast';
import DOMPurify from 'dompurify'; //serve per l'escape sugli input da tastiera


const SERVER_URL = 'http://localhost:8181'; // URL del server Node.js

const WebRTCApp = () => {
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  

  const socket = useRef(null);

  //Prendo i parametri dall'URL
  const params = new URLSearchParams(window.location.search);
  const isJoinedVal = params.get('isJoined') 
  const socketRoom = params.get('socketRoom');
  const usernameVal = params.get('username');

  const [isJoined, setIsJoined] = useState(isJoinedVal) || false;
  const [room, setRoom] = useState(socketRoom) || '';
  const [username, setUsername] = useState(usernameVal) || '';
 
  
  //funzione che fa scorrere la chat in base ai messaggi inviati
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  //per scrollare i messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
    // Inizializza il socket
    socket.current = io(SERVER_URL);

    //se qualcuno ha joinato la stanza, mando un messaggio
    if(isJoined){
      socket.current.emit('join', room)
    }

    //mi serve per gestire l'evento in cui devo rimuovere la chat dalla dashboard dell'admin
    const handleBeforeUnload = (room) => {
      if (socket.current) {
        socket.current.emit('disconnect', room);
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload); //aggiungo il listener
  
    // Listener per i messaggi della chat
    socket.current.on('chat message', (data) => {
      console.log("Heyla!")
      setMessages((prevMessages) => [...prevMessages, data]);
    }, []);

    // Cleanup
    return () => {
      socket.current.off('disconnect')
    };
  },[]);

  const joinRoom = () => {

    //check sull'input vuoto
    if(username === '' | room ===''){
      toast.error('Compila tutti i campi!')
      return
    }

    if(username.trim()==='admin'){
      toast.error('Username non valido!')
      return 
    }

    //comunico che utente ha creato la stanza
    socket.current.emit('create', room);


    //se la stanza è piena, mostro un pop-up
    socket.current.on('full', () =>{
      toast.error('Camera piena! Si prega di sceglierne un\'altra!')
    })

    //se la stanza è piena, mostro un pop-up
    socket.current.on('adminOff', () =>{
      toast.error('L\'Admin non è al momento presente. Riprovare più tardi.')
    })    


    //se la stanza è stata creata correttamente, la joino effettivamente
    socket.current.on('created', () => {
      setIsJoined(true);
    });

    //se qualcuno abbandona la chat,
    socket.current.on('someoneExited', ()=> {
        socket.current.disconnect(); // Chiude la connessione al server
    })

    //se la stanza già esisteva, allora partecipo a essa
    socket.current.on('joined', () => {
      setIsJoined(true);
    });
  };

  //questa la invoco quando clicco sul tasto "send" nella chat
  const sendMessage = () => {
    if (chatMessage && username) { //check sull'username e sul fatto che ci sia un messaggio da inviare
      const messageData = { room, message: chatMessage, sender: username }; //mi salvo tutto ciò che devo inviare nel messaggio, oltre al contenuto inviato
      socket.current.emit('chat message', messageData); //mando il messaggio
      setChatMessage(''); // Pulisce il campo del messaggio
    }
  };

  return (
    <div className='dashboardCall'>
      <div className='dashBoard'>
      <div className='containerCall'>
        <h1>Chat di Assistenza</h1>

        {!isJoined && (
          <div className='sectionCall'>
            <div>
              <input
                type="text"
                placeholder="Inserisci un Username"
                value={username}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    
                    joinRoom()
                  }
                }}
                onChange={(e) => setUsername(DOMPurify.sanitize(e.target.value))}
              />
              <input
                type="text"
                placeholder="Inserisci il nome di una stanza"
                value={room}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    joinRoom()
                  }
                }}
                onChange={(e) => setRoom(DOMPurify.sanitize(e.target.value))}
              />
              <button className="buttonCall" onClick={joinRoom}><strong>Entra</strong></button>
            </div>
          </div>
        )}
        {isJoined && (
          <div class='Chat'>
            <h3>Connesso alla stanza: {room}</h3>
            <div className='sectionCall'>
              <div style={{ marginTop: '20px' }}>
                
                <div className='messages' style={{ height: '200px', overflowY: 'scroll', padding: '10px', overflow: 'hidden'}}>
                  {messages.map((msg, index) => (
                    <p  className={msg.sender === username ? "myMessage" : "otherMessage"} key={index}>
                      <strong>{msg.sender}:</strong> {msg.message}
                    </p>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className='sectionMessage'>
                    <input 
                      className='textMessage'
                      type="text"
                      placeholder="Enter message"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(DOMPurify.sanitize(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          
                          sendMessage()
                        }
                      }}
                      style={{ width: '80%' }}
                    />
                    <button className='buttonChat' onClick={sendMessage} Enter style={{ width: '18%' }}>Send</button>
                  </div>
              </div>
            </div>
          </div>

        )}
      </div>
      </div>
    </div>
  );
};

export default WebRTCApp;