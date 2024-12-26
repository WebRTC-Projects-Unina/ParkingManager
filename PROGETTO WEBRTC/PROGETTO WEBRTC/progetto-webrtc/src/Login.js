import { use, useEffect, useState } from "react";
import './Login.css';
import toast from 'react-hot-toast';

function Login(){

    const [button_clicked, setButtonClicked] = useState(false);
    const [InpPassword, setInpPassword] = useState('');
    const [InpUsername, setInpUsername] = useState('');

    //RIFARE CON DATABASE

    const UsernameDB = ["antonio" , "francesco", "cazzo"];
    const PasswordDB = ["boccared", "er_brunello", "pipo"];

    useEffect(() => {
        if(!button_clicked) return;
        let ok_username, ok_password = false;
        for(let i=0;i<UsernameDB.length;i++){
            if(InpUsername === UsernameDB[i]){
                ok_username=true;
            }
        }

        for(let i=0;i<PasswordDB.length;i++){
            if(InpPassword === PasswordDB[i]){
                ok_password=true;
            }
        }

        if(ok_password && ok_username){
            console.log("ADMIN LOGGATO!");
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:5000/admin',true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 201) {
                    toast.success("Accesso effettuato correttamente!")
                    
                } else {
                    toast.error("Accesso non effettuato!")
    
                }
            };

        //Se abbiamo un'errore verra posto la notifica di errore
            xhr.onerror = function (){
                toast.error("Accesso non effettuato!");
            }
            xhr.send(JSON.stringify({ username: InpUsername, pass: InpPassword }));
            console.log(JSON.stringify({ username: InpUsername, pass: InpPassword }));
        }else{
            toast.error("Accesso non effettuato!");
        }
        setButtonClicked(false);
    },[button_clicked]);

    return(
    <div className="LoginPage">
        <div className="Login">
            <div className="container">
                <p><strong>LOGIN</strong></p>
                <div className="section">
                    <p>
                        <input type="text" onChange={(e) => setInpUsername(e.target.value)} placeholder="Inserisci Username"/>
                    </p>
                    <p>
                        <input type="text" onChange={(e) => setInpPassword(e.target.value)} placeholder="Inserisci Password"/>
                    </p>
                    <p>
                        <button onClick={() => setButtonClicked(true)}><strong>Accedi</strong></button>
                    </p>
                </div>
            </div>
        </div>
        <footer>
            <p><strong> Sei un utente? Contattaci per qualsiasi problema! </strong><p></p><button /*ci vuole la logica relativa al VoIP*/><strong>Contatta l'assistenza</strong></button></p>
        </footer>
    </div>
    );
};

export default Login;