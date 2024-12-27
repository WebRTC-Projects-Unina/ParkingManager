import React from "react";
import Posti from "./Posti";
import Gates from "./Gates";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

const DashBoard = () => {
    return (
        <>
        <Posti/>
        <Gates/>
        <Header/>
        <Toaster position="bottom-left"/>
        </>
      );
};

export default DashBoard;
