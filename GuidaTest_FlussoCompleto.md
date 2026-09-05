# Guida Generale di Collaudo End-to-End (EduBook)

Questa guida illustra il percorso completo per collaudare tutte le funzionalità realizzate negli **Sprint 1, 2, 3 e 4**.
I test sono organizzati in **ordine cronologico e logico**: dal setup iniziale del professore, alla creazione delle disponibilità, alla prenotazione da parte dello studente guest, fino alla gestione operativa, comunicazioni, profilo e manutenzione.

---

## 0. Informazioni & Dati di Accesso Preimpostati

- **Server Locale**: `http://localhost:3000` (avviare con `npm run dev`)
- **Account Professore / Admin**:
  - **Email**: `gabri@example.com`
  - **Password**: `PredefinedPassword123!`
  - **Ruolo**: `admin`
- **Profilo Studente di Test (Guest)**:
  - **Nome**: `Mario Rossi`
  - **Email**: `mario.rossi.test@example.com`
  - **Materia**: `Matematica`
  - **Note**: `Ripasso su derivate e integrali definiti`
- **Reset DB**:
  - Il DB è già stato azzerato tramite lo script `scripts/reset_test_db.sql` (tabella `lessons` e `contacts` vuote, account docente configurato).

---

## 1. Fase 1: Accesso Docente & Esplorazione Dashboard Vuota

1. Aprire il browser su `http://localhost:3000`.
2. Cliccare su **"Accedi"** nella navbar in alto a destra (oppure andare su `http://localhost:3000/?auth=login`).
3. Inserire le credenziali del professore:
   - Email: `gabri@example.com`
   - Password: `PredefinedPassword123!`
4. Premere **"Accedi"**.
5. **Verifica attesa**:
   - Reindirizzamento automatico su `http://localhost:3000/dashboard`.
   - Nella navbar compare il badge docente, il pulsante **"Profilo"** e il pulsante **"Esci"**.
   - Le schede statistiche mostrano:
     - Lezioni Totali: `0`
     - Da Confermare: `0`
     - Confermate: `0`
     - Rifiutate / Cancellate: `0`
   - Il tab "In Attesa" mostra il placeholder *"Nessuna lezione in attesa di conferma"*.
   - Il tab "Messaggi" mostra il badge `(0)`.

---

## 2. Fase 2: Creazione Slot di Disponibilità (Docente)

1. Nella pagina `http://localhost:3000/dashboard`, cliccare sul pulsante **"Aggiungi Slot"** in alto a destra.
2. Si apre la finestra di dialogo *"Aggiungi Disponibilità"*.

### Test 2.1: Creazione Singolo Slot (Domani)
- **Data Inizio**: Selezionare il giorno di **domani**.
- **Ora Inizio**: `15:00`
- **Data Fine**: Selezionare lo stesso giorno (domani).
- **Ora Fine**: `16:00`
- **Ricorrenza**: Lasciare su *"Nessuna (slot singolo)"*.
- Cliccare su **"Salva Slot"**.
- **Verifica attesa**:
  - Toast di successo: *"1 slot di disponibilità creati con successo"*.
  - Nel tab *"Slot Liberi"* compare 1 slot per domani dalle 15:00 alle 16:00 con stato **"Libero"**.
  - La card "Lezioni Totali" si aggiorna a `1`.

### Test 2.2: Creazione Slot con Ricorrenza Settimanale (Mega-Slot o Finestra Lunga)
- Cliccare di nuovo su **"Aggiungi Slot"**.
- **Data Inizio**: Dopodomani (es. 2 giorni da oggi).
- **Ora Inizio**: `09:00`
- **Data Fine**: Stesso giorno.
- **Ora Fine**: `12:00` (finestra ampia di 3 ore).
- **Ricorrenza**: Selezionare *"Settimanale (stesso giorno e orario)"*.
- **Ripeti per**: `3` settimane.
- Cliccare su **"Salva Slot"**.
- **Verifica attesa**:
  - Toast di successo: *"3 slot di disponibilità creati con successo"*.
  - Nel tab *"Slot Liberi"* compaiono gli slot creati per le prossime 3 settimane.

---

## 3. Fase 3: Prenotazione di una Lezione (Studente Guest)

> **Nota**: Per testare realisticamente il flusso da studente, aprire una finestra **in incognito** oppure effettuare il logout.

1. Da una finestra di navigazione in incognito, aprire `http://localhost:3000/prenota`.
2. **Consultazione Calendario**:
   - Spostarsi sul mese corrente.
   - I giorni con disponibilità creata nella Fase 2 appaiono evidenziati con un punto colorato.
   - Cliccare sulla data di **domani**.
3. **Selezione Orario**:
   - A destra compare lo slot `15:00 - 16:00`.
   - Cliccare sullo slot per selezionarlo.
4. **Compilazione Form di Prenotazione**:
   - **Nome Completo**: `Mario Rossi`
   - **Email**: `mario.rossi.test@example.com`
   - **Materia**: Selezionare `Matematica`.
   - **Note aggiuntive**: `Ho difficoltà con lo studio di funzione e integrali.`
   - **Verifica Cloudflare Turnstile**: Completare il captcha (in ambiente locale con test keys si valida istantaneamente).
5. Cliccare su **"Invia Prenotazione"**.
6. **Verifica attesa**:
   - Reindirizzamento immediato alla pagina di conferma e gestione: `http://localhost:3000/gestisci/[id-lezione]`.
   - Banner con avviso: *"Stato: In Attesa di Conferma"*.
   - Dettagli visualizzati: Data e ora (`15:00 - 16:00`), Materia `Matematica`, Docente `Prof. Gabriele Farigu`.
   - È presente il pulsante *"Annulla Prenotazione"* e l'avviso che il link può essere salvato per ricontrollare lo stato.

---

## 4. Fase 4: Gestione e Approvazione della Lezione (Docente)

1. Tornare alla finestra dove è aperta la sessione del professore (`http://localhost:3000/dashboard`).
2. Ricaricare la pagina o navigare sulla dashboard.
3. **Verifica delle Statistiche**:
   - La card **"Da Confermare"** è ora a `1`.
4. Cliccare sul tab **"In Attesa"**:
   - Compare la card della lezione di `Mario Rossi` (`mario.rossi.test@example.com`), materia *Matematica*, con le note dello studente.
5. Cliccare sul pulsante **"Conferma"** (icona spunta verde):
   - Compare il modale di conferma: *"Sei sicuro di voler confermare la lezione con Mario Rossi?"*.
   - Cliccare su **"Sì, Conferma"**.
6. **Verifica attesa**:
   - Toast: *"Lezione confermata con successo"*.
   - La lezione scompare da "In Attesa" e si sposta nel tab **"Confermate"**.
   - Nella card della lezione confermata compare il pulsante **"Aggiungi a Google Calendar"**.
   - Cliccando su *"Aggiungi a Google Calendar"*, si apre una nuova scheda con Google Calendar precompilato con data, ora, materia e nome dello studente.

---

## 5. Fase 5: Riprogrammazione Lezione (Studente & Docente)

### Test 5.1: Richiesta Spostamento da parte dello Studente
1. Nella finestra in incognito dello studente (`http://localhost:3000/gestisci/[id]`), ricaricare la pagina.
2. Lo stato della lezione ora è **"Confermata"** (badge verde).
3. Compare il pulsante **"Richiedi Spostamento"**. Cliccarlo.
4. Inserire la motivazione: *"Imprevisto scolastico, chiedo se possibile posticipare di 1 ora"*.
5. Inviare la richiesta.
6. **Verifica attesa**:
   - Lo stato indica *"Richiesta di spostamento inviata"*.

### Test 5.2: Gestione Riprogrammazione da Dashboard Docente
1. Tornare su `http://localhost:3000/dashboard` come docente.
2. Nel tab **"Confermate"**, individuare la lezione di Mario Rossi.
3. Cliccare sul pulsante **"Modifica / Riprogramma"** (icona orologio o matita).
4. Nel dialog di modifica:
   - Selezionare il nuovo orario: `16:00 - 17:00`.
   - Cliccare su **"Aggiorna Orario"**.
5. **Verifica attesa**:
   - Toast: *"Orario della lezione aggiornato"*.
   - La lezione mostra ora il nuovo orario `16:00 - 17:00`.

---

## 6. Fase 6: Invio e Gestione Messaggi Contatti

1. Nella finestra incognito, andare alla pagina `http://localhost:3000/contatti`.
2. Compilare il modulo:
   - **Nome**: `Luigi Bianchi`
   - **Email**: `luigi.bianchi@example.com`
   - **Oggetto**: `Informazioni su lezioni di Fisica`
   - **Messaggio**: `Buongiorno Professore, vorrei sapere se effettua anche lezioni per preparazione test universitari di Fisica.`
   - **Consenso Privacy**: Selezionare la casella obbligatoria *"Accetto l'informativa sulla privacy"*.
   - Completare il captcha Turnstile.
3. Cliccare su **"Invia Messaggio"**.
4. **Verifica attesa**:
   - Messaggio di conferma a video: *"Messaggio inviato con successo! Ti risponderemo al più presto."*.
5. Tornare alla dashboard docente (`http://localhost:3000/dashboard`).
6. Cliccare sul tab **"Messaggi"**:
   - Il badge ora mostra `(1)`.
   - Nella lista compare il messaggio di Luigi Bianchi con data, email e testo.
7. Cliccare sull'icona **"Cestino"** (elimina messaggio) e confermare:
   - Toast: *"Messaggio eliminato con successo"*.
   - Il messaggio scompare dalla lista e il contatore torna a `(0)`.

---

## 7. Fase 7: Gestione Profilo Docente & Badge Dinamici (TC-26)

1. Dal menu della navbar docente in alto a destra, cliccare su **"Profilo"** (oppure andare su `http://localhost:3000/dashboard/profilo`).
2. **Modifica Informazioni e Titolo**:
   - **Nome**: `Gabriele`
   - **Cognome**: `Farigu`
   - **Qualifica / Sottotitolo Professionale**: `Docente di Scienze Matematiche & Fisiche` (oppure qualsiasi titolo a scelta).
   - **Email Pubblica & Notifiche**: `gabriele@edubook.it`
   - **Biografia**: `Docente specializzato in Matematica, Fisica e Preparazione Esami di Stato.`
3. **Gestione Materie (CRUD Completo & Badge Interattivi)**:
   - Nelle materie attuali sono presenti i badge con controlli dedicati.
   - **Modifica/Rinomina in linea**: Cliccare sull'icona della matita accanto a una materia (es. `Analisi 1`), modificarne il testo (es. in `Analisi Matematica I`) e cliccare sulla spunta verde (o premere Invio) per confermare.
   - **Eliminazione**: Cliccare sulla `X` accanto a una materia per rimuoverla.
   - **Aggiunta**: Nel campo *"Aggiungi nuova materia"*, digitare `Chimica Generale` e premere Invio o il pulsante **"Aggiungi"** (oppure cliccare su uno dei suggerimenti rapidi in basso).
4. Cliccare su **"Salva Modifiche Profilo"**.
5. **Verifica attesa**:
   - Toast verde: *"Profilo e materie aggiornati con successo!"*.
6. Andare sulla Homepage pubblica `http://localhost:3000/`:
   - Nella sezione Hero compare la nuova qualifica professionale impostata.
   - Nella sezione *"Materie Trattate"* compaiono le materie aggiornate e rinominate.
   - La biografia aggiornata è visibile correttamente.

---

## 8. Fase 8: Verifica Privacy Policy & Cron Cleanup (TC-28)

### Test 8.1: Privacy Policy GDPR
1. Andare su `http://localhost:3000/privacy`.
2. Verificare che la pagina sia consultabile pubblicamente:
   - Dati del titolare del trattamento.
   - Tipologie di dati raccolti (prenotazioni, modulo contatti, cookie tecnici).
   - Diritti dell'utente GDPR (accesso, rettifica, cancellazione).

### Test 8.2: Verifica Esecuzione Cleanup Sistema (TC-28)
È possibile verificare il cleanup in due modalità semplici e immediate:

- **Metodo 1 (Consigliato - 1 Click da Dashboard)**:
  1. Andare su `http://localhost:3000/dashboard`.
  2. Nella colonna sinistra della dashboard è presente la card **"Manutenzione Sistema"**.
  3. Cliccare sul pulsante **"Esegui Cleanup (TC-28)"**.
  4. Compare un toast di conferma con il report istantaneo: *"Cleanup completato con successo: X lezioni scadute annullate, Y slot passati rimossi"*.

- **Metodo 2 (Via Browser o API)**:
  1. Aprire una nuova scheda del browser all'indirizzo `http://localhost:3000/api/cron/cleanup` (o eseguire da terminale `Invoke-RestMethod -Uri "http://localhost:3000/api/cron/cleanup"`).
  2. Risposta JSON immediata:
     ```json
     {"success": true, "message": "Cleanup completed", "cancelledExpired": 0, "deletedSlots": 0}
     ```

---

## 9. Fase 9: Logout

1. Dalla dashboard docente (`http://localhost:3000/dashboard`), cliccare sul pulsante **"Esci"** nella navbar.
2. **Verifica attesa**:
   - Logout completato con successo.
   - Reindirizzamento alla homepage `http://localhost:3000`.
   - La navbar torna a mostrare il pulsante **"Accedi"**.
   - Se si tenta di accedere direttamente a `http://localhost:3000/dashboard`, il middleware reindirizza automaticamente alla home con query `?auth=login`.
