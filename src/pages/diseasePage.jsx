import '../stylesheet/App2.css'
import {useLocation, useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";
import {useEffect, useState} from "react";
import { useMemo } from "react";
import React from 'react';


export default function DiseasePage() {
    const user = sessionStorage.getItem('username');
    const navigate = useNavigate();
    const location = useLocation();
    const {state} = location;
    const data = state.data;
    const disease = state.disease;
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
                <h2>Panoramica Pazienti {disease}</h2>
                <div className="row1">
                    <div className="stat">
                        <h2>Pazienti Affetti</h2>
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
                        <h2>Percentuale Fumatori</h2>
                        <p>{data.perc_fumatore} %</p>
                    </div>
                    <div className="stat">
                        <h2>Genere</h2>
                        <p>Uomini: {data.perc_uomini} %
                            Donne: {data.perc_donne} % </p>
                    </div>
                </div>
                <h2>Sintomi</h2>
                <div className="row2">
                    <div className="stat">
                        <h2>Tosse</h2>
                        <p>{data.perc_tosse} %</p>
                    </div>
                    <div className="stat">
                        <h2>Febbre</h2>
                        <p>{data.perc_febbre} %</p>
                    </div>
                    <div className="stat">
                        <h2>Difficoltà Respiratorie</h2>
                        <p>{data.perc_respiratorie} %</p>
                    </div>
                    <div className="stat">
                        <h2>Stanchezza</h2>
                        <p>{data.perc_stanchezza} %</p>
                    </div>
                </div>
                <h2>Luogo</h2>
                <div className="row2">
                    <div className="stat">
                        <h2>Nord</h2>
                        <p>{data.n_nord}</p>
                    </div>
                    <div className="stat">
                        <h2>Centro</h2>
                        <p>{data.n_centro}</p>
                    </div>
                    <div className="stat">
                        <h2>Sud</h2>
                        <p>{data.n_sud}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}