import { useEffect, useState } from "react";
import "./Camera.css"


const Camera = ({source, nameCamera, nameDisplay}) =>{

    //variabile di stato per il caso in cui l'immagine non dovesse caricarsi correttamente
    const [hasError, setHasError] = useState(false);

    //funzione correlata alla variabile di stato che setta quest'ultima allo stato "true" se c'è un errore
    function handleError (){
        setHasError(true);
    }

    return (
        <div className={nameCamera}>
            <div className="containerCamera">
                <p><strong>{nameDisplay}</strong></p>
                <div className="sectionCamera">
                    
                {hasError ? (
                        // Se c'è un errore nel caricamento dell'immagine, mostriamo il messaggio o un'immagine di fallback
                        <div>
                            <img className="errorImg" src="./error.png" alt="Error LOad Camera"/>
                            <p><strong>Errore nel caricamento del flusso MJPEG.</strong></p>
                        </div>
                    ) : (
                        <img 
                            className="cameraImg" 
                            width="640" 
                            height="510" 
                            src={source} 
                            alt={nameCamera} 
                            onError={handleError} // Gestiamo l'errore di caricamento
                        />
                        
                    )}
                </div>
            </div>
        </div>
    );
}


export default Camera;

