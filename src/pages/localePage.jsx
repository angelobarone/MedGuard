import '../stylesheet/App2.css'
import {useLocation, useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";
import {useEffect, useState} from "react";
import { useMemo } from "react";
import React from 'react';


export default function LocalePage() {
    const user = sessionStorage.getItem('username');
    const navigate = useNavigate();
    const location = useLocation();
    const {state} = location;
    const data = state.data;
    const locale = state.locale;
    console.log(data);

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    const backHome = () => {
        navigate('/authorizedPage');
    }

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
                <h2>Panoramica Pazienti {locale}</h2>
                <div className="row1">
                    <div className="stat">
                        <h2>Pazienti totali</h2>
                        <p>{data.pazienti_totali}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data.average_eta} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{data.average_glucosio / 100} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{data.average_colesterolo / 100} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Prevalenza Diabete</h2>
                        <p>{data.perc_diabete} %</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{data.perc_fumatore} %</p>
                    </div>
                    <div className="stat">
                        <h2>Genere</h2>
                        <p>Uomini: {data.perc_uomini} %
                            Donne: {data.perc_donne} % </p>
                    </div>
                </div>
                <h2>Prevalenza Malattie nella regione: {locale}</h2>
                <div className="row2">
                    {data.malattie.map((malattia) => (
                        <div className="stat" >
                            <h2>{malattia.malattia}</h2>
                            <p>{malattia.infetti / data.pazienti_totali * 100} %</p>
                            <h2>dei pazienti</h2>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}