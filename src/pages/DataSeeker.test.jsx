import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataSeeker from '@/pages/DataSeeker.jsx'
import { MemoryRouter, Routes, Route } from "react-router-dom";
import * as paillier from "paillier-bigint";
import {decryptPaillierValue, encryptPaillierValue} from "@/utils.js";

const { publicKey, privateKey } = paillier.generateRandomKeysSync(64);

function fixedPoint(xStr){
    const [a,b = ''] = String(xStr).trim().split('.');
    const frac = (b + '00').slice(0,2);
    return BigInt(a) * 100n + BigInt(frac);
}

function sum_values (values, n){
    const return_values = {
        malattia: "",
        eta_sum: 0,
        peso_sum: 0,
        altezza_sum: 0,
        pressione_sum: 0,
        colesterolo_sum: 0,
        glucosio_sum: 0,
        genere_sum: 0,
        fumatore_sum: 0,
        febbre_sum: 0,
        tosse_sum: 0,
        difficolta_sum: 0,
        stanchezza_sum: 0,
        macroarea: ""
    }
    let eta_sum = 0;
    let peso_sum = 0;
    let altezza_sum = 0;
    let pressioneSangue_sum = 0;
    let colesterolo_sum = 0;
    let glucosio_sum = 0;
    for (let i = 0; i < n; i++) {
        eta_sum += Number(values.eta);
        peso_sum += Number(values.peso);
        altezza_sum += Number(values.altezza);
        pressioneSangue_sum += Number(values.pressioneSangue);
        colesterolo_sum += Number(values.colesterolo);
        glucosio_sum += Number(values.glucosio);
    }
    return_values.eta_sum = eta_sum.toString();
    return_values.peso_sum = peso_sum.toString();
    return_values.altezza_sum = altezza_sum.toString();
    return_values.pressione_sum = pressioneSangue_sum.toString();
    return_values.colesterolo_sum = colesterolo_sum.toString();
    return_values.glucosio_sum = glucosio_sum.toString();
    return_values.fumatore_sum = "0";
    return_values.febbre_sum = "0";
    return_values.tosse_sum = "0";
    return_values.difficolta_sum = "0";
    return_values.stanchezza_sum = "0";
    return_values.genere_sum = "0";
    return_values.malattia = values.malattia;
    return_values.macroarea = values.macroarea;
    return return_values;
}
test('Correttezza ed efficienza del modulo di decifrazione dei dati aggregati su input crescente', async () => {

    const clear_values = {
        malattia: "asma",
        eta: "35",
        peso: "70",
        altezza: "175",
        pressioneSangue: "120",
        colesterolo: "180",
        glucosio: "90",
        genere: "M",
        fumatore: "no",
        febbre: "no",
        tosse: "no",
        difficoltaRespiratorie: "no",
        stanchezza: "no",
        macroarea: "Nord",
    };

    //100 valori aggregati
    const clear_values100 = sum_values(clear_values, 100)

    // Definisco diverse dimensioni di test (numero di row nel database)
    const sizes = [1, 10, 50, 100]; // numero di record duplicati

    for (const size of sizes) {
        const sizeArray = [];
        // Creo un array di oggetti clear_values duplicati
        for (let i = 0; i < size; i++){
            sizeArray.push(clear_values100);
        }
        const encryptedArray = [];
        // Cifro tutti i valori con la chiave pubblica
        for(const thisValues of sizeArray){
            encryptedArray.push({
                malattia: thisValues.malattia,
                eta_sum: await encryptPaillierValue(thisValues.eta_sum, publicKey),
                peso_sum: await encryptPaillierValue(thisValues.peso_sum, publicKey),
                altezza_sum: await encryptPaillierValue(thisValues.altezza_sum, publicKey),
                pressione_sum: await encryptPaillierValue(thisValues.pressione_sum, publicKey),
                colesterolo_sum: await encryptPaillierValue(thisValues.colesterolo_sum, publicKey),
                glucosio_sum: await encryptPaillierValue(thisValues.glucosio_sum, publicKey),
                genere_sum: await encryptPaillierValue(thisValues.genere_sum, publicKey),
                fumatore_sum: await encryptPaillierValue(thisValues.fumatore_sum, publicKey),
                febbre_sum: await encryptPaillierValue(thisValues.febbre_sum, publicKey),
                tosse_sum: await encryptPaillierValue(thisValues.tosse_sum, publicKey),
                difficolta_sum: await encryptPaillierValue(thisValues.difficolta_sum, publicKey),
                stanchezza_sum: await encryptPaillierValue(thisValues.stanchezza_sum, publicKey),
                macroarea: thisValues.macroarea,
            });
        }
        const startTime = performance.now();

        for (const encrypted_values of encryptedArray) {
            for (const key in encrypted_values) {
                let decrypted = "";
                if (key === "malattia"){
                    decrypted = encrypted_values[key];
                }
                else
                    if(key === "macroarea"){
                        decrypted = encrypted_values[key];
                    }
                    else{
                        decrypted = await decryptPaillierValue(encrypted_values[key], privateKey);
                        expect(decrypted.toString()).toBe(clear_values100[key]);
                    }
            }
        }
        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log(`Input size: ${size} record(s) -> Tempo totale: ${duration.toFixed(2)} ms, Tempo medio per record: ${(duration / size).toFixed(2)} ms`);
    }
});