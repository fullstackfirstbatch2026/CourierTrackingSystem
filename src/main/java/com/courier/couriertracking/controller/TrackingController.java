package com.courier.couriertracking.controller;

import com.courier.couriertracking.entity.Tracking;
import com.courier.couriertracking.repository.TrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    @Autowired
    private TrackingRepository trackingRepository;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<List<Tracking>> getTrackingHistory(@PathVariable String trackingNumber) {
        List<Tracking> trackingHistory = trackingRepository.findByParcelTrackingNumber(trackingNumber);
        if (trackingHistory.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(trackingHistory);
    }
}
