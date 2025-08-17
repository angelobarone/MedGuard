import {useNavigate} from "react-router-dom";
import {BackgroundCarousel} from "../App.jsx";
import '../stylesheet/App.css'
import React from 'react';

export default function Home(){
    const navigate = useNavigate();
    const vaiAlLogin = () => navigate('/login');
    const vaiAlJoinUs = () => navigate('/joinUs');

    return (
        <div>
            <header className="header">
                <button className="options" onClick= {vaiAlJoinUs}>Join MedGuard 🚧</button>
                <button className="options" >About Us 🚧</button>
                <button className="options" >Contact Us 🚧</button>
            </header>
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <h3>"per la statistica e la diagnosi medica su larga scala"</h3>
                <button className="button" onClick={vaiAlLogin}>Accedi al database</button>
            </div>
        </div>
    );
}

export function JoinUs(){

}