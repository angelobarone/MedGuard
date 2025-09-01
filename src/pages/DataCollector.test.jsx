import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {afterEach, beforeEach, expect, test, vi} from "vitest";
import "@testing-library/jest-dom";
import DataCollector from "./DataCollector";
import * as paillier from "paillier-bigint";

const { publicKey, privateKey } = paillier.generateRandomKeysSync(64);
let encrypted_values = {}

function effectivelyTest (clear_values, encData){
    expect(encData).toBeDefined();
    expect(encData.eta_sum).not.toEqual(clear_values.eta);
    encrypted_values.eta = encData.eta_sum;
    expect(encData.peso_sum).not.toEqual(clear_values.peso);
    encrypted_values.peso = encData.peso_sum;
    expect(encData.altezza_sum).not.toEqual(clear_values.altezza);
    encrypted_values.altezza = encData.altezza_sum;
    expect(encData.pressione_sum).not.toEqual(clear_values.pressioneSangue);
    encrypted_values.pressioneSangue = encData.pressione_sum;
    expect(encData.colesterolo_sum).not.toEqual(clear_values.colesterolo);
    encrypted_values.colesterolo = encData.colesterolo_sum;
    expect(encData.glucosio_sum).not.toEqual(clear_values.glucosio);
    encrypted_values.glucosio = encData.glucosio_sum;

    expect(encData.genere_sum).not.toEqual(clear_values.genere);
    encrypted_values.genere = encData.genere_sum;
    expect(encData.fumatore_sum).not.toEqual(clear_values.fumatore);
    encrypted_values.fumatore = encData.fumatore_sum;
    expect(encData.febbre_sum).not.toEqual(clear_values.febbre);
    encrypted_values.febbre = encData.febbre_sum;
    expect(encData.tosse_sum).not.toEqual(clear_values.tosse);
    encrypted_values.tosse = encData.tosse_sum;
    expect(encData.difficolta_sum).not.toEqual(clear_values.difficoltaRespiratorie);
    encrypted_values.difficoltaRespiratorie = encData.difficolta_sum;
    expect(encData.stanchezza_sum).not.toEqual(clear_values.stanchezza);
    encrypted_values.stanchezza = encData.stanchezza_sum;

    expect(encData.macroarea).toBe(clear_values.macroarea);
    encrypted_values.macroarea = encData.macroarea;
    expect(encData.malattia).toBe(clear_values.malattia);
    encrypted_values.malattia = encData.malattia;

    const decrypted_values = {
        malattia: encrypted_values.malattia,
        eta: privateKey.decrypt(BigInt("0x" + encrypted_values.eta)).toString(),
        peso: (privateKey.decrypt(BigInt("0x" + encrypted_values.peso))/100n).toString(),
        altezza: (privateKey.decrypt(BigInt("0x" + encrypted_values.altezza))/100n).toString(),
        pressioneSangue: (privateKey.decrypt(BigInt("0x" + encrypted_values.pressioneSangue))/100n).toString(),
        colesterolo: (privateKey.decrypt(BigInt("0x" + encrypted_values.colesterolo))/100n).toString(),
        glucosio: (privateKey.decrypt(BigInt("0x" + encrypted_values.glucosio))/100n).toString(),
        genere: privateKey.decrypt(BigInt("0x" + encrypted_values.genere)) === 0n ? "M" : "F",
        fumatore: privateKey.decrypt(BigInt("0x" + encrypted_values.fumatore)) === 0n ? "si" : "no",
        febbre: privateKey.decrypt(BigInt("0x" + encrypted_values.febbre)) === 0n ? "si" : "no",
        tosse: privateKey.decrypt(BigInt("0x" + encrypted_values.tosse)) === 0n ? "si" : "no",
        difficoltaRespiratorie: privateKey.decrypt(BigInt("0x" + encrypted_values.difficoltaRespiratorie)) === 0n ? "si" : "no",
        stanchezza: privateKey.decrypt(BigInt("0x" + encrypted_values.stanchezza)) === 0n ? "si" : "no",
        macroarea: encrypted_values.macroarea,
    }


    expect(decrypted_values.malattia).toEqual(clear_values.malattia);
    expect(decrypted_values.eta).toEqual(clear_values.eta);
    expect(decrypted_values.peso).toEqual(clear_values.peso);
    expect(decrypted_values.altezza).toEqual(clear_values.altezza);
    expect(decrypted_values.pressioneSangue).toEqual(clear_values.pressioneSangue);
    expect(decrypted_values.colesterolo).toEqual(clear_values.colesterolo);
    expect(decrypted_values.glucosio).toEqual(clear_values.glucosio);
    expect(decrypted_values.genere).toEqual(clear_values.genere);
    expect(decrypted_values.fumatore).toEqual(clear_values.fumatore);
    expect(decrypted_values.febbre).toEqual(clear_values.febbre);
    expect(decrypted_values.tosse).toEqual(clear_values.tosse);
    expect(decrypted_values.difficoltaRespiratorie).toEqual(clear_values.difficoltaRespiratorie);
    expect(decrypted_values.stanchezza).toEqual(clear_values.stanchezza);
    expect(decrypted_values.macroarea).toEqual(clear_values.macroarea);

    return {
        campo: "DATI ORIGINALI" + " -> " + "DATI CIFRATI" + " -> " + "DATI DECIFRATI (solo per test)",
        malattia: clear_values.malattia + " -> " + encrypted_values.malattia + " -> " + decrypted_values.malattia,
        eta: clear_values.eta + " -> " + encrypted_values.eta + " -> " + decrypted_values.eta,
        peso: clear_values.peso + " -> " + encrypted_values.peso + " -> " + decrypted_values.peso,
        altezza: clear_values.altezza + " -> " + encrypted_values.altezza + " -> " + decrypted_values.altezza,
        pressioneSangue: clear_values.pressioneSangue + " -> " + encrypted_values.pressioneSangue + " -> " + decrypted_values.pressioneSangue,
        colesterolo: clear_values.colesterolo + " -> " + encrypted_values.colesterolo + " -> " + decrypted_values.colesterolo,
        glucosio: clear_values.glucosio + " -> " + encrypted_values.glucosio + " -> " + decrypted_values.glucosio,
        genere: clear_values.genere + " -> " + encrypted_values.genere + " -> " + decrypted_values.genere,
        fumatore: clear_values.fumatore + " -> " + encrypted_values.fumatore + " -> " + decrypted_values.fumatore,
        febbre: clear_values.febbre + " -> " + encrypted_values.febbre + " -> " + decrypted_values.febbre,
        tosse: clear_values.tosse + " -> " + encrypted_values.tosse + " -> " + decrypted_values.tosse,
        difficoltaRespiratorie: clear_values.difficoltaRespiratorie + " -> " + encrypted_values.difficoltaRespiratorie + " -> " + decrypted_values.difficoltaRespiratorie,
        stanchezza: clear_values.stanchezza + " -> " + encrypted_values.stanchezza + " -> " + decrypted_values.stanchezza,
        macroarea: clear_values.macroarea + " -> " + encrypted_values.macroarea + " -> " + decrypted_values.macroarea,
    };
}

describe("L'utente inserisce dati validi e il client provvede a cifrarli e inviarli al server", () => {

    beforeEach(() => {
        global.alert = vi.fn();
        sessionStorage.setItem(
            "publicKey",
            JSON.stringify({ n: publicKey.n.toString(), g: publicKey.g.toString() })
        );
        sessionStorage.setItem("username", "clinicTest");

        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            })
        );

        encrypted_values = {
            malattia: "",
            eta: "",
            peso: "",
            altezza: "",
            pressioneSangue: "",
            colesterolo: "",
            glucosio: "",
            genere: "",
            fumatore: "",
            febbre: "",
            tosse: "",
            difficoltaRespiratorie: "",
            stanchezza: "",
            macroarea: "",
        }
    });

    afterEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });


    test("Malattia Vuota", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Età Vuota", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Età Negativa/zero", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "-35",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Peso Vuoto", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Peso Negativo", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "-70",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Altezza Vuota", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Altezza Negativa", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "-175",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Colesterolo Vuoto", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "",
            glucosio: "90",
            genere: "M",
            fumatore: "no",
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Colesterolo Negativo", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "-180",
            glucosio: "90",
            genere: "M",
            fumatore: "no",
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Glucosio Vuoto", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "180",
            glucosio: "",
            genere: "M",
            fumatore: "no",
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Glucosio Negativo", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "180",
            glucosio: "-90",
            genere: "M",
            fumatore: "no",
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Pressione Vuota", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Pressione formato errato", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120/99",
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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Genere non selezionato", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "180",
            glucosio: "90",
            genere: null,
            fumatore: "no",
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Fumatore non selezionato", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

        const clear_values = {
            malattia: "asma",
            eta: "35",
            peso: "70",
            altezza: "175",
            pressioneSangue: "120",
            colesterolo: "180",
            glucosio: "90",
            genere: "M",
            fumatore: null,
            febbre: "no",
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Febbre non selezionato", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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
            febbre: null,
            tosse: "no",
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Tosse non selezionato", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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
            tosse: null,
            difficoltaRespiratorie: "no",
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Diffcoltà respiratorie non selezionata", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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
            difficoltaRespiratorie: null,
            stanchezza: "no",
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Stanchezza non selezionata", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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
            stanchezza: null,
            macroarea: "Nord",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Macroarea non selezionata", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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
            macroarea: "",
        };

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });

    test("Tutti i campi validi", async () => {

        render(
            <MemoryRouter>
                <DataCollector />
            </MemoryRouter>
        );

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

        fireEvent.change(screen.getByLabelText(/malattia/i), { target: { value: clear_values.malattia } });
        fireEvent.change(screen.getByLabelText(/età/i), { target: { value: clear_values.eta } });
        fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: clear_values.peso } });
        fireEvent.change(screen.getByLabelText(/altezza/i), { target: { value: clear_values.altezza } });
        fireEvent.change(screen.getByLabelText(/pressione/i), { target: { value: clear_values.pressioneSangue } });
        fireEvent.change(screen.getByLabelText(/colesterolo/i), { target: { value: clear_values.colesterolo } });
        fireEvent.change(screen.getByLabelText(/glucosio/i), { target: { value: clear_values.glucosio } });

        fireEvent.click(screen.getByTestId("genere-M"));
        fireEvent.click(screen.getByTestId("fumatore-Si"));
        fireEvent.click(screen.getByTestId("febbre-Si"));
        fireEvent.click(screen.getByTestId("tosse-No"));
        fireEvent.click(screen.getByTestId("difficoltaRespiratorie-Si"));
        fireEvent.click(screen.getByTestId("stanchezza-No"));

        fireEvent.change(screen.getByLabelText(/Macroarea/i), { target: { value: clear_values.macroarea } });

        fireEvent.submit(screen.getByRole("button", { name: /Cripta e Carica Dati/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        const bodySent = JSON.parse(global.fetch.mock.calls[0][1].body);
        const encData = bodySent.data;
        const log_values = effectivelyTest(clear_values, encData);
        console.log(log_values);
    });
})