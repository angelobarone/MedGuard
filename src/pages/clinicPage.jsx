import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";
import React from 'react';

export default function ClinicPage() {
    const clinic = sessionStorage.getItem('username');
    const navigate = useNavigate();

    if(clinic === null){
        alert("Errore di login");
        navigate('/login');
    }

    const inserisciDati = () => {
        navigate('/dataCollector');  // sposta verso un’altra pagina definita in App.jsx
    };

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    PublicKeyFetcher()
        .then(result => {
            const pkData = {
                n: result.n.toString(),
                g: result.g.toString()
            };
            sessionStorage.setItem('publicKey', JSON.stringify(pkData));
            console.log('Public key saved to session storage:', pkData);
        }).catch(error => console.error(error));

    return (
        <div>
            <header className="header">
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className = "container fade-in">
                <img src="/medguard.png" alt="logo" height="300px" />
                <button className="button" onClick={inserisciDati}>Inserisci nuovi dati</button>
            </div>
        </div>
    );
}

async function PublicKeyFetcher() {
    try {
        const username = sessionStorage.getItem('username');
        if (!username) {
            throw new Error('Username non trovato nella session storage');
        }

        // Aggiungi timeout e controllo CORS
        const controller = new AbortController();
        const timeout = 8000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch('http://127.0.0.1:5001/getPublicKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username: username }),
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

        return reconstructionPublicKey(data);

    } catch (error) {
        console.error('Errore in PublicKeyFetcher:', error);

        // Gestione specifica per timeout o errori di connessione
        if (error.name === 'AbortError') {
            throw new Error('Timeout: il server non ha risposto entro 5 secondi');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Impossibile connettersi al server. Verifica che sia in esecuzione.');
        }

        throw error; // Rilancia per gestione esterna
    }
}

function reconstructionPublicKey(data){
    try {
        // Converti le stringhe in BigInt
        const n = BigInt(data.n);
        const g = BigInt(data.g);

        // Crea l'oggetto PublicKey
        return new paillier.PublicKey(n, g);
    } catch (error) {
        console.error('Errore nella ricostruzione:', error);
        throw new Error('Invalid public key format');
    }
}