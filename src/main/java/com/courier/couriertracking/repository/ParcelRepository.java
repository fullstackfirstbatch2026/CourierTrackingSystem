package com.courier.couriertracking.repository;

import com.courier.couriertracking.entity.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ParcelRepository extends JpaRepository<Parcel, Integer> {

    Optional<Parcel> findByTrackingNumber(String trackingNumber);

    @Query(value = "SELECT p.parcel_id, p.tracking_number, c.customer_name, c.phone AS customer_phone, " +
                   "a.agent_name, a.phone AS agent_phone, p.origin, p.destination, p.status " +
                   "FROM PARCELS p " +
                   "JOIN CUSTOMERS c ON p.customer_id = c.customer_id " +
                   "LEFT JOIN DELIVERY_AGENTS a ON p.agent_id = a.agent_id", nativeQuery = true)
    List<Object[]> findParcelsWithDetails();

    @Query(value = "SELECT get_parcel_status(:parcelId)", nativeQuery = true)
    String getParcelStatusByFunction(@Param("parcelId") Integer parcelId);

    @Modifying
    @Transactional
    @Query(value = "CALL register_parcel(:customerId, :agentId, :trackingNumber, :origin, :destination, :parcelType, :weight, :expectedDeliveryDate)", nativeQuery = true)
    void registerParcel(@Param("customerId") Integer customerId, 
                        @Param("agentId") Integer agentId, 
                        @Param("trackingNumber") String trackingNumber, 
                        @Param("origin") String origin, 
                        @Param("destination") String destination, 
                        @Param("parcelType") String parcelType, 
                        @Param("weight") Double weight, 
                        @Param("expectedDeliveryDate") LocalDate expectedDeliveryDate);
}
