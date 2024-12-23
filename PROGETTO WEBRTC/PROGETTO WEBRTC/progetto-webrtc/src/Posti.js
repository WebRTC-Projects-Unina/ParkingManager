import logo from "./logo.svg";
import './Posti.css';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function Posti() {

    // Stati per gestire dati e interfaccia
    const [postiCount, setPostiCount] = useState('Attendendo...'); // Posti disponibili
    const [postiAdmin, setAdmin] = useState(''); // Posti da inviare
    const [InpPostiAdmin, setInpPostiAdmin] = useState(''); // Input utente

    // Effetto per inviare dati al server quando l'admin aggiorna i posti
    useEffect(() => {
        if (!postiAdmin) return; // Evita richieste non necessarie
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5000/change_places', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 201) {
                // Mostra messaggio di conferma e resetta input
                setInpPostiAdmin(""); // Reset dell'input
                toast.success("Posti cambiati correttamente!")
                
            } else {
                toast.error("Posti non cambiati!")

            }
        };

        //Se abbiamo un'errore verra posto la notifica di errore
        xhr.onerror = function (){
            setInpPostiAdmin(""); // Reset dell'input
            toast.error("Posti non cambiati!")
        }

        xhr.send(JSON.stringify({ posti: postiAdmin }));
        setAdmin(''); // Reset dello stato di amministrazione
    }, [postiAdmin]);

    // Effetto per aggiornare i posti disponibili periodicamente
    useEffect(() => {
        const intervalId = setInterval(() => inviaRichiesta(), 3000);
        return () => clearInterval(intervalId); // Pulizia intervallo
    }, []);

    // Funzione per ottenere i posti disponibili
    const inviaRichiesta = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:5000/places', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                setPostiCount(xhr.responseText); // Aggiorna i posti
            }
        };
        xhr.send();
    };

    

    return (
        <div className="Posti">
            <div className="container">
                <div className="section">
                    <p className="text" id="pos">
                        Posti disponibili adesso: <strong id="postiCount">{postiCount}</strong>
                    </p>
                    <input
                        type="text"
                        value={InpPostiAdmin} // Collega il valore al tuo stato
                        onChange={(e) => setInpPostiAdmin(e.target.value) } // Aggiorna stato al cambiare input
                        placeholder="Inserisci il numero di posti"

                    />
                    <br /><br />
                    <button onClick={() => setAdmin(InpPostiAdmin)}>Invia</button>
                    
                </div>
            </div>
        </div>
    );
}

export default Posti;
