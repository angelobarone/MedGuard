// Funzione di decrittazione pura
export async function decryptPaillierValue(encryptedHex, privateKey) {
    try {
        const hexString = encryptedHex.startsWith("0x")
            ? encryptedHex
            : `0x${encryptedHex}`;
        const encryptedBigInt = BigInt(hexString);

        return privateKey.decrypt(encryptedBigInt); // <-- restituisci BigInt, NON Number()
    } catch (error) {
        console.error(`Errore decrittazione valore ${encryptedHex}:`, error);
        throw new Error(`Formato non valido: ${encryptedHex?.toString().slice(0, 20)}...`);
    }
}

function bigintToHex(bi) {
    return bi.toString(16); // senza 0x
}

export async function encryptPaillierValue(value, publicKey) {
    const bigintValue = BigInt(value); // assicurati di usare BigInt
    const encrypted = publicKey.encrypt(bigintValue);
    return bigintToHex(encrypted); // ritorna stringa esadecimale
}