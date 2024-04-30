import React from 'react';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login/Login';
import Signup from './components/Login/Signup';
import Play from './playy/Home';
import GameApp from './playy/GameApp';
import Home from './components/home/Home';
import Analysis from './components/Analysis/Analysis';
import { DndProvider } from 'react-dnd-multi-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {HTML5toTouch} from 'rdndmb-html5-to-touch'
import ReactDOM from 'react-dom';


  ReactDOM.createRoot(document.getElementById("root")).render(
   <div> 
     <Router>
        <Routes> 
        <Route path="/" element={<Home/>} />
        <Route path="/analysis/:id" element={<Analysis />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/play" element={<Play/>} />
        <Route path="/game/:id" element={<DndProvider options={HTML5toTouch}> <GameApp/></DndProvider>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        </Routes>
    </Router>
    
    </div>
  );

reportWebVitals();