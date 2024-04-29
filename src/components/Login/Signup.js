import React, {useEffect, useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import styles from './Login.module.css'; // Import CSS module for styling
import Navigationbar from '../nav'
import {collection, getDocs, addDoc, doc, updateDoc,deleteDoc, setDoc  } from '@firebase/firestore'
import {db} from './firebase-config'

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers]=useState([])
    const [error, setError] = useState(null);
    const UsersCollectionRef = collection(db, "backenddata")

    useEffect(() => {
        const getUsersData = async () => {
          const data = await getDocs(UsersCollectionRef)
          setUsers(data.docs.map((elem) => ({ ...elem.data(), id: elem.id })))
        }
        getUsersData()
    }, [])
    const onSubmit = async (e) => {
        e.preventDefault();

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user.uid);
                //addDoc(UsersCollectionRef, { Email: email, username:username, Friends: []})
                 setDoc(doc(db, "backenddata", user.uid), {
                    email: email,
                    username:username,
                    Friends: []
                })
                
                    .then(() => {
                        console.log('User data added to Firestore');
                        navigate("/");
                    })
                    .catch((error) => {
                        console.error('Error adding user data to Firestore: ', error);
                    });

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
            navigate("/");

    }

    return (<div><Navigationbar />
        <main className={styles.container}>
            
            <section className={styles.section}>
                <div className={styles.formWrapper}>
                    <h1>Create a new account</h1>
                    {error && <p className={styles.error}>{error}</p>} {/* Display error message if there is one */}
                    <form className={styles.form}>
                    <div className={styles.formGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="username"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}  
                                required
                            />
                        </div>
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
                            Sign up                                
                        </button>
                    </form>
                    <p>Already have an account? <NavLink to="/login">Log in</NavLink></p>
                </div>
            </section>
        </main></div>
    );
}

export default Signup;
