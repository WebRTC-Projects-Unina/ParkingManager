import React, { useRef, useEffect } from 'react';
import JsSIP from 'jssip';

const WebRTCClient = () => {
  const ua = useRef(null); // Riferimento per il UserAgent
  const session = useRef(null); // Riferimento per la sessione della chiamata

  useEffect(() => {
    // Configurazione del UserAgent di JsSIP
    const configuration = {
      uri: 'sip:1002@192.168.1.20', // Modifica con il tuo username e dominio SIP
      ws_servers: 'ws://192.168.1.20:5066', // URL del WebSocket SIP
      authorization_user: '1002', // Nome utente configurato
      password: '1002', // Password configurata
      sockets: [new JsSIP.WebSocketInterface('ws://192.168.1.20:5066')], // Socket WebSocket
    };

    // Creazione del UserAgent di JsSIP
    ua.current = new JsSIP.UA(configuration);

    // Eventi del UserAgent
    ua.current.on('registered', () => {
      console.log('Registrazione avvenuta con successo.');
    });

    ua.current.on('registrationFailed', (e) => {
      console.error('Errore nella registrazione:', e);
    });

    ua.current.on('sipEvent', (event)=>{
        console.log("Messaggio SIP: ", event)

        
    })

    ua.current.on('newRTCSession', (data) => {
      const incomingSession = data.session;

      if (incomingSession.direction === 'incoming') {
        console.log('Chiamata in arrivo...');
        session.current = incomingSession;

        // Rispondi automaticamente alla chiamata
        session.current.answer({
          mediaConstraints: { audio: true, video: false },
        });

        session.current.on('accepted', () => {
          console.log('Chiamata accettata.');
        });

        session.current.on('ended', () => {
          console.log('Chiamata terminata.');
        });

        session.current.on('failed', (e) => {
          console.error('Chiamata fallita:', e);
        });
      }
    });

    // Avvio del UserAgent
    ua.current.start();

    // Cleanup al momento della disconnessione
    return () => {
      if (ua.current) {
        ua.current.stop();
      }
    };
  }, []);

  // Funzione per avviare una chiamata in uscita
  const handleCall = () => {
    if (ua.current) {
      const target = 'sip:1001@192.168.1.20'; // URI dell'utente da chiamare

      // Opzioni della chiamata
    const options = {
        mediaConstraints: { audio: true, video: false }, // Solo audio
        rtcOfferConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false, iceRestart: false },
        sessionTimersExpires: 120, // Intervallo di sessione minimo richiesto
        sdp: { // Modifica SDP per compatibilità
            offer: (sdp) => {
              // Modifica SDP per rimuovere codec non compatibili
              return sdp
                .replace(/m=video.*?(\r\n|\n)/g, '') // Rimuovi il supporto video
                .replace(/a=rtpmap:(\d+) opus.*/g, ''); // Esempio: rimuovi il codec Opus
            },
          },
        pcConfig: {
            'iceServers': [
                {
                    'urls': [ 'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:stun2.l.google.com:19302']
                }
             ]
         }
      };


      

      // Effettua la chiamata
      session.current = ua.current.call(target, options);

      // Gestione degli eventi della sessione di chiamata
      session.current.on('accepted', () => {
        console.log('Chiamata accettata dal destinatario.');
        setInterval(() => {
            if (session.current && !session.current.isEstablished()) {
              console.log('Sessione zombie rilevata, terminazione forzata.');
              session.current.terminate();
            }
          }, 5000);
      });

      session.current.on('ended', () => {
        console.log('Chiamata terminata.');
      });

      session.current.on('failed', (e) => {
        console.error('Chiamata fallita:', e);
      });
    } else {
      console.error('UserAgent non inizializzato.');
    }
  };

  return (
    <div>
      <button onClick={handleCall}>Chiama</button>
    </div>
  );
};

export default WebRTCClient;
