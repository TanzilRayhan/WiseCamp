package com.wisecamp.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to WiseCamp API");
        response.put("version", "1.0.0");
        response.put("status", "running");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("health", "GET /");
        endpoints.put("h2-console", "GET /h2-console");
        endpoints.put("register", "POST /api/auth/register");
        endpoints.put("login", "POST /api/auth/login");
        endpoints.put("boards", "GET /api/boards (requires authentication)");
        endpoints.put("create-board", "POST /api/boards (requires authentication)");
        endpoints.put("get-board", "GET /api/boards/{id} (requires authentication)");

        response.put("available_endpoints", endpoints);

        Map<String, String> examples = new HashMap<>();
        examples.put("register",
                "curl -X POST http://localhost:8080/api/auth/register -H \"Content-Type: application/json\" -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}'");
        examples.put("login",
                "curl -X POST http://localhost:8080/api/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"john@example.com\",\"password\":\"password123\"}'");
        examples.put("boards",
                "curl -X GET http://localhost:8080/api/boards -H \"Authorization: Bearer YOUR_JWT_TOKEN\"");

        response.put("examples", examples);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "WiseCamp API");
        return ResponseEntity.ok(response);
    }
}
