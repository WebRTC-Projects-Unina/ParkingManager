import { useState } from "react";
import "./Camera.css"


const Camera = ({source, nameCamera}) =>{


    const [hasError, setHasError] = useState(false);

    function handleError (){
        setHasError(true);
    }


    return (
        <div className={nameCamera}>
            <div className="containerCamera">
                <p><strong>{nameCamera}</strong></p>
                <div className="sectionCamera">
                    
                {hasError ? (
                        // Se c'è un errore nel caricamento dell'immagine, mostriamo il messaggio o un'immagine di fallback
                        <img className="errorImg" src="./error.png" alt="Error LOad Camera"/>
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

