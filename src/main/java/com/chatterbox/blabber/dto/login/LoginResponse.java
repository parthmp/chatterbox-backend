package com.chatterbox.blabber.dto.login;

import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String accessToken;
    private String message;
}
