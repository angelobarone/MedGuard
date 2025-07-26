import '../stylesheet/App.css'
import BackgroundCarousel from "../App.jsx";
import {useNavigate} from "react-router-dom";

export default function AuthorizedPage() {
    const user = sessionStorage.getItem('username')
    const navigate = useNavigate();

    if(user === null){
        alert("Errore di login");
        navigate('/login');
    }

    const consultaDati = () => {
        navigate('/dataSeeker');
    };

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    return (
        <div>
            <header className="header">
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{user} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <button className="button" onClick={consultaDati}>Consulta i dati</button>
            </div>
        </div>
    );
}

export function DataSeeker(){

}

