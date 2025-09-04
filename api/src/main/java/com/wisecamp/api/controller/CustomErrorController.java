package com.wisecamp.api.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorResponse = new HashMap<>();

        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String requestUri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            errorResponse.put("status", statusCode);
            errorResponse.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
        }

        errorResponse.put("message", message != null ? message.toString() : "An unexpected error occurred");
        errorResponse.put("path", requestUri);
        errorResponse.put("timestamp", System.currentTimeMillis());

        // Provide helpful suggestions based on error type
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            switch (statusCode) {
                case 404:
                    errorResponse.put("suggestion",
                            "Check if the endpoint exists. Visit GET / for available endpoints");
                    break;
                case 405:
                    errorResponse.put("suggestion",
                            "Method not allowed. Check if you're using the correct HTTP method (GET/POST/PUT/DELETE)");
                    break;
                case 403:
                    errorResponse.put("suggestion",
                            "Access forbidden. You may need to authenticate first using /api/auth/login");
                    break;
                case 401:
                    errorResponse.put("suggestion",
                            "Unauthorized. Please login first using /api/auth/login to get a JWT token");
                    break;
                default:
                    errorResponse.put("suggestion", "Visit GET / for API documentation and available endpoints");
            }
        }

        HttpStatus httpStatus = status != null ? HttpStatus.valueOf(Integer.parseInt(status.toString()))
                : HttpStatus.INTERNAL_SERVER_ERROR;

        return ResponseEntity.status(httpStatus).body(errorResponse);
    }
}
