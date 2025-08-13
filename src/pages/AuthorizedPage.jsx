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
        .then(result => sessionStorage.setItem('privateKey', JSON.stringify(result)))
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

        return reconstructionPrivateKey(data);

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

function reconstructionPrivateKey(data){
    const publicKey = new paillier.PublicKey(BigInt(data.n), BigInt(data.g));

    const p = BigInt(data.p);
    const q = BigInt(data.q);
    // const n = p * q;
    const lambda = (p - 1n) * (q - 1n);
    const mu = calculateMu(publicKey, lambda, p, q);

    return new paillier.PrivateKey(lambda, mu, publicKey, p, q);
}

function calculateMu(publicKey, lambda, p, q) {
    const n = p * q;
    const nSquared = n * n;
    const g = publicKey.g || n + 1n;

    // Calcola g^lambda mod n² in modo efficiente
    const gLambda = modPow(g, lambda, nSquared);

    // Calcola L = (gLambda - 1n) / n
    const L = (gLambda - 1n) / n;

    // Calcola l'inverso moltiplicativo
    return modInverse(L, n);
}

// Esponenziazione modulare efficiente (evita BigInt troppo grandi)
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}

// Calcolo inverso moltiplicativo (senza creare BigInt eccessivi)
function modInverse(a, n) {
    let t = 0n, newT = 1n;
    let r = n, newR = a;

    while (newR !== 0n) {
        const quotient = r / newR;
        [t, newT] = [newT, t - quotient * newT];
        [r, newR] = [newR, r - quotient * newR];
    }

    if (r > 1n) throw new Error('Numero non invertibile');
    if (t < 0n) t += n;

    return t;
}

