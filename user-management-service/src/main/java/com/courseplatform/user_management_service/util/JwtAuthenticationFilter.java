package com.courseplatform.user_management_service.util;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // Extract JWT from Authorization header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(jwt);
            } catch (Exception e) {
                logger.error("Unable to extract email from JWT Token: {}", e.getMessage());
            }
        }

        // Validate token and set authentication
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.isTokenValid(jwt)) {
                String role = jwtUtil.getRoleFromToken(jwt);
                Long userId = jwtUtil.getUserIdFromToken(jwt);

                // Create authentication token with user details and authorities
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + (role == null ? "USER" : role)))
                );

                // Set additional details for the authentication token
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Attach custom user attributes to the request
                request.setAttribute("userId", userId);
                request.setAttribute("userEmail", email);
                request.setAttribute("userRole", role);

                // Set the authentication into SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.debug("JWT Token validated successfully for user: {} with role: {}", email, role);
            } else {
                logger.debug("JWT Token validation failed for email: {}", email);
            }
        }

        // Proceed with the next filter in the chain
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        logger.debug("JWT Filter - Request URI: {}", path);

        // Exclude certain paths from JWT filtering
        boolean shouldSkip = path.startsWith("/api/users/register") ||
                path.startsWith("/api/users/login") ||
                path.startsWith("/api/users/health") ||
                path.startsWith("/api/users/validate-token") ||
                path.startsWith("/actuator/") ||
                path.startsWith("/h2-console/") ||
                path.equals("/error");
                
        logger.debug("JWT Filter - Should skip filtering for path {}: {}", path, shouldSkip);
        return shouldSkip;
    }
}
