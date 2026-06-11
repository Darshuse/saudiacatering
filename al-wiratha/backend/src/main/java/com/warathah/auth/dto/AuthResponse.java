package com.warathah.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
    private String fullName;
    private long expiresIn;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, String email, String role, String fullName, long expiresIn) {
        this.accessToken  = accessToken;
        this.refreshToken = refreshToken;
        this.email        = email;
        this.role         = role;
        this.fullName     = fullName;
        this.expiresIn    = expiresIn;
    }

    public String getAccessToken()               { return accessToken; }
    public void setAccessToken(String v)         { this.accessToken = v; }

    public String getRefreshToken()              { return refreshToken; }
    public void setRefreshToken(String v)        { this.refreshToken = v; }

    public String getEmail()                     { return email; }
    public void setEmail(String v)               { this.email = v; }

    public String getRole()                      { return role; }
    public void setRole(String v)                { this.role = v; }

    public String getFullName()                  { return fullName; }
    public void setFullName(String v)            { this.fullName = v; }

    public long getExpiresIn()                   { return expiresIn; }
    public void setExpiresIn(long v)             { this.expiresIn = v; }
}
