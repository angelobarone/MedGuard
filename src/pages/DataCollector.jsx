import '../stylesheet/App.css'
import {Form, useNavigate} from "react-router-dom";
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

    encPayload.provincia = formData.provincia;
    encPayload.malattia = formData.malattia;

    const oggi = new Date();
    const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    encPayload.mese = nomiMesi[oggi.getMonth()];
    encPayload.anno = oggi.getFullYear();

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

        // Validazione testo/numeri
        if (!formData.malattia.trim()) newErrors.malattia = 'Campo obbligatorio';
        if (!formData.eta) newErrors.eta = 'Campo obbligatorio';
        if (!formData.peso) newErrors.peso = 'Campo obbligatorio';
        if (!formData.altezza) newErrors.altezza = 'Campo obbligatorio';
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
                <button className="options" onClick={backHome}>Home</button>
                <span style={{ marginLeft: '15px' }}>Logged in as: </span>
                <button className="user options" style={{margin: '0px', marginRight: '15px'}}>{clinic} 🚧</button>
                <button className="options">Assistenza clienti 🚧</button>
                <button className="options" onClick={logout}>Logout</button>
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
                            <label htmlFor="altezza">Altezza in metri</label>
                            <input
                                type="text"
                                id="altezza"
                                name="altezza"
                                value={formData.altezza}
                                onChange={handleInputChange}
                                placeholder="Es. 1.75"
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
                                <option value="AG">Agrigento</option>
                                <option value="AL">Alessandria</option>
                                <option value="AN">Ancona</option>
                                <option value="AO">Aosta</option>
                                <option value="AR">Arezzo</option>
                                <option value="AP">Ascoli Piceno</option>
                                <option value="AT">Asti</option>
                                <option value="AV">Avellino</option>
                                <option value="BA">Bari</option>
                                <option value="BT">Barletta-Andria-Trani</option>
                                <option value="BL">Belluno</option>
                                <option value="BN">Benevento</option>
                                <option value="BG">Bergamo</option>
                                <option value="BI">Biella</option>
                                <option value="BO">Bologna</option>
                                <option value="BZ">Bolzano</option>
                                <option value="BS">Brescia</option>
                                <option value="BR">Brindisi</option>
                                <option value="CA">Cagliari</option>
                                <option value="CL">Caltanissetta</option>
                                <option value="CB">Campobasso</option>
                                <option value="CE">Caserta</option>
                                <option value="CZ">Catanzaro</option>
                                <option value="CH">Chieti</option>
                                <option value="CO">Como</option>
                                <option value="CS">Cosenza</option>
                                <option value="CR">Cremona</option>
                                <option value="KR">Crotone</option>
                                <option value="CN">Cuneo</option>
                                <option value="EN">Enna</option>
                                <option value="FM">Fermo</option>
                                <option value="FE">Ferrara</option>
                                <option value="FI">Firenze</option>
                                <option value="FG">Foggia</option>
                                <option value="FC">Forlì-Cesena</option>
                                <option value="FR">Frosinone</option>
                                <option value="GE">Genova</option>
                                <option value="GO">Gorizia</option>
                                <option value="GR">Grosseto</option>
                                <option value="IM">Imperia</option>
                                <option value="IS">Isernia</option>
                                <option value="AQ">L'Aquila</option>
                                <option value="SP">La Spezia</option>
                                <option value="LT">Latina</option>
                                <option value="LE">Lecce</option>
                                <option value="LC">Lecco</option>
                                <option value="LI">Livorno</option>
                                <option value="LO">Lodi</option>
                                <option value="LU">Lucca</option>
                                <option value="MC">Macerata</option>
                                <option value="MN">Mantova</option>
                                <option value="MS">Massa-Carrara</option>
                                <option value="MT">Matera</option>
                                <option value="ME">Messina</option>
                                <option value="MI">Milano</option>
                                <option value="MO">Modena</option>
                                <option value="MB">Monza e Brianza</option>
                                <option value="NA">Napoli</option>
                                <option value="NO">Novara</option>
                                <option value="NU">Nuoro</option>
                                <option value="OR">Oristano</option>
                                <option value="PD">Padova</option>
                                <option value="PA">Palermo</option>
                                <option value="PR">Parma</option>
                                <option value="PV">Pavia</option>
                                <option value="PG">Perugia</option>
                                <option value="PU">Pesaro e Urbino</option>
                                <option value="PE">Pescara</option>
                                <option value="PC">Piacenza</option>
                                <option value="PI">Pisa</option>
                                <option value="PT">Pistoia</option>
                                <option value="PN">Pordenone</option>
                                <option value="PZ">Potenza</option>
                                <option value="PO">Prato</option>
                                <option value="RG">Ragusa</option>
                                <option value="RA">Ravenna</option>
                                <option value="RC">Reggio Calabria</option>
                                <option value="RE">Reggio Emilia</option>
                                <option value="RI">Rieti</option>
                                <option value="RN">Rimini</option>
                                <option value="RM">Roma</option>
                                <option value="RO">Rovigo</option>
                                <option value="SA">Salerno</option>
                                <option value="SS">Sassari</option>
                                <option value="SV">Savona</option>
                                <option value="SI">Siena</option>
                                <option value="SR">Siracusa</option>
                                <option value="SO">Sondrio</option>
                                <option value="SU">Sud Sardegna</option>
                                <option value="TA">Taranto</option>
                                <option value="TE">Teramo</option>
                                <option value="TR">Terni</option>
                                <option value="TO">Torino</option>
                                <option value="TP">Trapani</option>
                                <option value="TN">Trento</option>
                                <option value="TV">Treviso</option>
                                <option value="TS">Trieste</option>
                                <option value="UD">Udine</option>
                                <option value="VA">Varese</option>
                                <option value="VE">Venezia</option>
                                <option value="VB">Verbano-Cusio-Ossola</option>
                                <option value="VC">Vercelli</option>
                                <option value="VR">Verona</option>
                                <option value="VV">Vibo Valentia</option>
                                <option value="VI">Vicenza</option>
                                <option value="VT">Viterbo</option>
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
