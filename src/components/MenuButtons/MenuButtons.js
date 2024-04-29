import React from "react";

import styles from './MenuButtons.module.css';

import Switch from '../Switch/Switch';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faCog, faSync } from "@fortawesome/free-solid-svg-icons";

const MenuButtons = ({showPrevMove,showNextMove, setLoadActive, resetBoard, flipBoard, setSettingsActive, setCurrAnalysisActive, evaluation, setEngineStarted, engineStarted, moveNum}) => {
    return (
        <div>
        <div className={styles.menuNav}>
            
            {engineStarted && 
                <div className={styles.evaluationNum}>
                    {evaluation[0] === 'M' ? (evaluation[1] === '-' ? evaluation.slice(0, 1) + evaluation.slice(2) : evaluation) : parseFloat(evaluation) / 100}
                </div>
            }
           
         <button 
             className={styles.custombutton}
             onClick={() => showPrevMove()}> prev
         </button>
         <button 
             className={styles.custombutton}
             onClick={() => showNextMove()}
         >
                next
         </button>
            <button 
                className={styles.custombutton}
                onClick={() => setLoadActive(true)}
            >
                    Load Game
            </button>

            <button onClick={resetBoard} className={styles.custombutton}>Reset Board</button>

            <button onClick={() => setSettingsActive(true)} className={styles.navBtnIcon} style={{marginLeft: '15px'}}>
                <FontAwesomeIcon icon={faCog} />
            </button>

            <button onClick={flipBoard} className={styles.navBtnIcon}>
                <FontAwesomeIcon icon={faSync} />
            </button>

            <button onClick={() => setCurrAnalysisActive(true)} className={styles.navBtnIcon}>
                <FontAwesomeIcon icon={faSave} />
            </button>
        
        
     </div>
      </div>
    );
};

export default MenuButtons;