package com.example.shop.security;

import com.example.shop.security.jwt.AuthEntryPointJwt;
import com.example.shop.security.jwt.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfigs {
    private final AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(
                                        "/api/auth/**",
                                        "/h2-console/**",
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**",
                                        "/error/**"
                                ).permitAll()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/categories",
                                        "/api/category/**",
                                        "/api/products",
                                        "/api/products/**",
                                        "/api/product/**",
                                        "/api/attributes",
                                        "/api/attributes/**",
                                        "/api/attribute/**"
                                ).permitAll()

                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                .requestMatchers("/api/**").authenticated()

                                .anyRequest().authenticated()
                );
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        http.cors(cors -> {})
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(unauthorizedHandler));
        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}