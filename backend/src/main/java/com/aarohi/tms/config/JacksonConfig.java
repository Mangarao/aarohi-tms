package com.aarohi.tms.config;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

/**
 * Jackson configuration for handling date/time serialization and deserialization
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Custom LocalDateTime deserializer to handle ISO strings
        javaTimeModule.addDeserializer(LocalDateTime.class, new CustomLocalDateTimeDeserializer());
        
        // Custom LocalDateTime serializer
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        mapper.registerModule(javaTimeModule);
        
        return mapper;
    }
    
    /**
     * Custom deserializer to handle various date formats including ISO strings with Z suffix
     */
    public static class CustomLocalDateTimeDeserializer extends LocalDateTimeDeserializer {
        
        public CustomLocalDateTimeDeserializer() {
            super(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        
        @Override
        protected LocalDateTime _fromString(com.fasterxml.jackson.core.JsonParser p, 
                                           com.fasterxml.jackson.databind.DeserializationContext ctxt, 
                                           String string) throws java.io.IOException {
            // Handle ISO string with Z suffix by removing it
            if (string.endsWith("Z")) {
                string = string.substring(0, string.length() - 1);
            }
            // Handle milliseconds
            if (string.contains(".")) {
                string = string.substring(0, string.indexOf("."));
            }
            
            return LocalDateTime.parse(string, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }
}
