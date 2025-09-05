import '../stylesheet/App2.css'
import {useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";
import React, {useEffect, useMemo, useState} from "react";

const BACKEND_API = import.meta.env.VITE_API_URL_BACKEND;
const TRUSTEDAUTHORITY_API = import.meta.env.VITE_API_URL_TRUSTEDAUTHORITY;

export default function DataSeeker() {
    const user = sessionStorage.getItem('username');
    const navigate = useNavigate();
    const pkData = JSON.parse(sessionStorage.getItem('privateKey'));
    const privateKey = reconstructionPrivateKey(pkData);
    const [isDownloading, setIsDownloading] = useState(false);
    const [decryptedData, setDecryptedData] = useState([]);
    const [isDecrypting, setIsDecrypting] = useState(false);


    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    const backHome = () => {
        navigate('/authorizedPage');
    }

    const updatePage = () => {
        sessionStorage.removeItem('decryptedData');
        navigate(0);
    }

    const northPage = () => {
        navigate('/localePage', {state: {data: nordData, locale: "Nord"}});
    }
    const centroPage = () => {
        navigate('/localePage', {state: {data: centroData, locale: "Centro"}});
    }
    const southPage = () => {
        navigate('/localePage', {state: {data: sudData, locale: "Sud"}});
    }
    const diseasePage = (disease) => {
        navigate('/diseasePage', {state: {data: diseaseData(disease), disease: disease}})
    }
    const publishData = async () => {
        const payload = {}
        payload.n_pazienti = generalStats.pazienti_totali;
        payload.eta_media = generalStats.average_eta;
        payload.colesterolo_media = generalStats.average_colesterolo;
        payload.glicemia_media = generalStats.average_glucosio;
        payload.percentuale_fumatori = generalStats.perc_fumatore;
        payload.percentuale_uomini = generalStats.perc_uomini;
        payload.percentuale_donne = generalStats.perc_donne;
        payload.prevalenza_diabete = generalStats.perc_diabete;
        payload.n_nord = nordData.pazienti_totali;
        payload.eta_media_nord = nordData.average_eta;
        payload.colesterolo_media_nord = nordData.average_colesterolo;
        payload.glicemia_media_nord = nordData.average_glucosio;
        payload.percentuale_fumatori_nord = nordData.perc_fumatore;
        payload.percentuale_uomini_nord = nordData.perc_uomini;
        payload.percentuale_donne_nord = nordData.perc_donne;
        payload.prevalenza_diabete_nord = nordData.perc_diabete;
        payload.n_sud = sudData.pazienti_totali;
        payload.eta_media_sud = sudData.average_eta;
        payload.colesterolo_media_sud = sudData.average_colesterolo;
        payload.glicemia_media_sud = sudData.average_glucosio;
        payload.percentuale_fumatori_sud = sudData.perc_fumatore;
        payload.percentuale_uomini_sud = sudData.perc_uomini;
        payload.percentuale_donne_sud = sudData.perc_donne;
        payload.prevalenza_diabete_sud = sudData.perc_diabete;
        payload.n_centro = centroData.pazienti_totali;
        payload.eta_media_centro = centroData.average_eta;
        payload.colesterolo_media_centro = centroData.average_colesterolo;
        payload.glicemia_media_centro = centroData.average_glucosio;
        payload.percentuale_fumatori_centro = centroData.perc_fumatore;
        payload.percentuale_uomini_centro = centroData.perc_uomini;
        payload.percentuale_donne_centro = centroData.perc_donne;
        payload.prevalenza_diabete_centro = centroData.perc_diabete;

        console.log(payload);
        const response = await fetch(`${BACKEND_API}/PublishData`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({payload: payload})
        });
        const result = await response.json();
        if(result.success) {
            alert('Dati pubblicati con successo');
        } else {
            alert('Errore durante la pubblicazione dei dati');
        }
    }


    useEffect(() => {
        const savedData = sessionStorage.getItem('decryptedData');
        if(savedData !== null) {
            setDecryptedData(JSON.parse(savedData));
        } else {
            const fetchData = async () => {
                try {
                    const startDownloading_time = performance.now();
                    setIsDownloading(true);
                    const response = await fetch(`${BACKEND_API}/encDataSender`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user: user })
                    });
                    const result = await response.json();
                    const endDownloading_time = performance.now();
                    console.log(`Download completato in ${(endDownloading_time - startDownloading_time)/1000} s`);
                    setIsDownloading(false);
                    let n = 0;
                    if(result.success) {
                        const startDecrypting_time = performance.now();
                        let averageOneDecryptionTime = 0;
                        setIsDecrypting(true);
                        setTimeout(async () => {
                            try {
                                const decrypted = await Promise.all(
                                    result.data.map(async (row, index) => {
                                        const decryptedRow = {
                                            macroarea: row.macroarea,
                                            malattia: row.malattia,
                                            count_sum: await decryptPaillierValue(row.count_sum, privateKey),
                                            eta_sum: await decryptPaillierValue(row.eta_sum, privateKey),
                                            colesterolo_sum: await decryptPaillierValue(row.colesterolo_sum, privateKey),
                                            pressione_sum: await decryptPaillierValue(row.pressione_sum, privateKey),
                                            glucosio_sum: await decryptPaillierValue(row.glucosio_sum, privateKey),
                                            fumatore_sum: await decryptPaillierValue(row.fumatore_sum, privateKey),
                                            febbre_sum: await decryptPaillierValue(row.febbre_sum, privateKey),
                                            tosse_sum: await decryptPaillierValue(row.tosse_sum, privateKey),
                                            difficolta_sum: await decryptPaillierValue(row.difficolta_sum, privateKey),
                                            stanchezza_sum: await decryptPaillierValue(row.stanchezza_sum, privateKey),
                                            genere_sum: await decryptPaillierValue(row.genere_sum, privateKey),
                                            peso_sum: await decryptPaillierValue(row.peso_sum, privateKey),
                                            altezza_sum: await decryptPaillierValue(row.altezza_sum, privateKey)
                                        };
                                        return decryptedRow;
                                    })
                                );
                                setDecryptedData(decrypted);
                                n = decrypted.length;
                                sessionStorage.setItem('decryptedData', JSON.stringify(decrypted));
                            } catch (error) {
                                console.error('Errore nella decrittazione:', error);
                            } finally {
                                setIsDecrypting(false);
                                const endDecrypting_time = performance.now();
                                console.log(`Decrittazione completata in ${(endDecrypting_time - startDecrypting_time)/1000} s`);
                                console.log(`Tempo medio di decrittazione di una riga: ${((endDecrypting_time - startDecrypting_time)/n)/1000} s`);
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
        }
    }, [user]);

    // Funzione di decrittazione
    const decryptPaillierValue = async (encryptedHex, privateKey) => {
        try{
            // Converte da esadecimale a BigInt
            const hexString = encryptedHex.startsWith('0x')
                ? encryptedHex
                : `0x${encryptedHex}`;
            const encryptedBigInt = BigInt(hexString);

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
    const generalStats = useMemo(() => {
        let n_pazienti = 0;
        let sum_eta = 0;
        let sum_colesterolo = 0;
        let sum_pressione = 0;
        let sum_glucosio = 0;
        let sum_fumatore = 0;
        let sum_peso = 0;
        let sum_altezza = 0;
        let sum_donne = 0;
        let sum_uomini = 0;
        let malattie = [];
        let sum_diabete = 0;

        decryptedData.forEach((row) => {
            n_pazienti += row.count_sum;
            sum_eta += row.eta_sum;
            sum_colesterolo += row.colesterolo_sum;
            sum_pressione += row.pressione_sum;
            sum_glucosio += row.glucosio_sum;
            sum_fumatore += row.fumatore_sum;
            sum_peso += row.peso_sum;
            sum_altezza += row.altezza_sum;
            sum_donne += row.genere_sum;
            sum_uomini = n_pazienti - sum_donne;

            let flag = false;
            malattie.forEach((malattia) => {
                if(malattia.malattia === row.malattia){
                    malattia.infetti += row.count_sum;
                    flag = true;
                }
            });

            if(!flag){
                malattie.push({
                    malattia: row.malattia,
                    infetti: row.count_sum
                });
            }
        });
        malattie.forEach((malattia) => {
            if(malattia.malattia === 'Diabete'){
                sum_diabete = malattia.infetti;
            }
        })
        return{
            pazienti_totali: n_pazienti,
            average_eta: sum_eta / n_pazienti,
            average_colesterolo: sum_colesterolo / n_pazienti,
            average_pressione: sum_pressione / n_pazienti,
            average_glucosio: sum_glucosio / n_pazienti,
            perc_fumatore: sum_fumatore / n_pazienti * 100,
            average_peso: sum_peso / n_pazienti,
            average_altezza: sum_altezza / n_pazienti,
            perc_donne: sum_donne / n_pazienti * 100,
            perc_uomini: sum_uomini / n_pazienti * 100,
            perc_diabete: sum_diabete / n_pazienti * 100,
            malattie: malattie,
        }
    }, [decryptedData]);

    const nordData = useMemo (() => {
        let n_pazienti = 0;
        let sum_eta = 0;
        let sum_colesterolo = 0;
        let sum_pressione = 0;
        let sum_glucosio = 0;
        let sum_fumatore = 0;
        let sum_peso = 0;
        let sum_altezza = 0;
        let sum_donne = 0;
        let sum_uomini = 0;
        let malattie = [];
        let sum_diabete = 0;

        decryptedData.forEach((row) => {
            if(row.macroarea === 'Nord') {
                n_pazienti += row.count_sum;
                sum_eta += row.eta_sum;
                sum_colesterolo += row.colesterolo_sum;
                sum_pressione += row.pressione_sum;
                sum_glucosio += row.glucosio_sum;
                sum_fumatore += row.fumatore_sum;
                sum_peso += row.peso_sum;
                sum_altezza += row.altezza_sum;
                sum_donne += row.genere_sum;
                sum_uomini = n_pazienti - sum_donne;

                let flag = false;
                malattie.forEach((malattia) => {
                    if(malattia.malattia === row.malattia){
                        malattia.infetti += row.count_sum;
                        flag = true;
                    }
                });

                if(!flag){
                    malattie.push({
                        malattia: row.malattia,
                        infetti: row.count_sum
                    });
                }
            }
        });
        malattie.forEach((malattia) => {
            if(malattia.malattia === 'Diabete'){
                sum_diabete = malattia.infetti;
            }
        })
        return{
            pazienti_totali: n_pazienti,
            average_eta: sum_eta / n_pazienti,
            average_colesterolo: sum_colesterolo / n_pazienti,
            average_pressione: sum_pressione / n_pazienti,
            average_glucosio: sum_glucosio / n_pazienti,
            perc_fumatore: sum_fumatore / n_pazienti * 100,
            average_peso: sum_peso / n_pazienti,
            average_altezza: sum_altezza / n_pazienti,
            perc_donne: sum_donne / n_pazienti * 100,
            perc_uomini: sum_uomini / n_pazienti * 100,
            perc_diabete: sum_diabete / n_pazienti * 100,
            malattie: malattie,
        }
    }, [decryptedData]);

    const centroData = useMemo( () => {
        let n_pazienti = 0;
        let sum_eta = 0;
        let sum_colesterolo = 0;
        let sum_pressione = 0;
        let sum_glucosio = 0;
        let sum_fumatore = 0;
        let sum_peso = 0;
        let sum_altezza = 0;
        let sum_donne = 0;
        let sum_uomini = 0;
        let malattie = [];
        let sum_diabete = 0;

        decryptedData.forEach((row) => {
            if(row.macroarea === 'Centro') {
                n_pazienti += row.count_sum;
                sum_eta += row.eta_sum;
                sum_colesterolo += row.colesterolo_sum;
                sum_pressione += row.pressione_sum;
                sum_glucosio += row.glucosio_sum;
                sum_fumatore += row.fumatore_sum;
                sum_peso += row.peso_sum;
                sum_altezza += row.altezza_sum;
                sum_donne += row.genere_sum;
                sum_uomini = n_pazienti - sum_donne;

                let flag = false;
                malattie.forEach((malattia) => {
                    if(malattia.malattia === row.malattia){
                        malattia.infetti += row.count_sum;
                        flag = true;
                    }
                });

                if(!flag){
                    malattie.push({
                        malattia: row.malattia,
                        infetti: row.count_sum
                    });
                }
            }
        });
        malattie.forEach((malattia) => {
            if(malattia.malattia === 'Diabete'){
                sum_diabete = malattia.infetti;
            }
        })
        return{
            pazienti_totali: n_pazienti,
            average_eta: sum_eta / n_pazienti,
            average_colesterolo: sum_colesterolo / n_pazienti,
            average_pressione: sum_pressione / n_pazienti,
            average_glucosio: sum_glucosio / n_pazienti,
            perc_fumatore: sum_fumatore / n_pazienti * 100,
            average_peso: sum_peso / n_pazienti,
            average_altezza: sum_altezza / n_pazienti,
            perc_donne: sum_donne / n_pazienti * 100,
            perc_uomini: sum_uomini / n_pazienti * 100,
            perc_diabete: sum_diabete / n_pazienti * 100,
            malattie: malattie,
        }

    }, [decryptedData]);

    const sudData = useMemo( () => {
        let n_pazienti = 0;
        let sum_eta = 0;
        let sum_colesterolo = 0;
        let sum_pressione = 0;
        let sum_glucosio = 0;
        let sum_fumatore = 0;
        let sum_peso = 0;
        let sum_altezza = 0;
        let sum_donne = 0;
        let sum_uomini = 0;
        let malattie = [];
        let sum_diabete = 0;

        decryptedData.forEach((row) => {
            if(row.macroarea === 'Sud') {
                n_pazienti += row.count_sum;
                sum_eta += row.eta_sum;
                sum_colesterolo += row.colesterolo_sum;
                sum_pressione += row.pressione_sum;
                sum_glucosio += row.glucosio_sum;
                sum_fumatore += row.fumatore_sum;
                sum_peso += row.peso_sum;
                sum_altezza += row.altezza_sum;
                sum_donne += row.genere_sum;
                sum_uomini = n_pazienti - sum_donne;

                let flag = false;
                malattie.forEach((malattia) => {
                    if(malattia.malattia === row.malattia){
                        malattia.infetti += row.count_sum;
                        flag = true;
                    }
                });

                if(!flag){
                    malattie.push({
                        malattia: row.malattia,
                        infetti: row.count_sum
                    });
                }
            }
        });
        malattie.forEach((malattia) => {
            if(malattia.malattia === 'Diabete'){
                sum_diabete = malattia.infetti;
            }
        })
        return{
            pazienti_totali: n_pazienti,
            average_eta: sum_eta / n_pazienti,
            average_colesterolo: sum_colesterolo / n_pazienti,
            average_pressione: sum_pressione / n_pazienti,
            average_glucosio: sum_glucosio / n_pazienti,
            perc_fumatore: sum_fumatore / n_pazienti * 100,
            average_peso: sum_peso / n_pazienti,
            average_altezza: sum_altezza / n_pazienti,
            perc_donne: sum_donne / n_pazienti * 100,
            perc_uomini: sum_uomini / n_pazienti * 100,
            perc_diabete: sum_diabete / n_pazienti * 100,
            malattie: malattie,
        }

    }, [decryptedData]);

    const diseaseData = (disease) => {
        let n_pazienti = 0;
        let sum_eta = 0;
        let sum_colesterolo = 0;
        let sum_pressione = 0;
        let sum_glucosio = 0;
        let sum_fumatore = 0;
        let sum_peso = 0;
        let sum_altezza = 0;
        let sum_donne = 0;
        let sum_uomini = 0;
        let n_nord = 0;
        let n_centro = 0;
        let n_sud = 0;
        let sum_tosse = 0;
        let sum_febbre = 0;
        let sum_respiratorie = 0;
        let sum_stanchezza = 0;

        decryptedData.forEach((row) => {
            if(row.malattia === disease) {
                n_pazienti += row.count_sum;
                sum_eta += row.eta_sum;
                sum_colesterolo += row.colesterolo_sum;
                sum_pressione += row.pressione_sum;
                sum_glucosio += row.glucosio_sum;
                sum_fumatore += row.fumatore_sum;
                sum_peso += row.peso_sum;
                sum_altezza += row.altezza_sum;
                sum_donne += row.genere_sum;
                sum_uomini = n_pazienti - sum_donne;
                sum_tosse += row.tosse_sum;
                sum_febbre += row.febbre_sum;
                sum_respiratorie += row.difficolta_sum
                sum_stanchezza += row.stanchezza_sum;

                if(row.macroarea === 'Nord'){
                    n_nord = n_nord + row.count_sum;
                }
                if(row.macroarea === 'Centro'){
                    n_centro = n_centro + row.count_sum;
                }
                if(row.macroarea === 'Sud'){
                    n_sud = n_sud + row.count_sum;
                }
            }
        });
        return{
            pazienti_totali: n_pazienti,
            average_eta: sum_eta / n_pazienti,
            average_colesterolo: sum_colesterolo / n_pazienti,
            average_pressione: sum_pressione / n_pazienti,
            average_glucosio: sum_glucosio / n_pazienti,
            perc_fumatore: sum_fumatore / n_pazienti * 100,
            average_peso: sum_peso / n_pazienti,
            average_altezza: sum_altezza / n_pazienti,
            perc_donne: sum_donne / n_pazienti * 100,
            perc_uomini: sum_uomini / n_pazienti * 100,
            perc_tosse: sum_tosse / n_pazienti * 100,
            perc_febbre: sum_febbre / n_pazienti * 100,
            perc_respiratorie: sum_respiratorie / n_pazienti *100,
            perc_stanchezza: sum_stanchezza / n_pazienti * 100,
            n_nord: n_nord,
            n_centro: n_centro,
            n_sud: n_sud
        }
    }

    return(
        <div>
            <header className="header">
                <div className="options-container">
                    <button className="options" onClick={backHome}>Home</button>
                    <span> | </span>
                    <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                    <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{user} 🚧</button>
                    <span> | </span>
                    <button className="options">Assistenza clienti 🚧</button>
                    <span> | </span>
                    <button className="options" onClick={logout}>Logout</button>
                </div>
            </header>
            <div className="container fade-in">
                <div className="title-container">
                    <h1>Dashboard Analisi</h1>
                    <button className="button" onClick={updatePage}>Update</button>
                </div>

                <div>
                    {(isDownloading || isDecrypting) && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p>Decrittazione in corso... Attendere prego</p>
                        </div>
                    )}
                </div>
                <h2>Panoramica Pazienti Nazionale</h2>
                <div className="row1">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{generalStats.pazienti_totali}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{generalStats.average_eta.toFixed(0)} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{(generalStats.average_glucosio / 100).toFixed(3)} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{(generalStats.average_colesterolo / 100).toFixed(3)} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{generalStats.perc_diabete.toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{generalStats.perc_fumatore.toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{generalStats.perc_uomini.toFixed(3)} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{generalStats.perc_donne.toFixed(3)} % </p>
                    </div>
                </div>
                <h2>Report per luogo di provenienza</h2>
                <div className="row2">
                    <div className="stat" onClick={northPage}>
                        <h2>Nord</h2>
                        <p>{nordData.pazienti_totali} </p>
                        <h2>pazienti</h2>
                    </div>
                    <div className="stat" onClick={centroPage}>
                        <h2>Centro</h2>
                        <p>{centroData.pazienti_totali} </p>
                        <h2>pazienti</h2>
                    </div>
                    <div className="stat" onClick={southPage}>
                        <h2>Sud</h2>
                        <p>{sudData.pazienti_totali} </p>
                        <h2>pazienti</h2>
                    </div>
                </div>
                <h2>Report per malattia</h2>
                <div className="row2">
                    {generalStats.malattie.map((malattia) => (
                        <div className="stat" onClick={() => diseasePage(malattia.malattia)}>
                            <h2>{malattia.malattia}</h2>
                            <p>{(malattia.infetti / generalStats.pazienti_totali * 100).toFixed(3)} %</p>
                            <h2>dei pazienti</h2>
                        </div>
                    ))}
                </div>
                <button className="button" onClick={publishData}>Publish Data</button>
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

