import '../stylesheet/App.css'
import {Form, useNavigate} from "react-router-dom";
import { useState } from 'react';
import * as paillier from "paillier-bigint"

//mapping per la codifica dei dati
const genderToInt = g => (g === 'F' ? 1n : 0n); // M=0, F=1
const scale = 100n; // per fixed-point

function fixedPoint(xStr){
    const [a,b = ''] = String(xStr).trim().split('.');
    const frac = (b + '00').slice(0,2);
    return BigInt(a) * scale + BigInt(frac);
}

function bigintHex(bi){
    return bi.toString(16);
}

async function encryptForm(formData, pkData) {
    if (!pkData) {
        throw new Error('Public key not found');
    }

    const encPayload = {};
    const publicKey = new paillier.PublicKey(BigInt(pkData.n), BigInt(pkData.g));

    encPayload.count_sum = bigintHex(publicKey.encrypt(1n));

    const boolFields = {
        febbre_sum: formData.febbre ? 1n : 0n,
        tosse_sum: formData.tosse ? 1n : 0n,
        difficolta_sum: formData.difficoltaRespiratorie ? 1n : 0n,
        stanchezza_sum: formData.stanchezza ? 1n : 0n,
        fumatore_sum: formData.fumatore ? 1n : 0n
    };
    for (const [field, value] of Object.entries(boolFields)) {
        encPayload[field] = bigintHex(publicKey.encrypt(value));
    }

    encPayload.genere_sum = bigintHex(publicKey.encrypt(BigInt(genderToInt(formData.genere))));

    encPayload.eta_sum = bigintHex(publicKey.encrypt(BigInt(formData.eta || 0)));

    for (const [fieldName, key] of [
        ['pressione_sum', 'pressioneSangue'],
        ['colesterolo_sum', 'colesterolo'],
        ['glucosio_sum', 'glucosio']
    ]) {
        const m = formData[key] ? fixedPoint(formData[key]) : 0n;
        encPayload[fieldName] = bigintHex(publicKey.encrypt(m));
    }

    encPayload.provincia = formData.provincia;
    encPayload.malattia = formData.malattia;

    return encPayload;
}

export default function DataCollector() {
    const clinic = sessionStorage.getItem('username');
    const navigate = useNavigate();

    const logout = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    const backHome = () => {
        navigate('/clinicPage');
    }

    const [formData, setFormData] = useState({
        malattia: '',
        eta: '',
        genere: '',
        fumatore: '',
        provincia: '',
        febbre: '',
        tosse: '',
        difficoltaRespiratorie: '',
        stanchezza: '',
        pressioneSangue: '',
        colesterolo: '',
        glucosio: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validazione testo/numeri
        if (!formData.malattia.trim()) newErrors.malattia = 'Campo obbligatorio';
        if (!formData.eta) newErrors.eta = 'Campo obbligatorio';
        if (!formData.pressioneSangue.trim()) newErrors.pressioneSangue = 'Campo obbligatorio';
        if (!formData.colesterolo) newErrors.colesterolo = 'Campo obbligatorio';
        if (!formData.glucosio) newErrors.glucosio = 'Campo obbligatorio';

        // Validazione radio button
        if (!formData.genere) newErrors.genere = 'Seleziona un\'opzione';
        if (!formData.fumatore) newErrors.fumatore = 'Seleziona un\'opzione';
        if (!formData.febbre) newErrors.febbre = 'Seleziona un\'opzione';
        if (!formData.tosse) newErrors.tosse = 'Seleziona un\'opzione';
        if (!formData.difficoltaRespiratorie) newErrors.difficoltaRespiratorie = 'Seleziona un\'opzione';
        if (!formData.stanchezza) newErrors.stanchezza = 'Seleziona un\'opzione';

        // Validazione select
        if (!formData.provincia) newErrors.provincia = 'Seleziona una provincia';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return; // Ferma l'invio se ci sono errori
        }
        setIsSubmitting(true);
        const pkData = JSON.parse(sessionStorage.getItem('publicKey'));
        try {
            if(!pkData) {
                throw new Error('Public key non trovato');
            }
            const encData = await encryptForm(formData, pkData);
            const response = await fetch('http://127.0.0.1:5000/encDataReceiver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clinic: clinic,
                    data: encData,
                    n: pkData.n,
                    g: pkData.g
                }),
            });
            const result = await response.json();
            if(result.success){
                alert('Dati inviati con successo!');
            }
            else{
                alert('Errore durante l\'invio dei dati');
            }
        } catch (error) {
            console.error('Errore:', error);
            alert('Si è verificato un errore durante l\'invio');
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div>
            <header className="header">
                <button className="options" onClick={backHome}>Home</button>
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
            </header>
            <div className="container fade-in">
                <h1>Dati del paziente</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="malattia">Malattia</label>
                            <input
                                type="text"
                                id="malattia"
                                name="malattia"
                                value={formData.malattia}
                                onChange={handleInputChange}
                                placeholder="Es. Diabete, Ipertensione..."
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="eta">Età</label>
                            <input
                                type="number"
                                id="eta"
                                name="eta"
                                value={formData.eta}
                                onChange={handleInputChange}
                                placeholder="Es. 45"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                            <label>Genere</label>
                            <div className="radio-group">
                                <div className="radio-option">
                                    <input
                                        type="radio"
                                        id="m"
                                        name="genere"
                                        value="M"
                                        checked={formData.genere === 'M'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="m">M</label>
                                </div>
                                <div className="radio-option">
                                    <input
                                        type="radio"
                                        id="f"
                                        name="genere"
                                        value="F"
                                        checked={formData.genere === 'F'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="f">F</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Fumatore</label>
                            <div className="radio-group">
                                <div className="radio-option">
                                    <input
                                        type="radio"
                                        id="fumatore-si"
                                        name="fumatore"
                                        value="Si"
                                        checked={formData.fumatore === 'Si'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="fumatore-si">Sì</label>
                                </div>
                                <div className="radio-option">
                                    <input
                                        type="radio"
                                        id="fumatore-no"
                                        name="fumatore"
                                        value="No"
                                        checked={formData.fumatore === 'No'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="fumatore-no">No</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="provincia">Provincia</label>
                            <select
                                id="provincia"
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleInputChange}
                                className="form-select"

                            >
                                <option value="" disabled>Seleziona provincia</option>
                                <option value="MI">Milano</option>
                                <option value="RM">Roma</option>
                                <option value="NA">Napoli</option>
                                <option value="TO">Torino</option>
                                <option value="PA">Palermo</option>
                                <option value="GE">Genova</option>
                                <option value="BO">Bologna</option>
                                <option value="FI">Firenze</option>
                                <option value="BA">Bari</option>
                                <option value="CT">Catania</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="section-title">Sintomi</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Febbre</label>
                                <div className="radio-group">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="febbre-si"
                                            name="febbre"
                                            value="Si"
                                            checked={formData.febbre === 'Si'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="febbre-si">Sì</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="febbre-no"
                                            name="febbre"
                                            value="No"
                                            checked={formData.febbre === 'No'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="febbre-no">No</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tosse</label>
                                <div className="radio-group">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="tosse-si"
                                            name="tosse"
                                            value="Si"
                                            checked={formData.tosse === 'Si'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="tosse-si">Sì</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="tosse-no"
                                            name="tosse"
                                            value="No"
                                            checked={formData.tosse === 'No'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="tosse-no">No</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Difficoltà Respiratorie</label>
                                <div className="radio-group">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="difficoltaRespiratorie-si"
                                            name="difficoltaRespiratorie"
                                            value="Si"
                                            checked={formData.difficoltaRespiratorie === 'Si'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="difficoltaRespiratorie-si">Sì</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="difficoltaRespiratorie-no"
                                            name="difficoltaRespiratorie"
                                            value="No"
                                            checked={formData.difficoltaRespiratorie === 'No'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="difficoltaRespiratorie-no">No</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stanchezza</label>
                                <div className="radio-group">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="stanchezza-si"
                                            name="stanchezza"
                                            value="Si"
                                            checked={formData.stanchezza === 'Si'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="stanchezza-si">Sì</label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="stanchezza-no"
                                            name="stanchezza"
                                            value="No"
                                            checked={formData.stanchezza === 'No'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="stanchezza-no">No</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="section-title">Parametri Clinici</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="form-group">
                                <label htmlFor="pressioneSangue">Pressione Sanguigna</label>
                                <input
                                    type="text"
                                    id="pressioneSangue"
                                    name="pressioneSangue"
                                    value={formData.pressioneSangue}
                                    onChange={handleInputChange}
                                    placeholder="Es. 120/80"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="colesterolo">Colesterolo (mg/dL)</label>
                                <input
                                    type="number"
                                    id="colesterolo"
                                    name="colesterolo"
                                    value={formData.colesterolo}
                                    onChange={handleInputChange}
                                    placeholder="Es. 180"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="glucosio">Glucosio (mg/dL)</label>
                                <input
                                    type="number"
                                    id="glucosio"
                                    name="glucosio"
                                    value={formData.glucosio}
                                    onChange={handleInputChange}
                                    placeholder="Es. 95"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}>
                        {isSubmitting ? "Crittografia in corso..." : "Cripta e Carica Dati"}
                    </button>
                </form>
            </div>
        </div>
    );
}
