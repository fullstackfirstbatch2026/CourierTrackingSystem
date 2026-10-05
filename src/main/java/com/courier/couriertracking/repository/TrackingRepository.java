package com.courier.couriertracking.repository;

import com.courier.couriertracking.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrackingRepository extends JpaRepository<Tracking, Integer> {
    List<Tracking> findByParcelTrackingNumber(String trackingNumber);
}
