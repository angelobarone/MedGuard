import './stylesheet/App.css'
import BackgroundCarousel from './App.jsx'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';


export default function ClinicPage() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dataCollector" element={<DataCollector />}/>
        </Routes>
    )
}

function Dashboard(){
    const clinic = sessionStorage.getItem('username')
    const navigate = useNavigate();
    const inserisciDati = () => {
        navigate('/dataCollector');
    };
    return (
        <>
            <BackgroundCarousel />
            <div>
                <div className="container fade-in">
                    <h1 className="title">Logged in as: {clinic}</h1>
                    <img src = "/medguard.png" alt="logo" height="300px"/>
                    <button className="button" onClick={inserisciDati}>Inserisci nuovi dati</button>
                    <button className="button">Consulta i Dati pubblicati 🚧</button>
                    <button className="button">Assistente Virtuale 🚧</button>
                </div>
            </div>
        </>
    );
}

function DataCollector(){

}