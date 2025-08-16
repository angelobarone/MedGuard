import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";
import {useEffect, useState} from "react";

export default function DataCollector() {
    const user = sessionStorage.getItem('username')
    const navigate = useNavigate();
    const pkData = JSON.parse(sessionStorage.getItem('privateKey'));
    const [isDownloading, setIsDownloading] = useState(false);
    const [needUpdate, setNeedUpdate] = useState(true);
    const [decryptedData, setDecryptedData] = useState([]);
    const [isDecrypting, setIsDecrypting] = useState(false);

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    const backHome = () => {
        navigate('/authorizedPage');
    }

    useEffect(() => {
        if(!needUpdate) return;
        const fetchData = async () => {
            try {
                setIsDownloading(true);
                const response = await fetch('http://127.0.0.1:5000/encDataSender', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ user: user })
                });
                const result = await response.json();

                if(result.success) {
                    setIsDecrypting(true);
                    setTimeout(async () => {
                        try{
                            const decrypted = await Promise.all(
                                result.data.map(async (row) => ({
                                    provincia: row.provincia,
                                    malattia: row.malattia,
                                    mese: row.mese,
                                    anno: row.anno,
                                    count_sum: await decryptPaillierValue(row.count_sum),
                                    eta_sum: await decryptPaillierValue(row.eta_sum),
                                    colesterolo_sum: await decryptPaillierValue(row.colesterolo_sum),
                                    pressione_sum: await decryptPaillierValue(row.pressione_sum),
                                    glucosio_sum: await decryptPaillierValue(row.glucosio_sum),
                                    fumatore_sum: await decryptPaillierValue(row.fumatore_sum),
                                    febbre_sum: await decryptPaillierValue(row.febbre_sum),
                                    tosse_sum: await decryptPaillierValue(row.tosse_sum),
                                    difficolta_sum: await decryptPaillierValue(row.difficolta_sum),
                                    stanchezza_sum: await decryptPaillierValue(row.stanchezza_sum),
                                    genere_sum: await decryptPaillierValue(row.genere_sum),
                                    peso_sum: await decryptPaillierValue(row.peso_sum),
                                    altezza_sum: await decryptPaillierValue(row.altezza_sum)
                                }))
                            );
                            setDecryptedData(decrypted);
                        } catch (error) {
                            console.error('Errore nella decrittazione:', error);
                        } finally {
                            setIsDecrypting(false);
                            setNeedUpdate(false);
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Errore:', error);
            } finally {
                setIsDownloading(false);
            }
        };
        fetchData();
    }, [needUpdate, user]);

    // Funzione di decrittazione
    const decryptPaillierValue = async (encryptedHex) => {
        try{
            // Converte da esadecimale a BigInt
            const hexString = encryptedHex.startsWith('0x')
                ? encryptedHex
                : `0x${encryptedHex}`;
            const encryptedBigInt = BigInt(hexString);
            const privateKey = reconstructionPrivateKey(pkData);
            if(privateKey === null) throw new Error(
                "Errore nella ricostruzione della chiave privata"
            )
            else{
                const decryptedBigInt = privateKey.decrypt(encryptedBigInt);
                return Number(decryptedBigInt);
            }
        } catch (error) {
            console.error(`Errore decrittazione valore ${encryptedHex}:`, error);
            throw new Error(`Formato non valido: ${encryptedHex.slice(0, 20)}...`);
        }
    };

    console.log(decryptedData);

    return(
        <div>
            <header className="header">
                <button className="options" onClick={backHome}>Home</button>
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{user} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className="container fade-in">
                <h1>Dashboard Analisi</h1>
                <div>
                    {(isDownloading || isDecrypting) && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p>Decrittazione in corso... Attendere prego</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function reconstructionPrivateKey(data) {

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

// Esponenziazione modulare
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

// Calcolo inverso moltiplicativo
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

