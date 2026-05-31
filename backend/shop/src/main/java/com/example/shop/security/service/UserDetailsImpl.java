package com.example.shop.security.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.shop.models.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@Data
public class UserDetailsImpl implements UserDetails {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String name;
    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    // Profile fields
    private String phoneNumber;
    private java.time.LocalDate birth;
    private Boolean gender;
    private String state;

    public UserDetailsImpl(Long id, String username, String password,
                           Collection<? extends GrantedAuthority> authorities,
                           String phoneNumber) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.phoneNumber = phoneNumber;
    }

    public static UserDetailsImpl build(User user) {

        GrantedAuthority authority =
                new SimpleGrantedAuthority(user.getRole().getRoleName().name());

        return new UserDetailsImpl(
                user.getUserId(),
                user.getUsername(),
                user.getPassword(),
                List.of(authority),
                user.getPhoneNumber()
        );
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }


    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    public boolean hasRole(String role) {
        return authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}