import { use, useEffect, useState } from "react";
import './Login.css';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';

const Login= ({onLogin}) =>{

    const [ricordami, setRicordami] = useState(false);
    const [button_clicked, setButtonClicked] = useState(false);
    const [button_call_clicked, setButtonCallClicked] = useState(false);
    const [InpPassword, setInpPassword] = useState('');
    const [InpUsername, setInpUsername] = useState('');
    const navigate = useNavigate(); //ci permette di navigare verso la dashboard, una volta autenticati
    
    //controlla sempre se le credenziali inserite corrispondono a quelle salvate nella sessione
    useEffect(() => {
        if(sessionStorage.getItem("usernameSessione")!==null && sessionStorage.getItem("passwordSessione")!==null && sessionStorage.getItem("ricordami")!=='false'){
            onLogin(true);
            navigate("/dashboard");
        }
    }, []);

    useEffect(() => {
        
        if(!button_clicked) return;

        if(InpUsername==='' | InpUsername===''){
            toast.error('Compila tutti i campi!')
            setButtonClicked(false)
            return
        }

        sessionStorage.setItem("usernameSessione",InpUsername);
        sessionStorage.setItem("passwordSessione",InpPassword);

        if(ricordami===true){ //se ho spuntato la casella "Ricordami", mi salvo le credenziali per questa sessione
            sessionStorage.setItem("ricordami", true);
        } else {
            sessionStorage.setItem("ricordami", false);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8080/admin',true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log("OK");
                toast.success("Accesso consentito");
                onLogin(true); //se va tutto bene, setto l'onLogin a true e passo alla dashboard
                navigate("/dashboard");
            }else{
                toast.error("Errore nel login");
            }
        };

    //Se abbiamo un'errore verra posto la notifica di errore
        xhr.onerror = function (){
            toast.error("Accesso non effettuato!");
        }

        const requestBody={
            username: InpUsername,
            password: InpPassword
        };

        xhr.send(JSON.stringify(requestBody));
        console.log(JSON.stringify({ username: InpUsername, password: InpPassword }));
        
        setButtonClicked(false);
    },[button_clicked]);

    useEffect(() => {
        if(!button_call_clicked) return;
        navigate("/call");
        setButtonCallClicked(false);
    },[button_call_clicked]);

    return(
    <div className="LoginPage">
        <div className="Login">
            <div className="container">
                <p><strong>LOGIN</strong></p>
                <div className="section">
                    <p>
                        <input type="text" onChange={(e) => setInpUsername(DOMPurify.sanitize(e.target.value))} placeholder="Inserisci Username"/>
                    </p>
                    <p>
                        <input type="text" onChange={(e) => setInpPassword(DOMPurify.sanitize(e.target.value))} placeholder="Inserisci Password"/>
                    </p>
                    <p>
                        <button onClick={() => setButtonClicked(true)}><strong>Accedi</strong></button>
                    </p>
                    <p>
                        <input type="checkbox" name="ricordami" onChange={(e) => setRicordami(e.target.checked)}/> Ricordami
                    </p>
                </div>
            </div>
        </div>
        <footer>
            <p><strong> Sei un utente? Contattaci per qualsiasi problema! </strong><p></p><button onClick={() => setButtonCallClicked(true)}><strong>Contatta l'assistenza</strong></button></p>
        </footer>
    </div>
    );
};

export default Login;