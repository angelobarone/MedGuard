# MedGuard - Frontend

Questo è il **frontend** del progetto universitario **MedGuard**, sviluppato per fornire un’interfaccia semplice attraverso cui i client possono:

- Inserire e cifrare dati sanitari
- Inviarli al server centrale
- Recuperare statistiche aggregate in forma cifrata/decrittata

## 🚀 Tecnologie
- **React** con Vite
- **CSS** per lo styling
- **Libreria Paillier** (per la cifratura lato client)

## ⚙️ Funzionalità principali
- Form per l’inserimento di dati sanitari di esempio
- Cifratura dei dati con la chiave pubblica ottenuta dal server delle chiavi
- Invio dei dati cifrati al backend
- Recupero dei dati cifrati dal server
- Decrittazione dei dati
- Visualizzazione dei risultati aggregati

## ▶️ Avvio locale
  npm install -
  npm run dev 

## 📚 Note
Il frontend è stato progettato a scopo dimostrativo per visualizzare il flusso di cifratura/decifratura, non è pensato per produzione.
