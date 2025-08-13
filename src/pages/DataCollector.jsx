import '../stylesheet/App.css'
import {useNavigate} from "react-router-dom";
import * as paillier from "paillier-bigint";

export default function DataCollector() {
    const clinic = sessionStorage.getItem('username');
    const navigate = useNavigate();

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    return(
        <div>
            <header className="header">
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className = "container fade-in">
                <span>ciao</span>
            </div>
        </div>
    );
}