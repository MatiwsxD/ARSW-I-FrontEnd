import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { Login } from "./pages/Login";
import {Registerr} from "./pages/Registerr";
import { Room } from "./pages/Room";
import { Game } from "./pages/Game";
export let App = function(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>} />
                <Route path="/" element={<Registerr/>}/>
                <Route path="/room" element={<Room/>}/>
                <Route path="/game" element={<Game/>}/>
            </Routes>
        </BrowserRouter>

    );
}