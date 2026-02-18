## 🚀 Start


#### Start backend + Postgres

`docker compose up --build`


#### Start frontend

`cd frontend`

`npm run dev`

http://localhost:5173



## 🛑 Stop


#### Stop frontend

Interrupt frontend terminal


#### Stop backend + Postgres

Interrupt backend terminal

OR if detached:

docker compose down



## 🧹 FULL RESET (wipe DB)
From root:

`docker compose down -v`

`docker compose up --build`


## 🔍 DEBUG COMMANDS

#### Check DB tables

`docker exec -it invoice-flow-db psql -U invoice_user -d invoice_db -c "\dt"`

#### View backend logs

`docker logs invoice-flow-backend`


## Architecture

Frontend → localhost:5173

Backend → localhost:3000

Postgres → localhost:5432