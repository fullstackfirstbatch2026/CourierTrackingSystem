package com.courier.couriertracking.service;

import com.courier.couriertracking.entity.Tracking;
import com.courier.couriertracking.repository.TrackingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrackingService {

    private final TrackingRepository trackingRepository;

    public TrackingService(TrackingRepository trackingRepository) {
        this.trackingRepository = trackingRepository;
    }

    // Get all tracking records
    public List<Tracking> getAllTracking() {
        return trackingRepository.findAll();
    }

    // Get tracking record by ID
    public Optional<Tracking> getTrackingById(Integer id) {
        return trackingRepository.findById(id);
    }

    // Create tracking record
    public Tracking createTracking(Tracking tracking) {
        return trackingRepository.save(tracking);
    }

    // Get tracking history using tracking number
    public List<Tracking> getTrackingByTrackingNumber(
            String trackingNumber) {

        return trackingRepository
                .findByParcelTrackingNumber(trackingNumber);
    }

    // Delete tracking record
    public void deleteTracking(Integer id) {
        trackingRepository.deleteById(id);
    }
}