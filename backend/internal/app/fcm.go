package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const (
	fcmScope     = "https://www.googleapis.com/auth/firebase.messaging"
	fcmBatchSize = 500
)

type FCMClient struct {
	tokenSource oauth2.TokenSource
	projectID   string
	httpClient  *http.Client
}

func NewFCMClient(serviceAccountJSON []byte, projectID string) (*FCMClient, error) {
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return nil, errors.New("fcm project ID is required")
	}
	if len(serviceAccountJSON) == 0 {
		return nil, errors.New("fcm service account JSON is required")
	}

	config, err := google.JWTConfigFromJSON(serviceAccountJSON, fcmScope)
	if err != nil {
		return nil, fmt.Errorf("parse fcm service account JSON: %w", err)
	}

	return &FCMClient{
		tokenSource: oauth2.ReuseTokenSource(nil, config.TokenSource(context.Background())),
		projectID:   projectID,
		httpClient:  http.DefaultClient,
	}, nil
}

func (c *FCMClient) SendNotification(ctx context.Context, token, title, body string, data map[string]string) error {
	if c == nil {
		return errors.New("fcm client is nil")
	}
	token = strings.TrimSpace(token)
	if token == "" {
		return errors.New("fcm device token is empty")
	}

	accessToken, err := c.tokenSource.Token()
	if err != nil {
		return fmt.Errorf("get fcm access token: %w", err)
	}

	messageData := cloneStringMap(data)
	priority := "NORMAL"
	var androidNotification *fcmAndroidNotification
	if isCriticalUrgency(messageData) {
		priority = "HIGH"
		androidNotification = &fcmAndroidNotification{Sound: "alarm"}
	}

	payload := fcmSendRequest{
		Message: fcmMessage{
			Token: token,
			Notification: fcmNotification{
				Title: title,
				Body:  body,
			},
			Data: messageData,
			Android: fcmAndroidConfig{
				Priority:     priority,
				Notification: androidNotification,
			},
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal fcm payload: %w", err)
	}

	endpoint := fmt.Sprintf("https://fcm.googleapis.com/v1/projects/%s/messages:send", url.PathEscape(c.projectID))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("create fcm request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("send fcm request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		responseBody, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("fcm returned %s: %s", resp.Status, strings.TrimSpace(string(responseBody)))
	}

	return nil
}

func (c *FCMClient) SendBatch(ctx context.Context, tokens []string, title, body string, data map[string]string) []error {
	errs := make([]error, len(tokens))
	if len(tokens) == 0 {
		return errs
	}

	var wg sync.WaitGroup
	for start := 0; start < len(tokens); start += fcmBatchSize {
		end := start + fcmBatchSize
		if end > len(tokens) {
			end = len(tokens)
		}

		wg.Add(1)
		go func(start, end int) {
			defer wg.Done()
			for i := start; i < end; i++ {
				errs[i] = c.SendNotification(ctx, tokens[i], title, body, data)
			}
		}(start, end)
	}
	wg.Wait()

	return errs
}

type fcmSendRequest struct {
	Message fcmMessage `json:"message"`
}

type fcmMessage struct {
	Token        string            `json:"token"`
	Notification fcmNotification   `json:"notification"`
	Data         map[string]string `json:"data,omitempty"`
	Android      fcmAndroidConfig  `json:"android"`
}

type fcmNotification struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type fcmAndroidConfig struct {
	Priority     string                  `json:"priority"`
	Notification *fcmAndroidNotification `json:"notification,omitempty"`
}

type fcmAndroidNotification struct {
	Sound string `json:"sound,omitempty"`
}

func cloneStringMap(input map[string]string) map[string]string {
	if len(input) == 0 {
		return nil
	}
	clone := make(map[string]string, len(input))
	for key, value := range input {
		clone[key] = value
	}
	return clone
}

func isCriticalUrgency(data map[string]string) bool {
	for _, key := range []string{"urgency_level", "urgencyLevel", "urgency"} {
		if strings.EqualFold(data[key], "CRITICAL") {
			return true
		}
	}
	return false
}
