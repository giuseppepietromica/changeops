--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-2.pgdg120+1)
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-13 19:45:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET SESSION AUTHORIZATION 'pg_database_owner';

--
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA "public";


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


SET SESSION AUTHORIZATION 'pgvector_user';

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- TOC entry 216 (class 1259 OID 16555)
-- Name: agent_questions; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."agent_questions" (
    "agent_id" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "validation_prompt" "text" NOT NULL,
    "created_at" "date" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_rag_required" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 16562)
-- Name: agent_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."agent_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 217
-- Name: agent_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."agent_questions_id_seq" OWNED BY "public"."agent_questions"."id";


--
-- TOC entry 218 (class 1259 OID 16563)
-- Name: agent_sessions; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."agent_sessions" (
    "id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "descrizione" "text",
    "agent_id" bigint NOT NULL,
    "utente" "text" NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16568)
-- Name: agent_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."agent_sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 219
-- Name: agent_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."agent_sessions_id_seq" OWNED BY "public"."agent_sessions"."id";


--
-- TOC entry 220 (class 1259 OID 16569)
-- Name: agents; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."agents" (
    "name" "text" NOT NULL,
    "created_at" "date" NOT NULL,
    "id" integer NOT NULL,
    "description" "text"
);


--
-- TOC entry 221 (class 1259 OID 16574)
-- Name: agents_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."agents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 221
-- Name: agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."agents_id_seq" OWNED BY "public"."agents"."id";


--
-- TOC entry 222 (class 1259 OID 16575)
-- Name: answers; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."answers" (
    "id" integer NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "session_id" integer
);


--
-- TOC entry 223 (class 1259 OID 16580)
-- Name: answers_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."answers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 223
-- Name: answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."answers_id_seq" OWNED BY "public"."answers"."id";


--
-- TOC entry 224 (class 1259 OID 16581)
-- Name: cv_storage; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."cv_storage" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "text" "text",
    "metadata" "jsonb",
    "embedding" "public"."vector"
);


--
-- TOC entry 225 (class 1259 OID 16587)
-- Name: resource_dependencies; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."resource_dependencies" (
    "id" integer NOT NULL,
    "resource_id" integer NOT NULL,
    "dependency_name" character varying(255) NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 16590)
-- Name: resource_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."resource_dependencies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 226
-- Name: resource_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."resource_dependencies_id_seq" OWNED BY "public"."resource_dependencies"."id";


--
-- TOC entry 227 (class 1259 OID 16591)
-- Name: resource_field_values; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."resource_field_values" (
    "id" integer NOT NULL,
    "resource_field_id" integer NOT NULL,
    "possible_value" character varying(255) NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 16594)
-- Name: resource_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."resource_field_values_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 228
-- Name: resource_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."resource_field_values_id_seq" OWNED BY "public"."resource_field_values"."id";


--
-- TOC entry 229 (class 1259 OID 16595)
-- Name: resource_fields; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."resource_fields" (
    "id" integer NOT NULL,
    "resource_id" integer NOT NULL,
    "field_name" character varying(255) NOT NULL,
    "validation_rule" "text"
);


--
-- TOC entry 230 (class 1259 OID 16600)
-- Name: resource_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."resource_fields_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 230
-- Name: resource_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."resource_fields_id_seq" OWNED BY "public"."resource_fields"."id";


--
-- TOC entry 231 (class 1259 OID 16601)
-- Name: resources; Type: TABLE; Schema: public; Owner: pgvector_user
--

CREATE TABLE "public"."resources" (
    "id" integer NOT NULL,
    "resource_name" character varying(255) NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 16604)
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: pgvector_user
--

CREATE SEQUENCE "public"."resources_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 232
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pgvector_user
--

ALTER SEQUENCE "public"."resources_id_seq" OWNED BY "public"."resources"."id";


--
-- TOC entry 3327 (class 2604 OID 16605)
-- Name: agent_sessions id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."agent_sessions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."agent_sessions_id_seq"'::"regclass");


--
-- TOC entry 3328 (class 2604 OID 16606)
-- Name: agents id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."agents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."agents_id_seq"'::"regclass");


--
-- TOC entry 3329 (class 2604 OID 16607)
-- Name: answers id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."answers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."answers_id_seq"'::"regclass");


--
-- TOC entry 3331 (class 2604 OID 16608)
-- Name: resource_dependencies id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_dependencies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resource_dependencies_id_seq"'::"regclass");


--
-- TOC entry 3332 (class 2604 OID 16609)
-- Name: resource_field_values id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_field_values" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resource_field_values_id_seq"'::"regclass");


--
-- TOC entry 3333 (class 2604 OID 16610)
-- Name: resource_fields id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_fields" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resource_fields_id_seq"'::"regclass");


--
-- TOC entry 3334 (class 2604 OID 16611)
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resources" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resources_id_seq"'::"regclass");


--
-- TOC entry 3498 (class 0 OID 16555)
-- Dependencies: 216
-- Data for Name: agent_questions; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."agent_questions" ("agent_id", "question_text", "validation_prompt", "created_at", "id", "is_rag_required", "order") FROM stdin;
1	Inserisci il tuo ruolo in azienda nel periodo inerente la valutazione.	La risposta deve specificare in modo chiaro il ruolo ricoperto in azienda nel periodo di valutazione. Il ruolo deve essere coerente con una realtà aziendale del settore IT (es. Sviluppatore Backend, Project Manager, QA Engineer, Team Leader, DevOps Engineer, UI/UX Designer, Data Analyst, ecc.). Il testo deve contenere almeno due parole (es. "Team Leader") e non deve includere descrizioni vaghe o generiche (es. "impiegato", "collega", "operatore"). Sono accettati anche ruoli ibridi purché plausibili nel contesto di un'azienda informatica.	2025-09-05	393942b4-6af2-4a78-a313-2924b8504285	f	2
1	Inserisci il tipo di interazione o relazione lavorativa che hai avuto con la risorsa nel periodo inerente la valutazione. (es. responsabile diretto, responsabile di progetto, account di progetto, client manager, referente per il cliente)	La risposta deve descrivere chiaramente il tipo di interazione o relazione professionale avuta con la risorsa nel periodo di riferimento. Deve includere un ruolo o una posizione relazionale riconoscibile e coerente con il contesto aziendale IT (es. responsabile diretto, referente di progetto, account manager, project owner, client manager, coordinatore tecnico). Sono accettate anche formulazioni equivalenti se semanticamente compatibili (es. "ho supervisionato il suo lavoro nel team di sviluppo", "ho fatto da riferimento funzionale lato cliente"). La descrizione deve essere comprensibile, coerente e completa: risposte generiche come "collega", "lo conosco", "ci lavoriamo insieme" non sono sufficienti.	2025-09-05	d3cf77a0-0326-4c31-93a5-5f48fc5461ba	f	3
1	Capacità di realizzare un lavoro (Software, documentazione, presentazioni, etc) che soddisfa le aspettative e rispetta le best practice di settore e gli standard comunemente accettati.	Selezionare un valore tra: \n1. Sotto le aspettative\n2. In linea con le aspettative\n3. Sopra le aspettative\n4. Eccezionale\n5. Non valutabile\n\nRisposta:\nIl valore deve essere un numero intero tra 1 e 5.	2025-08-05	8d4fa815-28d2-4dc9-8ba7-ec94d05fb656	f	4
1	Partecipazione attiva, cooperazione e supporto, capacità di lavorare in team, disponibilità alla formazione di colleghi appartenenti allo stesso ambito	Il valore selezionato deve essere un numero intero tra 1 e 5.	2025-08-05	1c1abe9a-c221-4abd-9ad9-163ceb57a360	f	5
1	Quali sono le aree di miglioramento individuate per il 2025-2026	Le aree di miglioramento individuate per il 2025-2026 devono rispettare la seguente validazione: il campo non può essere vuoto e il testo deve avere una lunghezza compresa tra 20 e 1000 caratteri.	2025-08-05	1dc1b6a4-e22d-44db-b6ce-ec4eb97070d6	f	7
1	In cosa è migliorata nel corso del periodo di valutazione	La risposta alla domanda "In cosa è migliorata nel corso del periodo di valutazione" deve rispettare le seguenti validazioni:\n- Il campo non può essere vuoto.\n- Il testo deve avere una lunghezza compresa tra 20 e 1000 caratteri.	2025-08-05	1387b0e2-7453-4ab1-a673-cde9d5d1d027	f	6
1	Inserire una descrizione sintetica dei risultati raggiunti dalla risorsa in corso di valutazione nel periodo di valutazione	La descrizione dei risultati raggiunti deve avere una lunghezza compresa tra 20 e 1000 caratteri e non può essere vuota.	2025-08-05	03d149ab-3535-4d8e-ad62-41682fec9ca4	f	8
1	Nome e Cognome 	Il Nome e Cognome devono rispettare le seguenti regole di validazione: \n1. Il campo non può essere vuoto.\n2. Deve contenere almeno due parole separate da uno spazio.\n3. Deve contenere solo lettere e spazi.	2025-08-05	50d3537f-c21b-4581-84ba-139d7804d404	f	0
1	Nome e Cognome della persona da valutare	Il nome e cognome della persona da valutare deve rispettare i seguenti criteri:\n- Il campo non può essere vuoto.\n- Deve contenere almeno due parole separate da uno spazio.\n- Deve contenere solo lettere e spazi.	2025-09-05	58c12134-9ff8-4986-9664-ed11b4dcc988	f	1
\.


--
-- TOC entry 3500 (class 0 OID 16563)
-- Dependencies: 218
-- Data for Name: agent_sessions; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."agent_sessions" ("id", "nome", "descrizione", "agent_id", "utente") FROM stdin;
10	998877	test session	1	user@mail.coom
12	SurveySession	Esecuzione dell'agente Survey Deda 2025 per ottenere la lista delle domande.	1	user@example.com
\.


--
-- TOC entry 3502 (class 0 OID 16569)
-- Dependencies: 220
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."agents" ("name", "created_at", "id", "description") FROM stdin;
Surevey Deda 2025	2025-08-05	1	Agente per la valutazione delle performance dei dipendenti.
Agente Ricerca Profili	2025-05-13	2	Agente per la ricerca di profili professionali.
CV Import	2025-05-13	3	Agente per la creazione dei Curriculum Vitae
Agente SQL Interpreter	2025-05-13	4	Dialoga in linguaggio naturale con il database per eseguire operazioni strutturali e sui dati in modalità conversazionale.
AI Estimator	2025-05-13	5	Agente per le stime in function point
AI WIKI Creator	2025-05-13	6	Agente per la creazione di wiki da pubblicare nel repository aziendale
Agente RAG	2025-05-13	7	Ricerca tramite la chat contenuti specifici nel contesto documentale aziendale
Analisi e Stime delle WBS	2025-05-13	8	Agente che analizza i dati contenuti all'interno di una basedati e risponde alle richieste dell'utente.
\.


--
-- TOC entry 3504 (class 0 OID 16575)
-- Dependencies: 222
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."answers" ("id", "question", "answer", "question_id", "session_id") FROM stdin;
4	nome e cognome 	Giuseppe Pietromica	50d3537f-c21b-4581-84ba-139d7804d404	10
5	nome e cognome della persona da valutare	Silvia Pascucci	58c12134-9ff8-4986-9664-ed11b4dcc988	10
6	inserisci il tuo ruolo in azienda nel periodo inerente la valutazione.	Responsabile del gruppo Cloud Computing & Devops	393942b4-6af2-4a78-a313-2924b8504285	10
7	inserisci il tipo di interazione o relazione lavorativa che hai avuto con la risorsa nel periodo inerente la valutazione. (es. responsabile diretto, responsabile di progetto, account di progetto, client manager, referente per il cliente)	Ho supervisionato il lavoro su più attività per il progetto Corte dei conti in veste di supervisore dei processi funzionali ed esperto tecnico.	d3cf77a0-0326-4c31-93a5-5f48fc5461ba	10
8	capacità di realizzare un lavoro (software, documentazione, presentazioni, etc) che soddisfa le aspettative e rispetta le best practice di settore e gli standard comunemente accettati.	Silvia è una persona intraprendente e molto capace. Reputo le sue performance per quanto da me appurato sui progetti per i quali sono stato coinvolo in questo periodo in linea con le aspettative. In scala da 1 a 5 dare un 2 tendente al 3	8d4fa815-28d2-4dc9-8ba7-ec94d05fb656	10
9	partecipazione attiva, cooperazione e supporto, capacità di lavorare in team, disponibilità alla formazione di colleghi appartenenti allo stesso ambito	Silvia sa come lavorare in team, condivide, supporta i colleghi, è sempre disponibile. In scala da 1 a 5 darei un 3	1c1abe9a-c221-4abd-9ad9-163ceb57a360	10
10	in cosa è migliorata nel corso del periodo di valutazione	Silvia ha ampliato le sue capacità professionali e tecniche. Di conseguenza la produttività e qualità del suo lavoro è notevolmente migliorata. E' metodica, ha una buona forma mentis e metodo. Potrebbe migliorare dal punto di vista della condivisione del lavoro.	1387b0e2-7453-4ab1-a673-cde9d5d1d027	10
11	quali sono le aree di miglioramento individuate per il 2025-2026	Silvia ha ampliato le sue capacità migliorando le seguenti aree professionali seguendo alcune certificazioni sul contesto Data AI e Azure Services. Ha inoltre acquisito competenze specialistiche sul tool di automazione N8N e Azure AI Services. Migliorata la conoscenza, aumentato il numero di certificazioni specialistiche.	1dc1b6a4-e22d-44db-b6ce-ec4eb97070d6	10
12	inserire una descrizione sintetica dei risultati raggiunti dalla risorsa in corso di valutazione nel periodo di valutazione	Silvia ha ottenuto ottimi risultati. Il cliente Corte è entusiasta delle sue prestazioni. Penso che il trend sia decisamente in positivo e considero che la risorsa dovrebbe essere attenzionata nella lista delle candidature per la salary review.	03d149ab-3535-4d8e-ad62-41682fec9ca4	10
\.


--
-- TOC entry 3506 (class 0 OID 16581)
-- Dependencies: 224
-- Data for Name: cv_storage; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."cv_storage" ("id", "text", "metadata", "embedding") FROM stdin;
\.


--
-- TOC entry 3507 (class 0 OID 16587)
-- Dependencies: 225
-- Data for Name: resource_dependencies; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."resource_dependencies" ("id", "resource_id", "dependency_name") FROM stdin;
\.


--
-- TOC entry 3509 (class 0 OID 16591)
-- Dependencies: 227
-- Data for Name: resource_field_values; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."resource_field_values" ("id", "resource_field_id", "possible_value") FROM stdin;
\.


--
-- TOC entry 3511 (class 0 OID 16595)
-- Dependencies: 229
-- Data for Name: resource_fields; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."resource_fields" ("id", "resource_id", "field_name", "validation_rule") FROM stdin;
\.


--
-- TOC entry 3513 (class 0 OID 16601)
-- Dependencies: 231
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: pgvector_user
--

COPY "public"."resources" ("id", "resource_name") FROM stdin;
\.


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 217
-- Name: agent_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."agent_questions_id_seq"', 1, false);


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 219
-- Name: agent_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."agent_sessions_id_seq"', 32, true);


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 221
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."agents_id_seq"', 8, true);


--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 223
-- Name: answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."answers_id_seq"', 12, true);


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 226
-- Name: resource_dependencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."resource_dependencies_id_seq"', 1, false);


--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 228
-- Name: resource_field_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."resource_field_values_id_seq"', 1, false);


--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 230
-- Name: resource_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."resource_fields_id_seq"', 1, false);


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 232
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pgvector_user
--

SELECT pg_catalog.setval('"public"."resources_id_seq"', 1, false);


--
-- TOC entry 3336 (class 2606 OID 16613)
-- Name: agent_questions agent_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."agent_questions"
    ADD CONSTRAINT "agent_questions_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3338 (class 2606 OID 16615)
-- Name: agent_sessions agent_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."agent_sessions"
    ADD CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3340 (class 2606 OID 16617)
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3342 (class 2606 OID 16619)
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3344 (class 2606 OID 16621)
-- Name: cv_storage cv_storage_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."cv_storage"
    ADD CONSTRAINT "cv_storage_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3346 (class 2606 OID 16623)
-- Name: resource_dependencies resource_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_dependencies"
    ADD CONSTRAINT "resource_dependencies_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3348 (class 2606 OID 16625)
-- Name: resource_field_values resource_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_field_values"
    ADD CONSTRAINT "resource_field_values_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3350 (class 2606 OID 16627)
-- Name: resource_fields resource_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_fields"
    ADD CONSTRAINT "resource_fields_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3352 (class 2606 OID 16629)
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");


--
-- TOC entry 3353 (class 2606 OID 16630)
-- Name: resource_dependencies resource_dependencies_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_dependencies"
    ADD CONSTRAINT "resource_dependencies_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id");


--
-- TOC entry 3354 (class 2606 OID 16635)
-- Name: resource_field_values resource_field_values_resource_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_field_values"
    ADD CONSTRAINT "resource_field_values_resource_field_id_fkey" FOREIGN KEY ("resource_field_id") REFERENCES "public"."resource_fields"("id");


--
-- TOC entry 3355 (class 2606 OID 16640)
-- Name: resource_fields resource_fields_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pgvector_user
--

ALTER TABLE ONLY "public"."resource_fields"
    ADD CONSTRAINT "resource_fields_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id");


-- Completed on 2025-05-13 19:45:53

--
-- PostgreSQL database dump complete
--

