package com.courier.couriertracking.service;

import com.courier.couriertracking.entity.DeliveryAgent;
import com.courier.couriertracking.repository.DeliveryAgentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryAgentService {

    private final DeliveryAgentRepository deliveryAgentRepository;

    public DeliveryAgentService(
            DeliveryAgentRepository deliveryAgentRepository) {

        this.deliveryAgentRepository = deliveryAgentRepository;
    }

    // Get all delivery agents
    public List<DeliveryAgent> getAllAgents() {
        return deliveryAgentRepository.findAll();
    }

    // Get agent by ID
    public Optional<DeliveryAgent> getAgentById(Integer id) {
        return deliveryAgentRepository.findById(id);
    }

    // Create agent
    public DeliveryAgent createAgent(DeliveryAgent agent) {
        return deliveryAgentRepository.save(agent);
    }

    // Update agent
    public DeliveryAgent updateAgent(
            Integer id,
            DeliveryAgent agent) {

        DeliveryAgent existingAgent =
                deliveryAgentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delivery agent not found"));

        existingAgent.setAgentName(agent.getAgentName());
        existingAgent.setPhone(agent.getPhone());
        existingAgent.setEmail(agent.getEmail());
        existingAgent.setVehicleNumber(agent.getVehicleNumber());
        existingAgent.setStatus(agent.getStatus());

        return deliveryAgentRepository.save(existingAgent);
    }

    // Delete agent
    public void deleteAgent(Integer id) {
        deliveryAgentRepository.deleteById(id);
    }

    // Agents handling more parcels than average
    public List<Object[]> getAgentsAboveAverageParcels() {
        return deliveryAgentRepository
                .findAgentsAboveAverageParcels();
    }
}