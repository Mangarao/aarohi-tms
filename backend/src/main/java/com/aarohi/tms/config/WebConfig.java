package com.aarohi.tms.config;

import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Web configuration for cache control and CORS settings
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS configuration is handled in WebSecurityConfig.java to avoid conflicts
    // @Override
    // public void addCorsMappings(@NonNull CorsRegistry registry) {
    //     // Configuration moved to WebSecurityConfig.java
    // }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Configure static resources with proper caching
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        // Add interceptor to prevent API response caching
        registry.addInterceptor(new ApiCacheControlInterceptor())
                .addPathPatterns("/auth/**", "/users/**", "/complaints/**", "/expenses/**");
    }

    /**
     * Interceptor to add cache control headers to API responses
     */
    public static class ApiCacheControlInterceptor implements HandlerInterceptor {
        
        @Override
        public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
            // Prevent caching of API responses
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
            
            // Add ETag header to help with proper cache validation
            response.setHeader("ETag", String.valueOf(System.currentTimeMillis()));
            
            return true;
        }
    }
}
