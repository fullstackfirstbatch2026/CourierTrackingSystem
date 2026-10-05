package com.courier.couriertracking.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "PARCELS")
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer parcelId;

    private String trackingNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private DeliveryAgent agent;

    private String origin;
    private String destination;
    private String parcelType;
    private Double weight;
    private String status;
    private LocalDate bookingDate;
    private LocalDate expectedDeliveryDate;

    // Getters and Setters
    public Integer getParcelId() { return parcelId; }
    public void setParcelId(Integer parcelId) { this.parcelId = parcelId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public DeliveryAgent getAgent() { return agent; }
    public void setAgent(DeliveryAgent agent) { this.agent = agent; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getParcelType() { return parcelType; }
    public void setParcelType(String parcelType) { this.parcelType = parcelType; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
}
