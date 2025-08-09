package com.aarohi.tms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Swagger/OpenAPI Configuration for Aarohi TMS API Documentation
 * 
 * This configuration provides comprehensive API documentation with JWT authentication support.
 * 
 * @author Aarohi TMS Team
 * @version 1.0.0
 */
@Configuration
public class SwaggerConfig {

    /**
     * Configure OpenAPI specification for the Aarohi Task Management System
     * 
     * @return OpenAPI configuration with security, info, and contact details
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Aarohi Task Management System API")
                        .version("1.0.0")
                        .description("Comprehensive API documentation for Aarohi Sewing Enterprises Task Management System. " +
                                   "This system manages complaints, tasks, users, and expenses for efficient business operations.")
                        .termsOfService("https://aarohisewing.com/terms")
                        .contact(new Contact()
                                .name("Aarohi TMS Support Team")
                                .email("support@aarohisewing.com")
                                .url("https://aarohisewing.com/contact"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    /**
     * Create JWT Bearer token authentication scheme
     * 
     * @return SecurityScheme for JWT Bearer token
     */
    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("Enter JWT Bearer token in the format: Bearer {token}")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");
    }
}
