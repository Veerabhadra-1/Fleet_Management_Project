# FleetFlow – Setup & Run

## Backend

1. **Install dependencies**
   ```bash
   cd BACKEND && npm install
   ```

2. **Environment**
   - Copy `BACKEND/.env.example` to `BACKEND/.env`
   - Set `MONGO_URL` (e.g. `mongodb://localhost:27017/fleetflow`) and optionally `JWT_SECRET`, `FRONTEND_URL`

3. **Seed admin user** (creates first Fleet Manager)
   ```bash
   cd BACKEND && node scripts/seedUser.js
   ```
   Default login: **admin@fleetflow.com** / **admin123**

4. **Start server**
   ```bash
   cd BACKEND && npm start
   ```
   Server runs on port 5000 (or `PORT` from `.env`).

## Frontend

1. **Install dependencies**
   ```bash
   cd frontend && npm install
   ```

2. **Optional:** set `REACT_APP_API_URL=http://localhost:5000` in `frontend/.env` if the API is not on 5000.

3. **Start app**
   ```bash
   cd frontend && npm start
   ```
   App runs on port 3000.

## Roles (RBAC)

- **Fleet Manager** – Full access (vehicles, drivers, trips, maintenance, fuel, analytics)
- **Dispatcher** – Vehicles (read), drivers (read), trips (create/update/status), fuel logs
- **Safety Officer** – Read access; can manage drivers (update) and service logs
- **Financial Analyst** – Read + analytics, fuel log updates, CSV/PDF export

## Workflow (as per spec)

1. Add vehicle (e.g. Van-05, 500 kg) → status = Available  
2. Add driver with valid license type  
3. Create trip with cargo 450 kg → validation passes  
4. Dispatch trip → vehicle = On Trip, driver = On Duty  
5. Complete trip → vehicle = Available, driver = Off Duty  
6. Add maintenance log → vehicle status = In Shop (hidden from dispatcher)  
7. Analytics: cost-per-km and ROI use Total Operational Cost (Fuel + Maintenance)

## Legacy routes

- Old delivery vehicles CRUD is still available at `/deliverVehicle` (no auth) for backward compatibility.
- Frontend “Legacy” link goes to the original Lorry/Truck/Van list.
