package com.courier.couriertracking.service;

import com.courier.couriertracking.entity.Customer;
import com.courier.couriertracking.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Get all customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Get customer by ID
    public Optional<Customer> getCustomerById(Integer id) {
        return customerRepository.findById(id);
    }

    // Create customer
    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    // Update customer
    public Customer updateCustomer(Integer id, Customer customer) {

        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        existingCustomer.setCustomerName(customer.getCustomerName());
        existingCustomer.setPhone(customer.getPhone());
        existingCustomer.setEmail(customer.getEmail());
        existingCustomer.setAddress(customer.getAddress());

        return customerRepository.save(existingCustomer);
    }

    // Delete customer
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id);
    }
}