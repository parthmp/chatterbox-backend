package com.chatterbox.blabber.controllers;

import com.chatterbox.blabber.dto.login.LoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> auth(@RequestBody LoginRequest request){

        Map<String, Object> response = new HashMap<>();
        response.put("test", "test text here");
        return ResponseEntity.ok(response);

    }
}
