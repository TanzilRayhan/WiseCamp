package com.wisecamp.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wisecamp.api.dto.AuthDtos.UpdateUserRequest;
import com.wisecamp.api.dto.AuthDtos.UserResponse;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse updateUser(String email, UpdateUserRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.username() != null) {
            user.setUsername(request.username());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getUsername());
    }
}