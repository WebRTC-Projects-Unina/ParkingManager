import React, { useState, useRef, useEffect } from 'react';
import './FeedChat.css'
import io from 'socket.io-client';
import  toast from 'react-hot-toast';
const SERVER_URL = 'http://192.168.197.212:8181'; // URL del server Node.js


const FeedChat = () => {

    const socket = useRef(null); //variabile per poter utilizzare le socket
    
    useEffect(()=>{
      socket.current = io(SERVER_URL); //mi collego al server Node.js (presente nella cartella server_videochat)

      socket.current.emit('admin login', 'logged') //quando l'admin si collega al server, manda un messaggio di login avvenuto con successo da parte dell'admin

      //questo evento si verifica quando un utente si collega al servizio di assistenza
      socket.current.on('someoneAdded', (data) => {
        console.log(data)

        //qui invece aggiungiamo la chat di assistenza alla dashboard dell'admin
        setRequests((prevRequests) => [...prevRequests, data]);
        toast("⚠ Utente in attesa di supporto!")
      });
    
      //questo evento, invece, si verifica quando un utente abbandona la chat con l'admin
      socket.current.on('someoneExited', (room)=>{
        console.log("Exited: ", room)
        
        //rimuove la chat relativa a quell'utente dalla dashboard dell'admin
        setRequests((prevRequests) =>
              prevRequests.filter((request) => request.room === room)
        );
    
      })

      // Cleanup: al momento dell'UnMount, ci si disconnette dalla socket
      return () => {
        socket.current.disconnect();
      };
    }, [])



    // Leggi l'array da sessionStorage o inizializza con un array vuoto
    const [requests, setRequests] = useState(() => {
        const storedRequests = sessionStorage.getItem('requests');
        return storedRequests ? JSON.parse(storedRequests) : [];
    });

  // Sincronizza lo stato di "requests" con sessionStorage
    useEffect(() => {
        sessionStorage.setItem('requests', JSON.stringify(requests));
    }, [requests]);

    //questa funzione viene invocata quando si clicca il bottone di gestione della chat di assistenza da parte dell'admin
    function handleButtonClick(socketId, socketRoom){

        //value mi serve per dire che l'admin sia già autenticato: assumiamo che l'admin non debba riloggarsi per accedere alla chat, ma utilizziamo un username univoco per tutti gli admin
        const value = true;
        const username = 'admin';
       
        //questo URL mi permette, quando viene cliccato il tasto "Gestisci", di creare una nuova finestra "pop-up" lato admin per interagire con l'utente
        const url = `/chat?isJoined=${encodeURIComponent(value)}&socketRoom=${encodeURIComponent(socketRoom)}&username=${encodeURIComponent(username)}`;


        // Imposta le opzioni della finestra (larghezza, altezza, etc.)
        const specs = 'width=800,height=800,scrollbars=yes,resizable=yes';

        // Usa window.open per aprire una nuova finestra
        window.open(url, '_blank', specs);

    }

    return(
        <div className="FeedChat">
        <div className="containerFeedChat">
            <h3>Richieste di Assistenza</h3>
            <div className="sectionFeedChat">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID Socket</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nome Stanza</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr className='tableElement' key={request.socketId}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{request.socketId}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{request.roomName}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                    <button
                                        className='buttonFeedChat'
                                        onClick={() => handleButtonClick(request.socketId, request.roomName)}
                                    >
                                        Gestisci
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );

}


export default FeedChat;