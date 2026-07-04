package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestNewRoutesRegistersHealthcheck(t *testing.T) {
	routes := NewRoutes()

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/healthcheck", nil)
	routes.App.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestSessionRoutesSkipsWhenRedisUnavailable(t *testing.T) {
	routes := NewRoutes()
	routes.SessionRoutes()

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/user/sessions", nil)
	routes.App.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected unregistered route to return 404, got %d", rec.Code)
	}
}

func newRouterDryRunDB(t *testing.T) *gorm.DB {
	t.Helper()
	sqlDB, _, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })

	db, err := gorm.Open(postgres.New(postgres.Config{Conn: sqlDB, PreferSimpleProtocol: true}), &gorm.Config{
		DryRun:                 true,
		SkipDefaultTransaction: true,
	})
	if err != nil {
		t.Fatalf("open gorm: %v", err)
	}
	return db
}

func TestRouteGroupsRegisterWithDryRunDB(t *testing.T) {
	routes := NewRoutes()
	routes.DB = newRouterDryRunDB(t)

	routes.UserRoutes()
	routes.RoleRoutes()
	routes.PermissionRoutes()
	routes.MenuRoutes()
	routes.AppConfigRoutes()
	routes.AuditRoutes()
	routes.LocationRoutes()

	registered := map[string]bool{}
	for _, route := range routes.App.Routes() {
		registered[route.Method+" "+route.Path] = true
	}

	for _, want := range []string{
		"POST /api/user/register",
		"POST /api/user/login",
		"GET /api/roles",
		"GET /api/permissions",
		"GET /api/menus",
		"GET /api/configs",
		"GET /api/audits",
		"GET /api/location/province",
		"POST /api/location/sync",
	} {
		if !registered[want] {
			t.Fatalf("expected route %s to be registered", want)
		}
	}
}

func TestGiftRoutesRegisterNestedListRoutes(t *testing.T) {
	routes := NewRoutes()
	routes.DB = newRouterDryRunDB(t)

	routes.GiftRoutes()

	registered := map[string]bool{}
	for _, route := range routes.App.Routes() {
		registered[route.Method+" "+route.Path] = true
	}

	for _, want := range []string{
		"GET /api/gift-lists/:id",
		"GET /api/gift-lists/friends",
		"GET /api/gift-lists/:id/items",
		"POST /api/gift-lists/:id/items",
		"POST /api/gift-lists/:id/items/reorder",
		"GET /api/gift-lists/:id/reservations",
		"POST /api/gift-reservations/:id/thank",
		"GET /api/friends",
		"GET /api/friends/requests",
		"POST /api/friends/request",
		"POST /api/friends/:id/accept",
		"POST /api/friends/:id/reject",
		"DELETE /api/friends/:id",
	} {
		if !registered[want] {
			t.Fatalf("expected route %s to be registered", want)
		}
	}
}

func TestMediaRoutesRegisterRoutes(t *testing.T) {
	routes := NewRoutes()
	routes.DB = newRouterDryRunDB(t)

	routes.MediaRoutes()

	registered := map[string]bool{}
	for _, route := range routes.App.Routes() {
		registered[route.Method+" "+route.Path] = true
	}

	for _, want := range []string{
		"POST /api/media/upload",
		"DELETE /api/media",
	} {
		if !registered[want] {
			t.Fatalf("expected route %s to be registered", want)
		}
	}
}
