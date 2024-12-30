import React, { useState, useRef, useEffect } from 'react';
import './FeedChat.css'
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
const SERVER_URL = 'http://192.168.197.212:8181'; // URL del server Node.js


const FeedChat = () => {

    const socket = useRef(null);
    
    useEffect(()=>{
      socket.current = io(SERVER_URL);

      socket.current.emit('admin login', 'logged')

       
      socket.current.on('someoneAdded', (data) => {
        console.log(data)


        setRequests((prevRequests) => [...prevRequests, data]);

      });
    
      socket.current.on('someoneExited', (room)=>{
        console.log("Exited: ", room)
        
        setRequests((prevRequests) =>
              prevRequests.filter((request) => request.room === room)
        );
    
      })

      // Cleanup
      return () => {
        socket.current.disconnect();
      };
    }, [])



    // Leggi l'array da sessionStorage o inizializza con un array vuoto
    const [requests, setRequests] = useState(() => {
        const storedRequests = sessionStorage.getItem('requests');
        return storedRequests ? JSON.parse(storedRequests) : [];
    });

  // Sincronizza lo stato requests con sessionStorage
    useEffect(() => {
        sessionStorage.setItem('requests', JSON.stringify(requests));
    }, [requests]);


    function handleButtonClick(socketId, socketRoom){

    
        const value = true;
        const username = 'admin';
       
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