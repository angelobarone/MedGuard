import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";
import React from 'react';

const BACKEND_API = import.meta.env.VITE_API_URL_BACKEND;
const TRUSTEDAUTHORITY_API = import.meta.env.VITE_API_URL_TRUSTEDAUTHORITY;

async function deriveKeyFromToken(token) {
    const enc = new TextEncoder().encode(token);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return crypto.subtle.importKey(
        "raw",
        hash,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

async function decryptWithToken(encData, token) {
    const key = await deriveKeyFromToken(token);

    const nonce = Uint8Array.from(atob(encData.nonce), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encData.ciphertext), c => c.charCodeAt(0));
    const tag = Uint8Array.from(atob(encData.tag), c => c.charCodeAt(0));

    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext);
    combined.set(tag, ciphertext.length);

    const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce },
        key,
        combined
    );

    return JSON.parse(new TextDecoder().decode(plaintext));
}



export default function AuthorizedPage() {
    const user = sessionStorage.getItem('username')
    const navigate = useNavigate();

    if(user === null){
        alert("Errore di login");
        navigate('/login');
    }

    const consultaDati = () => {
        navigate('/dataSeeker');
    };

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    PrivateKeyFetcher()
        .then(async result => {
            const token = sessionStorage.getItem('token');
            console.log('Token recuperato:', token);
            console.log('Risposta dal server:', result);
            const pkData = await decryptWithToken(result, token);
            console.log('Private key decrypted:', pkData);
            sessionStorage.setItem('privateKey', JSON.stringify(pkData));
            })
        .catch(error => console.error("Errore finale:", error));

    return (
        <div>
            <header className="header">
                <div className="options-container">
                    <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                    <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{user} 🚧</button>
                    <span> | </span>
                    <button className="options">Assistenza clienti 🚧</button>
                    <span> | </span>
                    <button className="options" onClick={logout}>Logout</button>
                </div>
            </header>
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <button className="button" onClick={consultaDati}>Consulta i dati</button>
            </div>
        </div>
    );
}

async function PrivateKeyFetcher() {
    try {
        const username = sessionStorage.getItem('username');
        const token = sessionStorage.getItem('token');
        if (!username) {
            throw new Error('Username non trovato nella session storage');
        }

        // Aggiungi timeout e controllo CORS
        const controller = new AbortController();
        const timeout = 8000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${TRUSTEDAUTHORITY_API}/getPrivateKey`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username: username, token: token}),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Errore dal server:', errorText);
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Validazione della risposta
        if (!data || typeof data !== 'object') {
            throw new Error('Formato dati non valido');
        }

        return data;

    } catch (error) {
        console.error('Errore in PrivateKeyFetcher:', error);

        // Gestione specifica per timeout o errori di connessione
        if (error.name === 'AbortError') {
            throw new Error('Timeout: il server non ha risposto entro 5 secondi');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Impossibile connettersi al server. Verifica che sia in esecuzione.');
        }

        throw error; // Rilancia per gestione esterna
    }
}



