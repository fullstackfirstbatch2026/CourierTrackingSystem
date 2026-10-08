package com.courier.couriertracking.controller;

import com.courier.couriertracking.entity.Customer;
import com.courier.couriertracking.entity.DeliveryAgent;
import com.courier.couriertracking.entity.Parcel;
import com.courier.couriertracking.entity.Tracking;
import com.courier.couriertracking.repository.CustomerRepository;
import com.courier.couriertracking.repository.DeliveryAgentRepository;
import com.courier.couriertracking.repository.ParcelRepository;
import com.courier.couriertracking.repository.TrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/parcels", "/api/shipments"})
@CrossOrigin(origins = "*")
public class ParcelController {

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeliveryAgentRepository deliveryAgentRepository;

    @Autowired
    private TrackingRepository trackingRepository;

    @GetMapping
    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Parcel> createParcel(@RequestBody Parcel parcel) {
        if (parcel.getBookingDate() == null) {
            parcel.setBookingDate(LocalDate.now());
        }
        if (parcel.getStatus() == null || parcel.getStatus().trim().isEmpty()) {
            parcel.setStatus("PENDING");
        } else {
            parcel.setStatus(parcel.getStatus().trim().toUpperCase());
        }
        if (parcel.getTrackingNumber() != null) {
            parcel.setTrackingNumber(parcel.getTrackingNumber().trim().toUpperCase());
        }

        // Link customer if provided
        if (parcel.getCustomer() != null) {
            if (parcel.getCustomer().getCustomerId() != null) {
                customerRepository.findById(parcel.getCustomer().getCustomerId()).ifPresent(parcel::setCustomer);
            } else if (parcel.getCustomer().getCustomerName() != null && !parcel.getCustomer().getCustomerName().trim().isEmpty()) {
                Customer newCust = new Customer();
                newCust.setCustomerName(parcel.getCustomer().getCustomerName().trim());
                newCust.setPhone(parcel.getCustomer().getPhone() != null ? parcel.getCustomer().getPhone() : "9876543210");
                newCust.setAddress(parcel.getOrigin() != null ? parcel.getOrigin() : "HQ Hub");
                newCust = customerRepository.save(newCust);
                parcel.setCustomer(newCust);
            }
        }

        // Link agent if provided
        if (parcel.getAgent() != null && parcel.getAgent().getAgentId() != null) {
            deliveryAgentRepository.findById(parcel.getAgent().getAgentId()).ifPresent(parcel::setAgent);
        } else {
            // Assign default agent 1 if exists
            deliveryAgentRepository.findById(1).ifPresent(parcel::setAgent);
        }

        Parcel savedParcel = parcelRepository.save(parcel);

        // Automatically create tracking milestone in TRACKING table
        try {
            Tracking initialTracking = new Tracking();
            initialTracking.setParcel(savedParcel);
            initialTracking.setStatus(savedParcel.getStatus());
            initialTracking.setLocation(savedParcel.getOrigin() != null ? savedParcel.getOrigin() : "Origin Facility");
            initialTracking.setTrackingTime(LocalDateTime.now());
            initialTracking.setRemarks("Shipment manifest created with status: " + savedParcel.getStatus());
            trackingRepository.save(initialTracking);
        } catch (Exception e) {
            // Log but don't fail parcel creation
            System.err.println("Note: Initial tracking entry creation: " + e.getMessage());
        }

        return ResponseEntity.ok(savedParcel);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerParcel(@RequestBody Parcel parcel) {
        Integer customerId = parcel.getCustomer() != null ? parcel.getCustomer().getCustomerId() : 1;
        Integer agentId = parcel.getAgent() != null ? parcel.getAgent().getAgentId() : 1;
        
        try {
            parcelRepository.registerParcel(
                customerId,
                agentId,
                parcel.getTrackingNumber() != null ? parcel.getTrackingNumber().trim().toUpperCase() : null,
                parcel.getOrigin(),
                parcel.getDestination(),
                parcel.getParcelType() != null ? parcel.getParcelType() : "Box",
                parcel.getWeight() != null ? parcel.getWeight() : 1.0,
                parcel.getExpectedDeliveryDate()
            );

            // Fetch the newly registered parcel to return the actual saved entity
            Optional<Parcel> newlyCreated = parcelRepository.findByTrackingNumber(parcel.getTrackingNumber().trim().toUpperCase());
            if (newlyCreated.isPresent()) {
                Parcel p = newlyCreated.get();
                if (parcel.getStatus() != null && !parcel.getStatus().equalsIgnoreCase("PENDING")) {
                    p.setStatus(parcel.getStatus().trim().toUpperCase());
                }
                if (parcel.getCourier() != null) {
                    p.setCourier(parcel.getCourier().trim());
                }
                if (parcel.getSenderName() != null) {
                    p.setSenderName(parcel.getSenderName().trim());
                }
                if (parcel.getReceiverName() != null) {
                    p.setReceiverName(parcel.getReceiverName().trim());
                }
                p = parcelRepository.save(p);
                return ResponseEntity.ok(p);
            }
            return ResponseEntity.ok("Parcel registered successfully using stored procedure");
        } catch (Exception ex) {
            // Fallback to standard save if stored procedure fails
            return createParcel(parcel);
        }
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<Parcel> getParcelByTrackingNumber(@PathVariable String trackingNumber) {
        String cleanTrk = trackingNumber != null ? trackingNumber.trim() : "";
        Optional<Parcel> parcel = parcelRepository.findByTrackingNumber(cleanTrk);
        if (!parcel.isPresent()) {
            parcel = parcelRepository.findAll().stream()
                    .filter(p -> p.getTrackingNumber() != null && p.getTrackingNumber().equalsIgnoreCase(cleanTrk))
                    .findFirst();
        }
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
                parcel.setTrackingNumber(parcelDetails.getTrackingNumber().trim().toUpperCase());
            }
            if (parcelDetails.getStatus() != null) {
                parcel.setStatus(parcelDetails.getStatus().trim().toUpperCase());
            }
            if (parcelDetails.getCourier() != null) {
                parcel.setCourier(parcelDetails.getCourier().trim());
            }
            if (parcelDetails.getSenderName() != null) {
                parcel.setSenderName(parcelDetails.getSenderName().trim());
            }
            if (parcelDetails.getReceiverName() != null) {
                parcel.setReceiverName(parcelDetails.getReceiverName().trim());
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
            if (parcelDetails.getCustomer() != null) {
                if (parcelDetails.getCustomer().getCustomerId() != null) {
                    customerRepository.findById(parcelDetails.getCustomer().getCustomerId()).ifPresent(parcel::setCustomer);
                } else if (parcelDetails.getCustomer().getCustomerName() != null) {
                    if (parcel.getCustomer() != null) {
                        parcel.getCustomer().setCustomerName(parcelDetails.getCustomer().getCustomerName());
                        customerRepository.save(parcel.getCustomer());
                    }
                }
            }
            if (parcelDetails.getAgent() != null && parcelDetails.getAgent().getAgentId() != null) {
                deliveryAgentRepository.findById(parcelDetails.getAgent().getAgentId()).ifPresent(parcel::setAgent);
            }
            Parcel updatedParcel = parcelRepository.save(parcel);

            // Add tracking update milestone
            try {
                Tracking updateTracking = new Tracking();
                updateTracking.setParcel(updatedParcel);
                updateTracking.setStatus(updatedParcel.getStatus());
                updateTracking.setLocation(updatedParcel.getDestination() != null ? updatedParcel.getDestination() : "Regional Hub");
                updateTracking.setTrackingTime(LocalDateTime.now());
                updateTracking.setRemarks("Status updated to " + updatedParcel.getStatus());
                trackingRepository.save(updateTracking);
            } catch (Exception e) {
                // Ignore tracking log exception
            }

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
        // Delete related tracking entries first to maintain referential integrity
        try {
            Optional<Parcel> pOpt = parcelRepository.findById(id);
            if (pOpt.isPresent()) {
                List<Tracking> trackings = trackingRepository.findByParcelTrackingNumber(pOpt.get().getTrackingNumber());
                if (!trackings.isEmpty()) {
                    trackingRepository.deleteAll(trackings);
                }
            }
        } catch (Exception e) {
            System.err.println("Note: Tracking cleanup on parcel delete: " + e.getMessage());
        }
        
        parcelRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<String> getParcelStatus(@PathVariable Integer id) {
        String status = parcelRepository.getParcelStatusByFunction(id);
        return ResponseEntity.ok(status);
    }
}
