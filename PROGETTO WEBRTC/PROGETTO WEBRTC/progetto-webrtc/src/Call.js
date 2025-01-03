import React, { useRef, useEffect } from 'react';
import JsSIP from 'jssip';

const WebRTCClient = () => {
  const ua = useRef(null); // UserAgent reference
  const session = useRef(null); // Call session reference

  useEffect(() => {
    const configuration = {
      uri: 'sip:1000@192.168.197.212', // SIP URI
      ws_servers: 'ws://192.168.197.212:5066', // WebSocket URL
      authorization_user: '1000', // Username
      password: '1000', // Password
      sockets: [new JsSIP.WebSocketInterface('ws://192.168.197.212:5066')], // WebSocket Interface
    };

    ua.current = new JsSIP.UA(configuration);

    // Register UserAgent events
    ua.current.on('registered', () => {
      console.log('Successfully registered with FreeSWITCH.');
    });

    ua.current.on('registrationFailed', (e) => {
      console.error('Registration failed:', e);
    });

    ua.current.on('newRTCSession', (data) => {
      const incomingSession = data.session;

      if (incomingSession.direction === 'incoming') {
        console.log('Incoming call detected.');
        session.current = incomingSession;

        session.current.answer({
          mediaConstraints: { audio: true, video: false },
        });

        session.current.on('accepted', () => {
          console.log('Call accepted.');
        });

        session.current.on('ended', () => {
          console.log('Call ended.');
        });

        session.current.on('failed', (e) => {
          console.error('Call failed:', e);
        });
      }
    });

    ua.current.start();

    return () => {
      if (ua.current) ua.current.stop();
    };
  }, []);

  const handleCall = () => {
    if (ua.current) {
      const target = 'sip:1001@192.168.197.212'; // SIP target URI

      const options = {
        mediaConstraints: { audio: true, video: false },
        rtcOfferConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false },
        pcConfig: {
          iceServers: [
            {
              urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
              ],
            },
          ],
        },
        sdpTransform: (sdp) => {
          // Modify SDP to ensure compatibility with FreeSWITCH
          return sdp
            .replace(/m=video.*?(\r\n|\n)/g, '') // Remove video support
            .replace(/a=rtpmap:\d+ opus\/48000\/2\r\n/g, '') // Remove Opus codec
            .replace(/a=rtpmap:(\d+) PCMU\/8000/g, 'a=rtpmap:$1 PCMU/8000') // Ensure G711u is prioritized
            .replace(/a=rtpmap:(\d+) PCMA\/8000/g, 'a=rtpmap:$1 PCMA/8000'); // Ensure G711a is supported
        },
        sessionTimersExpires: 120, // Ensure session timers are compatible with FreeSWITCH
      };

      session.current = ua.current.call(target, options);

      session.current.on('progress', () => {
        console.log('Call is ringing...');
      });

      session.current.on('confirmed', () => {
        console.log('Call established.');
      });

      session.current.on('ended', () => {
        console.log('Call ended.');
      });

      session.current.on('failed', (e) => {
        console.error('Call failed:', e);
      });
    } else {
      console.error('UserAgent not initialized.');
    }
  };

  return (
    <div>
      <button onClick={handleCall}>Start Call</button>
    </div>
  );
};

export default WebRTCClient;
