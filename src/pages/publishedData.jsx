import '../stylesheet/App2.css'
import {useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import React from 'react';

export default function PublishedData() {
    const clinic = sessionStorage.getItem('username');
    const navigate = useNavigate();
    const [data, setData] = useState(null);   // inizialmente null
    const [loading, setLoading] = useState(true); // stato loader

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    const backHome = () => {
        navigate('/clinicPage');
    }

    const updatePage = () => {
        navigate(0);
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/getPublishedData");
                const result = await response.json();

                if (result.success && result.data.length > 0) {
                    setData(result.data[0]); // prendi il primo oggetto dall'array
                }
            } catch (error) {
                console.error("Errore nel fetch:", error);
            } finally {
                setLoading(false); // termina il loader anche in caso di errore
            }
        };

        getData();
    }, []);

    if (loading) {
        return <p>Caricamento dei dati...</p>; // loader
    }

    if (!data) {
        return <p>Errore: impossibile caricare i dati.</p>; // fallback se fetch fallisce
    }

    return(
        <div>
            <header className="header">
                <div className="options-container">
                    <button className="options" onClick={backHome}>Home</button>
                    <span> | </span>
                    <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                    <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
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

                <h2>Panoramica Pazienti Nazionale</h2>
                <div className="row1">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{data.n_pazienti}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data?.eta_media?.toFixed(0) ?? "N/D"} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{data?.glicemia_media?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{data?.colesterolo_media?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{data?.prevalenza_diabete?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{data?.percentuale_fumatori?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{data?.percentuale_uomini?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{data?.percentuale_donne?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                </div>
                <h2>Report per luogo di provenienza</h2>
                <h3>Nord</h3>
                <div className="row2">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{data.n_nord}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data?.eta_media_nord?.toFixed(0) ?? "N/D"} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{data?.glicemia_media_nord?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{data?.colesterolo_media_nord?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{data?.prevalenza_diabete_nord?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{data?.percentuale_fumatori_nord?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{data?.percentuale_uomini_nord?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{data?.percentuale_donne_nord?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                </div>
                <h3>Centro</h3>
                <div className="row2">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{data.n_centro}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data?.eta_media_centro?.toFixed(0)} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{data?.glicemia_media_centro?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{data?.colesterolo_media_centro?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{data?.prevalenza_diabete_centro?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{data?.percentuale_fumatori_centro?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{data?.percentuale_uomini_centro?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{data?.percentuale_donne_centro?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                </div>
                <h3>Sud</h3>
                <div className="row2">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{data.n_sud}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data?.eta_media_sud?.toFixed(0)} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{data?.glicemia_media_sud?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{data?.colesterolo_media_sud?.toFixed(3) ?? "N/D"} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{data?.prevalenza_diabete_sud?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{data?.percentuale_fumatori_sud?.toFixed(3) ?? "N/D"} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{data?.percentuale_uomini_sud?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{data?.percentuale_donne_sud?.toFixed(3) ?? "N/D"} % </p>
                    </div>
                </div>
            </div>
        </div>
    );
}