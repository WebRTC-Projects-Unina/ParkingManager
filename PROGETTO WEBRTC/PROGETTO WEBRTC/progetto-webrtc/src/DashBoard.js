/*Questa è la dashboard di cui usufruirà l'admin e include:
Posti.js: mostra il numero di posti attualmente disponibili e permette all'admin di modificare tale numero
Gates.js: mostra 4 bottoni (2 ingressi e 2 uscite) per permettere all'admin di apri (o chiudere) una specifica entrata/uscita
Camera.js: riporta le due camere di sorveglianza del parcheggio
Header.js: utilizzato per mostrare il nome della Dashboard
Toaster:js: per mostrare i pop-up in seguito ad azioni compiute dall'admin
FeedChat.js: mostra all'admin le varie chiamate attualmente attive e in arrivo dagli utenti
*/
import React, { useRef, useEffect } from "react";
import Posti from "./Posti";
import Gates from "./Gates";
import Header from "./Header";
import Camera from "./Camera";
import { Toaster } from "react-hot-toast";
import FeedChat from "./FeedChat";


const DashBoard = () => {

    

    return (
        <>
        <Posti/>
        <Gates/>
        <Camera source={'http://192.168.122.154'} nameCamera={'Camera1'} nameDisplay={"Camera 1"}/> 
        <Camera source={'http://192.168.122.109'} nameCamera={'Camera2'} nameDisplay={"Camera 2"}/>
        <Header/>
        <FeedChat/>
        <Toaster position="bottom-left"/>
        </>
      );
};

export default DashBoard;
