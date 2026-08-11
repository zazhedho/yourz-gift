package security

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var turnstileSiteVerifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

func VerifyTurnstile(ctx context.Context, secret, token, remoteIP, action string) error {
	secret = strings.TrimSpace(secret)
	token = strings.TrimSpace(token)
	if secret == "" || token == "" || len(token) > 2048 {
		return fmt.Errorf("invalid Turnstile input")
	}

	form := url.Values{
		"secret":   {secret},
		"response": {token},
	}
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, turnstileSiteVerifyURL, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Turnstile siteverify returned status %d", resp.StatusCode)
	}

	var result struct {
		Success bool   `json:"success"`
		Action  string `json:"action"`
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 64<<10)).Decode(&result); err != nil {
		return err
	}
	if !result.Success || (action != "" && result.Action != action) {
		return fmt.Errorf("Turnstile verification failed")
	}
	return nil
}
