package com.courier.couriertracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "DELIVERY_AGENTS")
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer agentId;

    private String agentName;
    private String phone;
    private String email;
    private String vehicleNumber;
    private String status;

    // Getters and Setters
    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
