package com.courier.couriertracking.repository;

import com.courier.couriertracking.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Integer> {

    @Query(value = "SELECT a.agent_id, a.agent_name, a.phone, a.email, a.vehicle_number, a.status " +
                   "FROM DELIVERY_AGENTS a " +
                   "WHERE (SELECT COUNT(*) FROM PARCELS p WHERE p.agent_id = a.agent_id) > " +
                   "      (SELECT AVG(p_count) FROM (" +
                   "          SELECT COUNT(*) as p_count FROM PARCELS GROUP BY agent_id" +
                   "       ) AS temp)", nativeQuery = true)
    List<Object[]> findAgentsAboveAverageParcels();
}
