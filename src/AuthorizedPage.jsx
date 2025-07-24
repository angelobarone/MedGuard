import './stylesheet/App.css'
import {Route, Routes, useNavigate} from "react-router-dom";
import BackgroundCarousel from "./App.jsx";

export default function AuthorizedPage() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dataSeeker" element={<DataSeeker />}/>
        </Routes>
    )
}

function Dashboard(){
    const user = sessionStorage.getItem('username')
    const navigate = useNavigate();
    const consultaDati = () => {
        navigate('/dataSeeker');
    };
    return (
        <>
            <BackgroundCarousel />
            <div>
                <div className="container fade-in">
                    <h1 className="title">Logged in as: {user}</h1>
                    <img src = "/medguard.png" alt="logo" height="300px"/>
                    <button className="button" onClick={consultaDati}>Consulta i dati</button>
                </div>
            </div>
        </>
    );
}

function DataSeeker(){

}

