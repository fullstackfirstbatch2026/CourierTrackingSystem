package com.courier.couriertracking.controller;

import com.courier.couriertracking.entity.Parcel;
import com.courier.couriertracking.repository.ParcelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parcels")
@CrossOrigin(origins = "*")
public class ParcelController {

    @Autowired
    private ParcelRepository parcelRepository;

    @GetMapping
    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerParcel(@RequestBody Parcel parcel) {
        Integer customerId = parcel.getCustomer() != null ? parcel.getCustomer().getCustomerId() : null;
        Integer agentId = parcel.getAgent() != null ? parcel.getAgent().getAgentId() : null;
        
        parcelRepository.registerParcel(
            customerId,
            agentId,
            parcel.getTrackingNumber(),
            parcel.getOrigin(),
            parcel.getDestination(),
            parcel.getParcelType(),
            parcel.getWeight(),
            parcel.getExpectedDeliveryDate()
        );
        return ResponseEntity.ok("Parcel registered successfully using stored procedure");
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<Parcel> getParcelByTrackingNumber(@PathVariable String trackingNumber) {
        Optional<Parcel> parcel = parcelRepository.findByTrackingNumber(trackingNumber);
        return parcel.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/details")
    public List<Object[]> getParcelsWithDetails() {
        return parcelRepository.findParcelsWithDetails();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parcel> getParcelById(@PathVariable Integer id) {
        Optional<Parcel> parcel = parcelRepository.findById(id);
        return parcel.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parcel> updateParcel(@PathVariable Integer id, @RequestBody Parcel parcelDetails) {
        Optional<Parcel> optionalParcel = parcelRepository.findById(id);
        if (optionalParcel.isPresent()) {
            Parcel parcel = optionalParcel.get();
            if (parcelDetails.getTrackingNumber() != null) {
                parcel.setTrackingNumber(parcelDetails.getTrackingNumber());
            }
            if (parcelDetails.getStatus() != null) {
                parcel.setStatus(parcelDetails.getStatus());
            }
            if (parcelDetails.getOrigin() != null) {
                parcel.setOrigin(parcelDetails.getOrigin());
            }
            if (parcelDetails.getDestination() != null) {
                parcel.setDestination(parcelDetails.getDestination());
            }
            if (parcelDetails.getParcelType() != null) {
                parcel.setParcelType(parcelDetails.getParcelType());
            }
            if (parcelDetails.getWeight() != null) {
                parcel.setWeight(parcelDetails.getWeight());
            }
            if (parcelDetails.getExpectedDeliveryDate() != null) {
                parcel.setExpectedDeliveryDate(parcelDetails.getExpectedDeliveryDate());
            }
            if (parcelDetails.getCustomer() != null && parcelDetails.getCustomer().getCustomerId() != null) {
                parcel.setCustomer(parcelDetails.getCustomer());
            }
            if (parcelDetails.getAgent() != null && parcelDetails.getAgent().getAgentId() != null) {
                parcel.setAgent(parcelDetails.getAgent());
            }
            Parcel updatedParcel = parcelRepository.save(parcel);
            return ResponseEntity.ok(updatedParcel);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Parcel> patchParcel(@PathVariable Integer id, @RequestBody Parcel parcelDetails) {
        return updateParcel(id, parcelDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParcel(@PathVariable Integer id) {
        parcelRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<String> getParcelStatus(@PathVariable Integer id) {
        String status = parcelRepository.getParcelStatusByFunction(id);
        return ResponseEntity.ok(status);
    }
}
