package com.example.enrollmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "payment-service")
public interface PaymentServiceClient {
    
    @GetMapping("/payment-service/api/payments/orders/{userId}")
    Object getUserPayments(@PathVariable("userId") Long userId);
}
