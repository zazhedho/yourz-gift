package handlergift

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	repositorygift "yourz-gift/internal/repositories/gift"
	servicegift "yourz-gift/internal/services/gift"
	"yourz-gift/pkg/filter"

	"github.com/gin-gonic/gin"
)

func TestCreatePublicReservationReturnsConflictWhenSoldOut(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	handler := NewGiftHandler(&fakeGiftService{reservationErr: repositorygift.ErrInsufficientQuantity}, nil)
	router.POST("/api/public/gift-lists/:code/items/:item_id/reservations", handler.CreatePublicReservation)

	req := httptest.NewRequest(http.MethodPost, "/api/public/gift-lists/ABC12345/items/item-1/reservations", bytes.NewBufferString(`{"guest_email":"guest@example.com","quantity":1}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusConflict)
	}
}

func TestGetPublicListReturnsNotFoundForPrivateList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	handler := NewGiftHandler(&fakeGiftService{publicListErr: servicegift.ErrGiftListNotPublic}, nil)
	router.GET("/api/public/gift-lists/:code", handler.GetPublicList)

	req := httptest.NewRequest(http.MethodGet, "/api/public/gift-lists/ABC12345", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

type fakeGiftService struct {
	publicListErr  error
	reservationErr error
}

func (f *fakeGiftService) CreateList(context.Context, string, dto.GiftListCreate) (domaingift.GiftList, error) {
	return domaingift.GiftList{}, nil
}
func (f *fakeGiftService) GetOwnerLists(context.Context, string, filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return nil, 0, nil
}
func (f *fakeGiftService) GetOwnerList(context.Context, string, string) (domaingift.GiftList, error) {
	return domaingift.GiftList{}, nil
}
func (f *fakeGiftService) UpdateList(context.Context, string, string, dto.GiftListUpdate) (domaingift.GiftList, error) {
	return domaingift.GiftList{}, nil
}
func (f *fakeGiftService) DeleteList(context.Context, string, string) error { return nil }
func (f *fakeGiftService) CreateItem(context.Context, string, string, dto.GiftItemCreate) (domaingift.GiftItem, error) {
	return domaingift.GiftItem{}, nil
}
func (f *fakeGiftService) GetOwnerItems(context.Context, string, string, bool) ([]dto.GiftItemPublicResponse, error) {
	return nil, nil
}
func (f *fakeGiftService) UpdateItem(context.Context, string, string, dto.GiftItemUpdate) (domaingift.GiftItem, error) {
	return domaingift.GiftItem{}, nil
}
func (f *fakeGiftService) DeleteItem(context.Context, string, string) error { return nil }
func (f *fakeGiftService) ReorderItems(context.Context, string, string, dto.GiftItemReorder) error {
	return nil
}
func (f *fakeGiftService) GetReservations(context.Context, string, string) ([]domaingift.GiftReservation, error) {
	return nil, nil
}
func (f *fakeGiftService) MarkReservationThanked(context.Context, string, string) (domaingift.GiftReservation, error) {
	return domaingift.GiftReservation{}, nil
}
func (f *fakeGiftService) CancelReservation(context.Context, string, string, dto.GiftReservationCancel) (domaingift.GiftReservation, error) {
	return domaingift.GiftReservation{}, nil
}
func (f *fakeGiftService) GetFriendLists(context.Context, string, filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return nil, 0, nil
}
func (f *fakeGiftService) RequestFriend(context.Context, string, dto.GiftFriendRequest) (domaingift.GiftFriend, error) {
	return domaingift.GiftFriend{}, nil
}
func (f *fakeGiftService) GetFriends(context.Context, string, filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	return nil, 0, nil
}
func (f *fakeGiftService) GetPendingFriendRequests(context.Context, string, filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	return nil, 0, nil
}
func (f *fakeGiftService) AcceptFriend(context.Context, string, string) (domaingift.GiftFriend, error) {
	return domaingift.GiftFriend{}, nil
}
func (f *fakeGiftService) RejectFriend(context.Context, string, string) (domaingift.GiftFriend, error) {
	return domaingift.GiftFriend{}, nil
}
func (f *fakeGiftService) DeleteFriend(context.Context, string, string) error { return nil }
func (f *fakeGiftService) GetPublicList(context.Context, string) (dto.GiftListPublicResponse, error) {
	if f.publicListErr != nil {
		return dto.GiftListPublicResponse{}, f.publicListErr
	}
	return dto.GiftListPublicResponse{}, nil
}
func (f *fakeGiftService) GetPublicItems(context.Context, string) ([]dto.GiftItemPublicResponse, error) {
	return nil, nil
}
func (f *fakeGiftService) CreatePublicReservation(context.Context, string, string, dto.GiftReservationCreate) (domaingift.GiftReservation, error) {
	if f.reservationErr != nil {
		return domaingift.GiftReservation{}, f.reservationErr
	}
	return domaingift.GiftReservation{}, nil
}

var _ = errors.Is
