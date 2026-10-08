package com.courier.couriertracking.controller;

import com.courier.couriertracking.entity.Parcel;
import com.courier.couriertracking.entity.Tracking;
import com.courier.couriertracking.repository.ParcelRepository;
import com.courier.couriertracking.repository.TrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    @Autowired
    private TrackingRepository trackingRepository;

    @Autowired
    private ParcelRepository parcelRepository;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<List<Tracking>> getTrackingHistory(@PathVariable String trackingNumber) {
        String cleanTrk = trackingNumber != null ? trackingNumber.trim() : "";
        List<Tracking> trackingHistory = trackingRepository.findByParcelTrackingNumber(cleanTrk);
        
        if (trackingHistory.isEmpty()) {
            // Case-insensitive parcel search
            Optional<Parcel> parcelOpt = parcelRepository.findByTrackingNumber(cleanTrk);
            if (!parcelOpt.isPresent()) {
                parcelOpt = parcelRepository.findAll().stream()
                        .filter(p -> p.getTrackingNumber() != null && p.getTrackingNumber().equalsIgnoreCase(cleanTrk))
                        .findFirst();
            }

            if (parcelOpt.isPresent()) {
                Parcel p = parcelOpt.get();
                Tracking initial = new Tracking();
                initial.setParcel(p);
                initial.setStatus(p.getStatus() != null ? p.getStatus() : "PENDING");
                initial.setLocation(p.getOrigin() != null ? p.getOrigin() : "Origin Facility");
                initial.setTrackingTime(p.getBookingDate() != null ? p.getBookingDate().atStartOfDay() : LocalDateTime.now());
                initial.setRemarks("Parcel registered in system with status: " + initial.getStatus());
                
                List<Tracking> synthesized = new ArrayList<>();
                synthesized.add(initial);
                return ResponseEntity.ok(synthesized);
            }
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(trackingHistory);
    }
}
