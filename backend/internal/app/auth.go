package app

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

type contextKey string

const adminContextKey contextKey = "admin"

type tokenClaims struct {
	Subject  string `json:"sub"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Expires  int64  `json:"exp"`
}

func verifyPassword(hash, password string) bool {
	if strings.HasPrefix(hash, "sha256$") {
		sum := sha256.Sum256([]byte(password))
		return hmac.Equal([]byte(strings.TrimPrefix(hash, "sha256$")), []byte(hex.EncodeToString(sum[:])))
	}
	return hmac.Equal([]byte(hash), []byte(password))
}

func signToken(secret string, admin AdminUser, ttl time.Duration) (string, error) {
	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	claims := tokenClaims{
		Subject:  admin.ID,
		Username: admin.Username,
		Role:     admin.Role,
		Expires:  time.Now().Add(ttl).Unix(),
	}

	headerBytes, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	claimsBytes, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	unsigned := base64.RawURLEncoding.EncodeToString(headerBytes) + "." + base64.RawURLEncoding.EncodeToString(claimsBytes)
	signature := hmacSHA256(secret, unsigned)
	return unsigned + "." + signature, nil
}

func parseToken(secret, token string) (AdminUser, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return AdminUser{}, errors.New("invalid token")
	}

	unsigned := parts[0] + "." + parts[1]
	expected := hmacSHA256(secret, unsigned)
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return AdminUser{}, errors.New("invalid signature")
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return AdminUser{}, err
	}

	var claims tokenClaims
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return AdminUser{}, err
	}
	if time.Now().Unix() > claims.Expires {
		return AdminUser{}, errors.New("token expired")
	}

	return AdminUser{ID: claims.Subject, Username: claims.Username, Role: claims.Role}, nil
}

func hmacSHA256(secret, value string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(value))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func adminFromContext(ctx context.Context) AdminUser {
	admin, _ := ctx.Value(adminContextKey).(AdminUser)
	return admin
}

func withAdmin(ctx context.Context, admin AdminUser) context.Context {
	return context.WithValue(ctx, adminContextKey, admin)
}

func bearerToken(r *http.Request) string {
	header := r.Header.Get("Authorization")
	if strings.HasPrefix(header, "Bearer ") {
		return strings.TrimPrefix(header, "Bearer ")
	}
	if cookie, err := r.Cookie("admin_token"); err == nil {
		return cookie.Value
	}
	return ""
}
