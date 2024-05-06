import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import styles from './Login.module.css'; // Import CSS module for styling
import Navigationbar from '../nav'

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();

        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                window.location.href = "/";            })
            .catch((error) => {
                setError(error.message); // Set error message for display
            });
    }

    return (
        <div>
            <Navigationbar/>
        <main className={styles.container}>
            <section className={styles.section}>
                <div className={styles.formWrapper}>
                    <h1>Log in to your account</h1>
                    {error && <p className={styles.error}>{error}</p>} {/* Display error message if there is one */}
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}  
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                            />
                        </div>
                        <button
                            type="submit" 
                            onClick={onSubmit}                        
                            className={styles.custombutton}
                        >  
                            Log in                                
                        </button>
                    </form>
                    <p>Don't have an account? <NavLink to="/signup">Sign up</NavLink></p>
                </div>
            </section>
        </main>        </div>

    );
}

export default Login;
