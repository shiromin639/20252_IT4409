package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func createProxy(targetURL string) *httputil.ReverseProxy {
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Fatal(err)
	}
	return httputil.NewSingleHostReverseProxy(target)
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
		MaxAge:         300,
	}))

	// Setup proxies
	productProxy := createProxy(getEnvOrDefault("PRODUCT_SERVICE_URL", "http://localhost:8001"))
	inventoryProxy := createProxy(getEnvOrDefault("INVENTORY_SERVICE_URL", "http://localhost:8002"))
	cartProxy := createProxy(getEnvOrDefault("CART_SERVICE_URL", "http://localhost:8003"))
	orderProxy := createProxy(getEnvOrDefault("ORDER_SERVICE_URL", "http://localhost:8004"))
	userProxy := createProxy(getEnvOrDefault("USER_SERVICE_URL", "http://localhost:8005"))

	// Middleware to rewrite /v1 prefix
	rewriteV1 := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.URL.Path = strings.TrimPrefix(r.URL.Path, "/v1")
			next.ServeHTTP(w, r)
		})
	}

	r.Route("/v1", func(r chi.Router) {
		r.Use(rewriteV1)

		r.Mount("/products", productProxy)
		r.Mount("/categories", productProxy)
		r.Mount("/brands", productProxy)
		r.Mount("/reviews", productProxy)
		r.Mount("/static", productProxy)
		r.Mount("/upload-image", productProxy)

		r.Mount("/inventory", inventoryProxy)

		r.Mount("/carts", cartProxy)

		r.Mount("/orders", orderProxy)
		r.Mount("/payments", orderProxy)

		r.Mount("/users", userProxy)
		r.Mount("/login", userProxy)
		r.Mount("/register", userProxy)
		r.Mount("/profile", userProxy)

		// Admin routes
		r.Mount("/admin/reviews", productProxy)
		r.Mount("/admin", orderProxy)
	})

	s := http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	log.Println("API Gateway listening on :8080")
	err := s.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
