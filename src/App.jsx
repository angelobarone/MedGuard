import img1 from './assets/background/pexels-chokniti-khongchum-1197604-2280571.jpg'
import img2 from './assets/background/pexels-fr3nks-305565.jpg'
import img4 from './assets/background/pexels-pixabay-40568.jpg'
import img5 from './assets/background/pexels-pixabay-356040.jpg'
import img6 from './assets/background/3ff6cfbd-6d05-4657-bc8a-9554dc707c34.jpeg'
import {useEffect, useState} from "react";
import AuthorizedPage from "./pages/AuthorizedPage.jsx";
import DataSeeker from "./pages/DataSeeker.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import {Route, Routes} from "react-router-dom";
import JoinUs from "./pages/Home.jsx";
import ClinicPage from "./pages/clinicPage.jsx";
import DataCollector from "./pages/DataCollector.jsx";

const images = [img1,img2, img4, img5]

export function BackgroundCarousel() {
    const randomNumber = Math.floor(Math.random() * 4);
    const [index, setIndex] = useState(randomNumber);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval); // pulizia intervallo
    }, []);

    /*const backgroundStyle = {
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
    };*/
    const backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${img6})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1s ease-in-out",
        zIndex: -1,
    };
    return <div style={backgroundStyle} />;
}

export default function App() {
    return (
        <div className="App">
            <BackgroundCarousel />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/clinicPage" element={<ClinicPage />} />
                <Route path="/authorizedPage" element={<AuthorizedPage />} />
                <Route path="/dataSeeker" element={<DataSeeker />} />
                <Route path="/joinUs" element={<JoinUs />} />
                <Route path="/dataCollector" element={<DataCollector />} />
            </Routes>
        </div>
    );
}