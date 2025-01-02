import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import './InfoPage.css'


const InfoPage = () =>{
    const navigate = useNavigate()
    const [button_chat_clicked, setButtonChatClicked] = useState(false)

    useEffect(() => {
        if(!button_chat_clicked) return;
        navigate("/chat");
        setButtonChatClicked(false);
    },[button_chat_clicked]);

    return (
        <div className="InfoPage">

        <div className="Info">
            <div className="container">
                    <h1>Assistenza</h1>
                    <div className="sectionInfoPageChat">
                        <span className="pInfoPage"><strong>Chatta con noi!</strong></span>
                        <button className="buttonInfoPage" onClick={() => setButtonChatClicked(true)}>
                            <strong>Chat!</strong>
                        </button>
                       
                    </div>

                    <div className="sectionInfoPageCall">
                        <span className="pInfoPage"><strong>Oppure chiamaci utilizzando Zoiper!</strong></span>
                            <button className="buttonInfoPage" onClick={() => setButtonChatClicked(true)}>
                                <strong>Chiamaci!</strong>
                        </button>
                    </div>
            </div>
        </div>
        
    </div>
    );
}



export default InfoPage;