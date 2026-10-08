package com.courier.couriertracking.service;

import com.courier.couriertracking.entity.Parcel;
import com.courier.couriertracking.repository.ParcelRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParcelService {

    private final ParcelRepository parcelRepository;

    public ParcelService(ParcelRepository parcelRepository) {
        this.parcelRepository = parcelRepository;
    }

    // Get all parcels
    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }

    // Get parcel by ID
    public Optional<Parcel> getParcelById(Integer id) {
        return parcelRepository.findById(id);
    }

    // Create parcel
    public Parcel createParcel(Parcel parcel) {
        return parcelRepository.save(parcel);
    }

    // Update parcel
    public Parcel updateParcel(Integer id, Parcel parcel) {

        Parcel existingParcel =
                parcelRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Parcel not found"));

        existingParcel.setTrackingNumber(
                parcel.getTrackingNumber());

        existingParcel.setOrigin(
                parcel.getOrigin());

        existingParcel.setDestination(
                parcel.getDestination());

        existingParcel.setParcelType(
                parcel.getParcelType());

        existingParcel.setWeight(
                parcel.getWeight());

        existingParcel.setStatus(
                parcel.getStatus());

        existingParcel.setExpectedDeliveryDate(
                parcel.getExpectedDeliveryDate());

        existingParcel.setCourier(
                parcel.getCourier());

        existingParcel.setSenderName(
                parcel.getSenderName());

        existingParcel.setReceiverName(
                parcel.getReceiverName());

        return parcelRepository.save(existingParcel);
    }

    // Delete parcel
    public void deleteParcel(Integer id) {
        parcelRepository.deleteById(id);
    }
}