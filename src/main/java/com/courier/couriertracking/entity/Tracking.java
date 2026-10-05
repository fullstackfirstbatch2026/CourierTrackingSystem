package com.courier.couriertracking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRACKING")
public class Tracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer trackingId;

    @ManyToOne
    @JoinColumn(name = "parcel_id")
    private Parcel parcel;

    private String status;
    private String location;
    private LocalDateTime trackingTime;
    private String remarks;

    // Getters and Setters
    public Integer getTrackingId() { return trackingId; }
    public void setTrackingId(Integer trackingId) { this.trackingId = trackingId; }
    public Parcel getParcel() { return parcel; }
    public void setParcel(Parcel parcel) { this.parcel = parcel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getTrackingTime() { return trackingTime; }
    public void setTrackingTime(LocalDateTime trackingTime) { this.trackingTime = trackingTime; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
