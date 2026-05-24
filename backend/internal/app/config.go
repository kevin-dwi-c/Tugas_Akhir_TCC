package app

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port                  string
	DatabaseURL           string
	JWTSecret             string
	AuthRequired          bool
	PMIName               string
	PMILocation           string
	PMILatitude           float64
	PMILongitude          float64
	EligibleRadius        float64
	TokenTTL              time.Duration
	SchedulerInterval     time.Duration
	QREncryptionKey       string
	FCMProjectID          string
	FCMServiceAccountPath string
}

func LoadConfig() Config {
	return Config{
		Port:                  env("PORT", "8080"),
		DatabaseURL:           env("DATABASE_URL", "postgres://bank_darah:bank_darah@127.0.0.1:5432/bank_darah?sslmode=disable"),
		JWTSecret:             env("JWT_SECRET", "dev-bank-darah-secret"),
		AuthRequired:          env("AUTH_REQUIRED", "true") != "false",
		PMIName:               env("PMI_NAME", "PMI Kota Yogyakarta"),
		PMILocation:           env("PMI_LOCATION", "UDD PMI Kota Yogyakarta"),
		PMILatitude:           envFloat("PMI_LATITUDE", -7.7839),
		PMILongitude:          envFloat("PMI_LONGITUDE", 110.3798),
		EligibleRadius:        envFloat("ELIGIBLE_RADIUS_KM", 10),
		TokenTTL:              8 * time.Hour,
		SchedulerInterval:     time.Duration(envInt("SCHEDULER_INTERVAL_HOURS", 1)) * time.Hour,
		QREncryptionKey:       env("QR_ENCRYPTION_KEY", ""),
		FCMProjectID:          env("FCM_PROJECT_ID", ""),
		FCMServiceAccountPath: env("FCM_SERVICE_ACCOUNT_PATH", ""),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envFloat(key string, fallback float64) float64 {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return fallback
	}
	return parsed
}

func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
