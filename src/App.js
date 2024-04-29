import React from "react";
import Home from './components/home/Home';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Analysis from './components/Analysis/Analysis';
import Play from './playy/Home';
import GameApp from './playy/GameApp';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Login from './components/Login/Login';
import Signup from './components/Login/Signup';
import './playy/app.css'

const App = () => {

    return (
        <Router>
        <Routes> 
        <Route path="/" element={<Home/>} />
        <Route path="/analysis/:id" element={<Analysis/>} />
        <Route path="/analysis" element={<Analysis/>} />
        <Route path="/play" element={<Play/>} />
        <Route path="/game/:id" element={<DndProvider backend={HTML5Backend}> <GameApp/></DndProvider>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        </Routes>
    </Router>
    );
};

export default App;

