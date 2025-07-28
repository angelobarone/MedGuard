import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";

export default function ClinicPage() {
    const clinic = sessionStorage.getItem('username');
    const navigate = useNavigate();

    if(clinic === null){
        alert("Errore di login");
        navigate('/login');
    }

    const inserisciDati = () => {
        navigate('/dataCollector');  // sposta verso un’altra pagina definita in App.jsx
    };

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    return (aaaa
        <div>
            <header className="header">
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className="container fade-in">
                <img src="/medguard.png" alt="logo" height="300px" />
                <button className="button" onClick={inserisciDati}>Inserisci nuovi dati</button>
                <button className="button">Consulta i Dati pubblicati 🚧</button>
                <button className="button">Assistente Virtuale 🚧</button>
            </div>
        </div>
    );
}

export function DataCollector(){

}