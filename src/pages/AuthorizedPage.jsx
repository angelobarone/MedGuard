import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";


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
        .then(result => {
            const pkData = {
                n: result.n.toString(),
                g: result.g.toString(),
                p: result.p.toString(),
                q: result.q.toString()
            };
            sessionStorage.setItem('privateKey', JSON.stringify(pkData));
            })
        .catch(error => console.error("Errore finale:", error));

    return (
        <div>
            <header className="header">
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{user} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
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
        if (!username) {
            throw new Error('Username non trovato nella session storage');
        }

        // Aggiungi timeout e controllo CORS
        const controller = new AbortController();
        const timeout = 8000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch('http://127.0.0.1:5001/getPrivateKey', {
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



