package com.courseplatform.user_management_service.util;

import com.courseplatform.user_management_service.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * jwtExpiration should be milliseconds (eg. 86400000 for 24 hours).
     * If you store seconds in properties, convert to millis when used.
     */
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Generate signing key from secret
    private Key getSigningKey() {
        if (jwtSecret == null) {
            throw new IllegalStateException("JWT secret (jwt.secret) is not configured");
        }
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate JWT token for user
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole() == null ? null : user.getRole().toString());
        claims.put("fullName", user.getFullName());
        claims.put("isActive", user.getActive());
        claims.put("isVerified", user.getVerified());

        return createToken(claims, user.getEmail());
    }

    // Create JWT token with claims and subject
    private String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        long expiryMillis = jwtExpiration; // should already be millis
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expiryMillis))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate token against email
    public Boolean validateToken(String token, String email) {
        final String tokenEmail = getEmailFromToken(token);
        return (tokenEmail != null && tokenEmail.equals(email) && !isTokenExpired(token));
    }

    // Extract email from token
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // Extract expiration date from token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    // Extract issued at date from token
    public Date getIssuedAtDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getIssuedAt);
    }

    // Extract user ID from token (handles integer/long)
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object raw = claims.get("userId");
        if (raw == null) return null;
        if (raw instanceof Number) {
            return ((Number) raw).longValue();
        } else {
            try {
                return Long.parseLong(raw.toString());
            } catch (NumberFormatException ex) {
                return null;
            }
        }
    }

    // Extract role from token
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object raw = claims.get("role");
        return raw == null ? null : raw.toString();
    }

    // Extract full name from token
    public String getFullNameFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object raw = claims.get("fullName");
        return raw == null ? null : raw.toString();
    }

    // Extract isActive status from token
    public Boolean getIsActiveFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object raw = claims.get("isActive");
        if (raw == null) return null;
        if (raw instanceof Boolean) return (Boolean) raw;
        return Boolean.parseBoolean(raw.toString());
    }

    // Extract isVerified status from token
    public Boolean getIsVerifiedFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object raw = claims.get("isVerified");
        if (raw == null) return null;
        if (raw instanceof Boolean) return (Boolean) raw;
        return Boolean.parseBoolean(raw.toString());
    }

    // Extract specific claim from token
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // Extract all claims from token
    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("JWT token is expired", e);
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("JWT token is unsupported", e);
        } catch (MalformedJwtException e) {
            throw new RuntimeException("JWT token is malformed", e);
        } catch (SignatureException e) {
            throw new RuntimeException("JWT signature validation failed", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("JWT token compact of handler are invalid", e);
        }
    }

    // Check if token is expired
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration != null && expiration.before(new Date());
    }

    // Check if token is valid (not expired and properly signed)
    public Boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            // token expired
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    // Extract token from Authorization header
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    // Get remaining time for token expiration
    public long getTokenExpirationTime(String token) {
        Date expiration = getExpirationDateFromToken(token);
        if (expiration == null) return 0;
        return expiration.getTime() - System.currentTimeMillis();
    }

    // Check if token can be refreshed (token expired less than 24 hours ago)
    public Boolean canTokenBeRefreshed(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            Date now = new Date();
            if (expiration == null) return false;
            // If token expired and expired less than 24 hours ago, allow refresh
            return expiration.before(now) &&
                    (now.getTime() - expiration.getTime()) < (24 * 60 * 60 * 1000L);
        } catch (Exception e) {
            return false;
        }
    }

    // Refresh token (generate new token with same claims)
    public String refreshToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            long now = System.currentTimeMillis();
            return Jwts.builder()
                    .setClaims(claims)
                    .setIssuedAt(new Date(now))
                    .setExpiration(new Date(now + jwtExpiration))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh token: " + e.getMessage(), e);
        }
    }
}
