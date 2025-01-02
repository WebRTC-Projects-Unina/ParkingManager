import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import './InfoPage.css'


const InfoPage = () =>{
    const navigate = useNavigate() //variabile che mi permetterà di navigare verso un'altra pagina
    const [button_chat_clicked, setButtonChatClicked] = useState(false) //variabile di stato per permettere agli utenti di chattare con un admin

    //questo effetto si attiva ogni volta che il bottone della pagina di Info dell'utente viene cliccato
    useEffect(() => {
        if(!button_chat_clicked) return; //evito di trattare il valore di default
        navigate("/chat"); //quando un utente vuole chattare con un admin, viene portato alla pagina dedicata alla chat testuale
        setButtonChatClicked(false); //e si reinizializza lo stato del bottone
    },[button_chat_clicked]);

    return (
        <div className="InfoPage">

        <div className="Info">
            <div className="container">
                    <h1>Assistenza</h1>
                    <div className="sectionInfoPage">
                        <span className="pInfoPage"><strong>Chatta con noi!</strong></span>
                        <button className="buttonInfoPage" onClick={() => setButtonChatClicked(true)}>
                            <strong>Chat</strong>
                        </button>
                    </div>
            </div>
        </div>
        
    </div>
    );
}



export default InfoPage;