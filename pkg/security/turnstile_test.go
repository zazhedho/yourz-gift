package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestVerifyTurnstilePostsTokenAndValidatesAction(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			t.Fatalf("parse form: %v", err)
		}
		if r.FormValue("secret") != "secret" || r.FormValue("response") != "token" || r.FormValue("remoteip") != "127.0.0.1" {
			t.Fatalf("unexpected form: %v", r.Form)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"action":"auth"}`))
	}))
	defer server.Close()

	previousURL := turnstileSiteVerifyURL
	turnstileSiteVerifyURL = server.URL
	defer func() { turnstileSiteVerifyURL = previousURL }()

	if err := VerifyTurnstile(context.Background(), "secret", "token", "127.0.0.1", "auth"); err != nil {
		t.Fatalf("VerifyTurnstile error = %v", err)
	}
}

func TestVerifyTurnstileRejectsFailedResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":false,"error-codes":["invalid-input-response"]}`))
	}))
	defer server.Close()

	previousURL := turnstileSiteVerifyURL
	turnstileSiteVerifyURL = server.URL
	defer func() { turnstileSiteVerifyURL = previousURL }()

	if err := VerifyTurnstile(context.Background(), "secret", strings.Repeat("x", 10), "", "auth"); err == nil {
		t.Fatal("expected failed Turnstile response error")
	}
}

func TestVerifyTurnstileAcceptsCloudflareTestingResponseWithoutAction(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"metadata":{"result_with_testing_key":true}}`))
	}))
	defer server.Close()

	previousURL := turnstileSiteVerifyURL
	turnstileSiteVerifyURL = server.URL
	defer func() { turnstileSiteVerifyURL = previousURL }()

	if err := VerifyTurnstile(context.Background(), "secret", "XXXX.DUMMY.TOKEN.XXXX", "", "auth"); err != nil {
		t.Fatalf("VerifyTurnstile error = %v", err)
	}
}
