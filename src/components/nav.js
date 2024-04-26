import React from 'react';
import styles from './home/Home.module.css';
import knight from '../img/64.png';
import { NavLink, useNavigate } from 'react-router-dom';

const Nav=()=> {

  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate("/");
  };
  return (
                <div className={styles.container}>
        <nav className={styles.navbar}>
        <img
          src={knight}
          alt="Logo"
          className={styles.navbarlogo} // Apply any necessary styling to the image
          onClick={handleImageClick} // Attach onClick event handler directly to the image
        />
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
