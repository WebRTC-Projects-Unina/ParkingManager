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
        <Camera source={'http://192.168.197.154'} nameCamera={'Camera1'} nameDisplay={"Camera 1"}/>
        <Camera source={'http://192.168.197.109'} nameCamera={'Camera2'} nameDisplay={"Camera 2"}/>
        <Header/>
        <FeedChat/>
        <Toaster position="bottom-left"/>
        </>
      );
};

export default DashBoard;
