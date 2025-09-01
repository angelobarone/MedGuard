import '../stylesheet/App.css'
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import * as paillier from "paillier-bigint"
import React from 'react';

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
        ['glucosio_sum', 'glucosio'],
        ['peso_sum', 'peso'],
        ['altezza_sum', 'altezza']
    ]) {
        const m = formData[key] ? fixedPoint(formData[key]) : 0n;
        encPayload[fieldName] = bigintHex(publicKey.encrypt(m));
    }

    encPayload.macroarea = formData.macroarea;
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
        peso: '',
        altezza:'',
        genere: '',
        fumatore: '',
        provincia: '',
        febbre: '',
        tosse: '',
        difficoltaRespiratorie: '',
        stanchezza: '',
        pressioneSangue: '',
        colesterolo: '',
        glucosio: '',
        mese:'',
        anno:''
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

        if (!formData.malattia.trim()) newErrors.malattia = 'Malattia è obbligatoria';

        if (!formData.eta) newErrors.eta = 'Età è obbligatoria';
        else if (isNaN(formData.eta) || formData.eta <= 0) newErrors.eta = 'Età deve essere un numero positivo';

        if (!formData.peso) newErrors.peso = 'Peso è obbligatorio';
        else if (isNaN(formData.peso) || formData.peso <= 0) newErrors.peso = 'Peso deve essere un numero positivo';

        if (!formData.altezza) newErrors.altezza = 'Altezza è obbligatoria';
        else if (isNaN(formData.altezza) || formData.altezza <= 0) newErrors.altezza = 'Altezza deve essere un numero positivo';

        if (!formData.colesterolo) newErrors.colesterolo = 'Colesterolo è obbligatorio';
        else if (isNaN(formData.colesterolo) || formData.colesterolo <= 0) newErrors.colesterolo = 'Colesterolo deve essere positivo';

        if (!formData.glucosio) newErrors.glucosio = 'Glucosio è obbligatorio';
        else if (isNaN(formData.glucosio) || formData.glucosio <= 0) newErrors.glucosio = 'Glucosio deve essere positivo';

        if (!formData.pressioneSangue.trim()) {
            newErrors.pressioneSangue = 'Pressione è obbligatoria';
        } else if (!/^\d{2,3}$/.test(formData.pressioneSangue)) {
            newErrors.pressioneSangue = 'La pressione massima deve essere un numero di 2 o 3 cifre (es. 120)';
        }
        ['genere', 'fumatore', 'febbre', 'tosse', 'difficoltaRespiratorie', 'stanchezza'].forEach(field => {
            if (!formData[field]) newErrors[field] = 'Seleziona un\'opzione';
        });

        if (!formData.macroarea) newErrors.macroarea = 'Seleziona una macroarea';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            console.log('Errori di validazione:', newErrors);
            return false;
        }

        return true;
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
                })
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
                <div className="options-container">
                    <button className="options" onClick={backHome}>Home</button>
                    <span> | </span>
                    <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                    <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                    <span> | </span>
                    <button className="options">Assistenza clienti 🚧</button>
                    <span> | </span>
                    <button className="options" onClick={logout}>Logout</button>
                </div>
            </header>
            <div className="container fade-in">
                <h1>Dati del paziente</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="grid grid-cols-3 gap-4">
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

                        <div className="form-group">
                            <label htmlFor="peso">Peso in kg</label>
                            <input
                                type="text"
                                id="peso"
                                name="peso"
                                value={formData.peso}
                                onChange={handleInputChange}
                                placeholder="Es. 73.0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="altezza">Altezza in cm</label>
                            <input
                                type="text"
                                id="altezza"
                                name="altezza"
                                value={formData.altezza}
                                onChange={handleInputChange}
                                placeholder="Es. 175.0"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                            <label>Genere</label>
                            <div className="radio-group" >
                                <div className="radio-option">
                                    <input
                                        type="radio"
                                        id="m"
                                        name="genere"
                                        value="M"
                                        data-testid="genere-M"
                                        checked={formData.genere === "M"}
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
                                        data-testid="genere-F"
                                        checked={formData.genere === "F"}
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
                                        data-testid="fumatore-Si"
                                        checked={formData.fumatore === "Si"}
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
                                        data-testid="fumatore-No"
                                        checked={formData.fumatore === "No"}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="fumatore-no">No</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="macroarea">Macroarea</label>
                            <select
                                className="form-select"
                                id="macroarea"
                                name="macroarea"
                                value={formData.macroarea}
                                onChange={handleInputChange}
                            >
                                <option disabled value="">
                                    Seleziona...
                                </option>
                                <option value="Nord">Nord</option>
                                <option value="Centro">Centro</option>
                                <option value="Sud">Sud</option>
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
                                            data-testid="febbre-Si"
                                            checked={formData.febbre === "Si"}
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
                                            data-testid="febbre-No"
                                            checked={formData.febbre === "No"}
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
                                            data-testid="tosse-Si"
                                            checked={formData.tosse === "Si"}
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
                                            data-testid="tosse-No"
                                            checked={formData.tosse === "No"}
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
                                            data-testid="difficoltaRespiratorie-Si"
                                            checked={formData.difficoltaRespiratorie === "Si"}
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
                                            data-testid="difficoltaRespiratorie-No"
                                            checked={formData.difficoltaRespiratorie === "No"}
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
                                            data-testid="stanchezza-Si"
                                            checked={formData.stanchezza === "Si"}
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
                                            data-testid="stanchezza-No"
                                            checked={formData.stanchezza === "No"}
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
                                    placeholder="Massima"
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
