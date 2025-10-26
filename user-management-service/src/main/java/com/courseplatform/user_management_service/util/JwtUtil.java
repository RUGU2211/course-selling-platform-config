package com.courseplatform.user_management_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.function.Function;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    // Use a sufficiently long secret (>= 32 bytes for HS256)
    private String SECRET_KEY = "your-secure-key-should-be-at-least-32-chars-long-2025-10-20";

    // Extract username (email) from token
    public String getEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract expiration date
    public Date getExpirationDateFromToken(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extract role from custom claim "role"
    public String getRoleFromToken(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    // Extract user ID from custom claim "userId"
    public Long getUserIdFromToken(String token) {
        final Claims claims = extractAllClaims(token);
        Integer id = claims.get("userId", Integer.class);
        return id != null ? id.longValue() : null;
    }

    // Common method to extract any claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Parse all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if token is expired
    private Boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    // Generate token given email, userId, role
    public String generateToken(String email, Long userId, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))  // 10 hours expiration
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                .compact();
    }

    // Convenience method for generating from User entity
    public String generateToken(com.courseplatform.user_management_service.entity.User user) {
        return generateToken(user.getEmail(), user.getId(), user.getRole().name());
    }

    // Validate token for email
    public Boolean isTokenValid(String token) {
        String email = getEmailFromToken(token);
        return (email != null && !isTokenExpired(token));
    }
}
