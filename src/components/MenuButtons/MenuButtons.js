import React from "react";

import styles from './MenuButtons.module.css';

import Switch from '../Switch/Switch';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faCog, faSync } from "@fortawesome/free-solid-svg-icons";

const MenuButtons = ({showPrevMove,showNextMove, setLoadActive, resetBoard, flipBoard, setSettingsActive, setCurrAnalysisActive, evaluation, setEngineStarted, engineStarted, moveNum}) => {
    return (
        <div>
        <nav className={styles.menuNav}>
            
            {engineStarted && 
                <div className={styles.evaluationNum}>
                    {evaluation[0] === 'M' ? (evaluation[1] === '-' ? evaluation.slice(0, 1) + evaluation.slice(2) : evaluation) : parseFloat(evaluation) / 100}
                </div>
            }
            <Switch
                checked={engineStarted}
                setCheck={setEngineStarted}
            /> 
            <button 
                className={styles.navBtn} 
                style={{ borderRight: '5px', marginLeft: '5px' }}
                onClick={() => setLoadActive(true)}
            >
                    Load Game
            </button>

            <button onClick={resetBoard} style={{ borderRight: '5px', marginLeft: '5px' }} className={styles.navBtn}>Reset Board</button>

            <button onClick={() => setSettingsActive(true)} className={styles.navBtnIcon} style={{marginLeft: '15px'}}>
                <FontAwesomeIcon icon={faCog} />
            </button>

            <button onClick={flipBoard} className={styles.navBtnIcon}>
                <FontAwesomeIcon icon={faSync} />
            </button>

            <button onClick={() => setCurrAnalysisActive(true)} className={styles.navBtnIcon}>
                <FontAwesomeIcon icon={faSave} />
            </button>




           
        </nav>
         <nav className={styles.menuNav}>
         <button 
             className={styles.navBtn} 
             style={{ borderRight: '5px', marginLeft: '40px' }}
             onClick={() => showPrevMove()}
         >
                prev
         </button>
         <button 
             className={styles.navBtn} 
             style={{ borderRight: '5px', marginLeft: '5px' }}
             onClick={() => showNextMove()}
         >
                next
         </button>
        
     </nav>
      </div>
    );
};

export default MenuButtons;