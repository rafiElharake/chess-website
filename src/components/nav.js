import React from 'react';
import styles from './home/Home.module.css';
import knight from '../img/64.png';
import { NavLink, useNavigate } from 'react-router-dom';

const Nav=()=> {

  const navigate = useNavigate();

  return (
                <div className={styles.container}>
        <nav className={styles.navbar}>
        <a href="/">
<img
          src={knight}
          alt="Logo"
          className={styles.navbarlogo} 
        /></a>
        <a href="/analysis" className={styles.navbarItem}>
          Analysis
        </a>
          <a href="/play" className={styles.navbarItem}>
            Play
          </a>
          <a href="/login" className={styles.navbarItem}>
            Log in
          </a>
          <a href="/signup" className={styles.navbarItem}>
           Sign up
          </a>
        </nav>
    </div>
  )
}

export default Nav
