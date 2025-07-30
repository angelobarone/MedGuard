import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {BackgroundCarousel} from "../App.jsx";
import '../stylesheet/App.css'

export default function Login(){
    const navigate = useNavigate();
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState("");
    const vaiAlJoinUs = () => navigate('/joinUs');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error('Credenziali errate');

            sessionStorage.setItem("username", data.username);
            sessionStorage.setItem("token", data.token);

            console.log(data.type);
            if(data.type === 'A'){
                navigate('/clinicPage');
            }
            if(data.type === 'S'){
                navigate('/authorizedPage');
            }

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <header className="header">
                <button className="options" onClick={vaiAlJoinUs}>Join MedGuard 🚧</button>
                <button className="options" >About Us 🚧</button>
                <button className="options" >Contact Us 🚧</button>
            </header>
            <div className="container fade-in">
                <img src = "/medguard.png" alt="logo" height="300px"/>
                <h2>Login</h2>
                <input type="text"
                       placeholder="Username"
                       value = {usernameInput}
                       onChange={(e) => setUsernameInput(e.target.value)}
                />
                <br />
                <input type="password"
                       placeholder="Password"
                       value={passwordInput}
                       onChange={(e) => setPasswordInput(e.target.value)}
                />
                <br />
                <button className="button" onClick={handleLogin}>Accedi</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}