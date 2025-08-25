import '../stylesheet/App2.css'
import {useLocation, useNavigate} from "react-router-dom";
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

    const back = () => {
        navigate(-1);
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
                    <button className="button" onClick={back}> &lt; back</button>
                </div>
                <h2>Panoramica Pazienti {disease}</h2>
                <div className="row1">
                    <div className="stat">
                        <h2>Pazienti Affetti</h2>
                        <p>{data.pazienti_totali}</p>
                    </div>
                    <div className="stat">
                        <h2>Età media</h2>
                        <p>{data.average_eta.toFixed(0)} </p>
                    </div>
                    <div className="stat">
                        <h2>Glicemia media</h2>
                        <p>{(data.average_glucosio / 100).toFixed(3)} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Colesterolo media</h2>
                        <p>{(data.average_colesterolo / 100).toFixed(3)} mg/dl</p>
                    </div>
                    <div className="stat">
                        <h2>Percentuale Fumatori</h2>
                        <p>{(data.perc_fumatore).toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Uomini</h2>
                        <p>{data.perc_uomini.toFixed(3)} % </p>
                    </div>
                    <div className="stat">
                        <h2>Donne</h2>
                        <p>{data.perc_donne.toFixed(3)} % </p>
                    </div>
                </div>
                <h2>Sintomi</h2>
                <div className="row2">
                    <div className="stat">
                        <h2>Tosse</h2>
                        <p>{data.perc_tosse.toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Febbre</h2>
                        <p>{data.perc_febbre.toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Difficoltà Respiratorie</h2>
                        <p>{data.perc_respiratorie.toFixed(3)} %</p>
                    </div>
                    <div className="stat">
                        <h2>Stanchezza</h2>
                        <p>{data.perc_stanchezza.toFixed(3)} %</p>
                    </div>
                </div>
                <h2>Caratteristiche fisiche</h2>
                <div className="row2">
                    <div className="stat">
                        <h2>Peso medio</h2>
                        <p>{data.average_peso.toFixed(1)} kg</p>
                    </div>
                    <div className="stat">
                        <h2>Altezza media</h2>
                        <p>{data.average_altezza.toFixed(1)} cm</p>
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