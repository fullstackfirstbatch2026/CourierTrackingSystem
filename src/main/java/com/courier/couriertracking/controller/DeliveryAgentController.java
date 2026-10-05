package com.courier.couriertracking.controller;

import com.courier.couriertracking.entity.DeliveryAgent;
import com.courier.couriertracking.repository.DeliveryAgentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "*")
public class DeliveryAgentController {

    @Autowired
    private DeliveryAgentRepository agentRepository;

    @GetMapping
    public List<DeliveryAgent> getAllAgents() {
        return agentRepository.findAll();
    }

    @GetMapping("/above-average")
    public List<Object[]> getAgentsAboveAverage() {
        return agentRepository.findAgentsAboveAverageParcels();
    }
}
