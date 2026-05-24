package app

import (
	"context"
	"log/slog"
	"sync"
	"time"
)

type Scheduler struct {
	store    *Store
	logger   *slog.Logger
	done     chan struct{}
	wg       sync.WaitGroup
	stopOnce sync.Once
}

func NewScheduler(store *Store, logger *slog.Logger) *Scheduler {
	return &Scheduler{
		store:  store,
		logger: logger,
		done:   make(chan struct{}),
	}
}

func (s *Scheduler) Start() {
	s.wg.Add(1)
	go s.runDaily()
}

func (s *Scheduler) Stop() {
	s.stopOnce.Do(func() {
		close(s.done)
	})
	s.wg.Wait()
}

func (s *Scheduler) runDaily() {
	defer s.wg.Done()

	interval := s.interval()
	s.runMaintenance()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.runMaintenance()
		case <-s.done:
			s.logger.Info("scheduler stopped")
			return
		}
	}
}

func (s *Scheduler) runMaintenance() {
	donorCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	donorsUpdated, err := s.store.RefreshEligibility(donorCtx)
	cancel()
	if err != nil {
		s.logger.Error("refresh donor eligibility", "error", err)
	} else {
		s.logger.Info("refreshed donor eligibility", "donors_updated", donorsUpdated)
	}

	broadcastCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	broadcastsExpired, err := s.store.ExpireBroadcasts(broadcastCtx)
	cancel()
	if err != nil {
		s.logger.Error("expire emergency broadcasts", "error", err)
	} else {
		s.logger.Info("expired emergency broadcasts", "broadcasts_expired", broadcastsExpired)
	}
}

func (s *Scheduler) interval() time.Duration {
	if s.store != nil && s.store.cfg.SchedulerInterval > 0 {
		return s.store.cfg.SchedulerInterval
	}
	return time.Hour
}
