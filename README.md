# Courier Tracking Full-Stack Project

## Project Overview
A complete, end-to-end Courier Tracking web application integrating a Spring Boot REST API, MySQL Relational Database, and a modern Dashboard UI. It satisfies all academic requirements for database modeling and full-stack integration.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Dynamic UI, fetch API)
- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA
- **Database**: MySQL 8.x

## Database Design
- **CUSTOMERS**: Stores customer details (id, name, email, phone, address).
- **DELIVERY_AGENTS**: Stores agent details (id, name, contact info, vehicle, status).
- **PARCELS**: The core table mapping customers and agents. Stores tracking numbers, origins, destinations, and status.
- **TRACKING**: Stores a history timeline for every status change of a parcel.

### ER Relationship Explanation
- `Customer (1) -> (M) Parcel`: A customer can send multiple parcels.
- `DeliveryAgent (1) -> (M) Parcel`: An agent can handle multiple parcels.
- `Parcel (1) -> (M) Tracking`: A parcel has multiple tracking milestones over its lifecycle.

## REST API List
- **Customers**:
  - `GET /api/customers`
  - `POST /api/customers`
- **Delivery Agents**:
  - `GET /api/agents`
  - `GET /api/agents/above-average`
- **Parcels**:
  - `GET /api/parcels`
  - `POST /api/parcels/register` (uses stored procedure)
  - `GET /api/parcels/{id}`
  - `PUT /api/parcels/{id}` (triggers DB trigger)
  - `DELETE /api/parcels/{id}`
  - `GET /api/parcels/{id}/status` (uses stored function)
- **Tracking**:
  - `GET /api/tracking/{trackingNumber}`

## Advanced Database Concepts Explained
- **JOIN Query**: Connects `PARCELS`, `CUSTOMERS`, and `DELIVERY_AGENTS` to build a unified report of shipments. Exposed via Repository native query.
- **Subquery**: Calculates the global average of parcels per agent, and retrieves agents whose total parcel count exceeds this average. Exposed via `GET /api/agents/above-average`.
- **Stored Procedure (`register_parcel`)**: Encapsulates the transactional logic of inserting a parcel and its initial pending tracking milestone into the DB.
- **Stored Function (`get_parcel_status`)**: Encapsulates logic to quickly retrieve the string status for a specific parcel ID.
- **Trigger (`after_parcel_status_update`)**: Automatically records a historical entry into the `TRACKING` table whenever a `PARCEL`'s status column gets updated.

## Setup Instructions

### 1. How to run MySQL
1. Ensure MySQL server is running locally on port 3306.
2. The root user is configured in `application.properties` with username `root` and password `alexjose`. Update these in `src/main/resources/application.properties` if they differ.
3. Import the SQL dump:
   ```bash
   mysql -u root -p < database/courier_tracking.sql
   ```

### 2. How to run Spring Boot
1. Ensure Java 17+ is installed.
2. In the project root directory, run:
   ```bash
   ./mvnw.cmd spring-boot:run
   ```
   (Or use your IDE to run `CourierTrackingApplication.java`)
3. The server runs on port `8081`.

### 3. How to run frontend
- The frontend is served automatically by Spring Boot from `src/main/resources/static`.
- Once Spring Boot is running, navigate to `http://localhost:8081` in your browser.

### 4. How to test using Postman
- Check `GET http://localhost:8081/api/parcels`
- Test `GET http://localhost:8081/api/agents/above-average`
- Test POST to `/api/parcels/register` with JSON body to register a parcel.
- Test `PUT /api/parcels/{id}` with `{"status": "IN_TRANSIT"}` to fire the SQL trigger.
