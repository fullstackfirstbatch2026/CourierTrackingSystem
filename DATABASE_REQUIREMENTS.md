# Database Requirements Mapping

This document maps each of the academic database requirements to the exact implementations in the code.

| Requirement | Description | Location in Code / SQL File |
|---|---|---|
| **Tables** | `CUSTOMERS`, `PARCELS`, `DELIVERY_AGENTS`, `TRACKING` | `database/courier_tracking.sql` (Lines 8-41)<br>`src/main/java/com/courier/couriertracking/entity/*.java` |
| **JOIN Query** | A SQL JOIN displaying parcels with customer and delivery-agent details. | `database/courier_tracking.sql` (Line 117)<br>`ParcelRepository.findParcelsWithDetails()` |
| **SUBQUERY** | A SQL subquery finding delivery agents handling MORE parcels than the average. | `database/courier_tracking.sql` (Line 126)<br>`DeliveryAgentRepository.findAgentsAboveAverageParcels()` |
| **STORED PROCEDURE** | `register_parcel`: registers a new parcel and creates a TRACKING entry. | `database/courier_tracking.sql` (Line 135)<br>`ParcelRepository.registerParcel()` mapped to `POST /api/parcels/register` |
| **STORED FUNCTION** | `get_parcel_status`: returns current delivery status by parcel ID. | `database/courier_tracking.sql` (Line 158)<br>`ParcelRepository.getParcelStatusByFunction()` mapped to `GET /api/parcels/{id}/status` |
| **TRIGGER** | `after_parcel_status_update`: inserts a TRACKING record on status update. | `database/courier_tracking.sql` (Line 171)<br>Automatically executes on `UPDATE PARCELS` (e.g. `PUT /api/parcels/{id}`) |
