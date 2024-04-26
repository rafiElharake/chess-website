import React from 'react';

import styles from './Switch.module.css';

const Switch = ({ checked, setCheck }) => {
    return (
        <label className={styles.switch}>
            <input
                defaultChecked={checked}
                onChange={() => setCheck(!checked)}
                type="checkbox"
            />
            <span className={styles.slider}></span>
        </label>
    );
}

export default Switch;