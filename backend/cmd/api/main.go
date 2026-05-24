package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	dbmigrations "bank-darah-backend/database"
	"bank-darah-backend/internal/app"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	cfg := app.LoadConfig()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("connect database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := dbmigrations.RunMigrations(ctx, pool); err != nil {
		logger.Error("run migrations", "error", err)
		os.Exit(1)
	}

	store := app.NewStore(pool, cfg)
	if err := store.RefreshEligibility(ctx); err != nil {
		logger.Error("refresh eligibility", "error", err)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           app.New(cfg, store, logger).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	logger.Info("bank darah api started", "addr", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
