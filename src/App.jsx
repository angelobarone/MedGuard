import './App.css'
import img1 from './assets/background/pexels-chokniti-khongchum-1197604-2280571.jpg'
import img2 from './assets/background/pexels-fr3nks-305565.jpg'
import img4 from './assets/background/pexels-pixabay-40568.jpg'
import img5 from './assets/background/pexels-pixabay-356040.jpg'
import {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

const images = [img1,img2, img4, img5]

function BackgroundCarousel() {
    const randomNumber = Math.floor(Math.random() * 4);
    const [index, setIndex] = useState(randomNumber);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval); // pulizia intervallo
    }, []);

    const backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${images[index]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1s ease-in-out",
        zIndex: -1,
    };
    return <div style={backgroundStyle} />;
}

function Home(){
    const navigate = useNavigate();
    const vaiAlLogin = () => navigate('/login');

    return (
        <>
            <BackgroundCarousel />
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <h3>"per la statistica e la diagnosi medica su larga scala"</h3>
                <button className="button" onClick={vaiAlLogin}>Accedi al database</button>
            </div>
        </>
    );
}

function Login(){
    return (
        <>
            <BackgroundCarousel />
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <h2>Login</h2>
                <input type="text" placeholder="Username" /><br /><br />
                <input type="password" placeholder="Password" /><br /><br />
                <button className="button">Accedi</button>
            </div>
        </>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;