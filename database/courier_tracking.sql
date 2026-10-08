-- REQUIREMENT 1: JOIN
-- REQUIREMENT 2: SUBQUERY
-- REQUIREMENT 3: PROCEDURE
-- REQUIREMENT 4: FUNCTION
-- REQUIREMENT 5: TRIGGER

CREATE DATABASE IF NOT EXISTS courierdb;
USE courierdb;

-- 1. CREATE TABLE statements
CREATE TABLE CUSTOMERS (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT
);

CREATE TABLE DELIVERY_AGENTS (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    vehicle_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'AVAILABLE'
);

CREATE TABLE PARCELS (
    parcel_id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    agent_id INT,
    origin VARCHAR(100),
    destination VARCHAR(100),
    parcel_type VARCHAR(50),
    weight DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    booking_date DATE,
    expected_delivery_date DATE,
    courier VARCHAR(100),
    sender_name VARCHAR(100),
    receiver_name VARCHAR(100),
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    FOREIGN KEY (agent_id) REFERENCES DELIVERY_AGENTS(agent_id)
);

CREATE TABLE TRACKING (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    parcel_id INT,
    status VARCHAR(50),
    location VARCHAR(100),
    tracking_time DATETIME,
    remarks TEXT,
    FOREIGN KEY (parcel_id) REFERENCES PARCELS(parcel_id) ON DELETE CASCADE
);

-- 5. INSERT sample data
INSERT INTO CUSTOMERS (customer_name, email, phone, address) VALUES
('John Doe', 'john@example.com', '1234567890', '123 Elm St'),
('Jane Smith', 'jane@example.com', '0987654321', '456 Oak St'),
('Alice Brown', 'alice@example.com', '1112223333', '789 Pine St'),
('Bob White', 'bob@example.com', '4445556666', '321 Maple St'),
('Charlie Green', 'charlie@example.com', '7778889999', '654 Cedar St'),
('David Black', 'david@example.com', '2223334444', '987 Birch St'),
('Eve Blue', 'eve@example.com', '5556667777', '147 Walnut St'),
('Frank Red', 'frank@example.com', '8889990000', '258 Ash St'),
('Grace Yellow', 'grace@example.com', '3334445555', '369 Cherry St'),
('Hank Orange', 'hank@example.com', '6667778888', '741 Spruce St');

INSERT INTO DELIVERY_AGENTS (agent_name, phone, email, vehicle_number, status) VALUES
('Agent Alpha', '1010101010', 'alpha@agent.com', 'V100', 'AVAILABLE'),
('Agent Beta', '2020202020', 'beta@agent.com', 'V200', 'ON_DUTY'),
('Agent Gamma', '3030303030', 'gamma@agent.com', 'V300', 'AVAILABLE'),
('Agent Delta', '4040404040', 'delta@agent.com', 'V400', 'ON_DUTY'),
('Agent Epsilon', '5050505050', 'epsilon@agent.com', 'V500', 'AVAILABLE');

INSERT INTO PARCELS (tracking_number, customer_id, agent_id, origin, destination, parcel_type, weight, status, booking_date, expected_delivery_date) VALUES
('TRK001', 1, 1, 'NY', 'LA', 'Document', 1.5, 'DELIVERED', '2023-10-01', '2023-10-05'),
('TRK002', 2, 1, 'NY', 'SF', 'Box', 5.0, 'IN_TRANSIT', '2023-10-02', '2023-10-07'),
('TRK003', 3, 2, 'TX', 'NY', 'Box', 10.0, 'PENDING', '2023-10-03', '2023-10-08'),
('TRK004', 4, 2, 'FL', 'WA', 'Document', 0.5, 'OUT_FOR_DELIVERY', '2023-10-04', '2023-10-06'),
('TRK005', 5, 2, 'OH', 'MI', 'Box', 2.0, 'AT_LOCAL_HUB', '2023-10-05', '2023-10-09'),
('TRK006', 6, 3, 'NV', 'OR', 'Document', 1.0, 'PENDING', '2023-10-06', '2023-10-10'),
('TRK007', 7, 4, 'AZ', 'NM', 'Box', 8.0, 'DELIVERED', '2023-10-07', '2023-10-11'),
('TRK008', 8, 4, 'CO', 'UT', 'Box', 15.0, 'IN_TRANSIT', '2023-10-08', '2023-10-12'),
('TRK009', 9, 4, 'ID', 'MT', 'Document', 0.2, 'PENDING', '2023-10-09', '2023-10-13'),
('TRK010', 10, 4, 'WY', 'ND', 'Box', 12.0, 'AT_LOCAL_HUB', '2023-10-10', '2023-10-14'),
('TRK011', 1, 5, 'SD', 'NE', 'Document', 0.8, 'OUT_FOR_DELIVERY', '2023-10-11', '2023-10-15'),
('TRK012', 2, 5, 'KS', 'OK', 'Box', 6.5, 'PENDING', '2023-10-12', '2023-10-16'),
('TRK013', 3, 1, 'MN', 'IA', 'Box', 4.0, 'IN_TRANSIT', '2023-10-13', '2023-10-17'),
('TRK014', 4, 1, 'MO', 'AR', 'Document', 1.2, 'DELIVERED', '2023-10-14', '2023-10-18'),
('TRK015', 5, 2, 'LA', 'MS', 'Box', 3.0, 'PENDING', '2023-10-15', '2023-10-19');

INSERT INTO TRACKING (parcel_id, status, location, tracking_time, remarks) VALUES
(1, 'PENDING', 'NY', '2023-10-01 10:00:00', 'Parcel registered'),
(1, 'IN_TRANSIT', 'NY Hub', '2023-10-02 10:00:00', 'Left origin hub'),
(1, 'DELIVERED', 'LA', '2023-10-05 10:00:00', 'Delivered to customer');

-- REQUIREMENT 1: JOIN
-- 6. Required JOIN query
-- Display parcels with customer and delivery agent details
SELECT p.parcel_id, p.tracking_number, c.customer_name, c.phone AS customer_phone,
       a.agent_name, a.phone AS agent_phone, p.origin, p.destination, p.status
FROM PARCELS p
JOIN CUSTOMERS c ON p.customer_id = c.customer_id
LEFT JOIN DELIVERY_AGENTS a ON p.agent_id = a.agent_id;

-- REQUIREMENT 2: SUBQUERY
-- 7. Required SUBQUERY
-- Find delivery agents handling MORE parcels than the average number of parcels handled by all agents
SELECT a.agent_id, a.agent_name, a.phone, 
       (SELECT COUNT(*) FROM PARCELS p WHERE p.agent_id = a.agent_id) AS parcel_count
FROM DELIVERY_AGENTS a
WHERE (SELECT COUNT(*) FROM PARCELS p WHERE p.agent_id = a.agent_id) > 
      (SELECT AVG(p_count) FROM (
          SELECT COUNT(*) as p_count FROM PARCELS GROUP BY agent_id
       ) AS temp);

-- REQUIREMENT 3: PROCEDURE
-- 8. STORED PROCEDURE
DELIMITER //
CREATE PROCEDURE register_parcel(
    IN p_customer_id INT,
    IN p_agent_id INT,
    IN p_tracking_number VARCHAR(50),
    IN p_origin VARCHAR(100),
    IN p_destination VARCHAR(100),
    IN p_parcel_type VARCHAR(50),
    IN p_weight DECIMAL(10,2),
    IN p_expected_delivery_date DATE
)
BEGIN
    INSERT INTO PARCELS (tracking_number, customer_id, agent_id, origin, destination, parcel_type, weight, status, booking_date, expected_delivery_date)
    VALUES (p_tracking_number, p_customer_id, p_agent_id, p_origin, p_destination, p_parcel_type, p_weight, 'PENDING', CURDATE(), p_expected_delivery_date);
    
    SET @new_parcel_id = LAST_INSERT_ID();
    
    INSERT INTO TRACKING (parcel_id, status, location, tracking_time, remarks)
    VALUES (@new_parcel_id, 'PENDING', p_origin, NOW(), 'Parcel registered');
END //
DELIMITER ;

-- 11. Example CALL statement
-- CALL register_parcel(1, 1, 'TRK016', 'WA', 'CA', 'Box', 2.5, '2023-11-01');

-- REQUIREMENT 4: FUNCTION
-- 9. STORED FUNCTION
DELIMITER //
CREATE FUNCTION get_parcel_status(p_parcel_id INT) RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_status VARCHAR(50);
    SELECT status INTO v_status FROM PARCELS WHERE parcel_id = p_parcel_id;
    RETURN v_status;
END //
DELIMITER ;

-- 12. Example SELECT statement for function
-- SELECT get_parcel_status(1);

-- REQUIREMENT 5: TRIGGER
-- 10. TRIGGER
DELIMITER //
CREATE TRIGGER after_parcel_status_update
AFTER UPDATE ON PARCELS
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO TRACKING (parcel_id, status, location, tracking_time, remarks)
        VALUES (NEW.parcel_id, NEW.status, 'System Update', NOW(), CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END //
DELIMITER ;

-- Example to fire trigger:
-- UPDATE PARCELS SET status = 'DELIVERED' WHERE parcel_id = 2;
