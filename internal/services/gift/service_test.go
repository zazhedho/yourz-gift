package servicegift

import (
	"context"
	"errors"
	"testing"
	"time"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	"yourz-gift/pkg/filter"
)

func TestBuildItemResponsesCalculatesRemaining(t *testing.T) {
	fake := &fakeGiftRepo{
		items: []domaingift.GiftItem{{
			Id:       "item-1",
			ListId:   "list-1",
			Name:     "Piring",
			Quantity: 6,
			Currency: "IDR",
			IsActive: true,
		}},
		reserved: map[string]int{"item-1": 2},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	got, err := svc.buildItemResponses(context.Background(), "list-1", false)
	if err != nil {
		t.Fatalf("buildItemResponses error = %v", err)
	}
	if got[0].QuantityRemaining != 4 {
		t.Fatalf("remaining = %d, want 4", got[0].QuantityRemaining)
	}
	if got[0].DisplayQuantity != "4 of 6 available" {
		t.Fatalf("display = %q", got[0].DisplayQuantity)
	}
	if !got[0].CanReserve {
		t.Fatalf("CanReserve = false, want true")
	}
}

func TestGetPublicListRejectsPrivateList(t *testing.T) {
	fake := &fakeGiftRepo{list: domaingift.GiftList{
		Id:           "list-1",
		ShareCode:    "ABC12345",
		Visibility:   domaingift.ListVisibilityPrivate,
		IsActive:     true,
		NeverExpires: true,
	}}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	_, err := svc.GetPublicList(context.Background(), "ABC12345")
	if !errors.Is(err, ErrGiftListNotPublic) {
		t.Fatalf("err = %v, want ErrGiftListNotPublic", err)
	}
}

func TestCreateListDefaultsToNeverExpires(t *testing.T) {
	fake := &fakeGiftRepo{}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	got, err := svc.CreateList(context.Background(), "owner-1", dto.GiftListCreate{Title: "Birthday"})
	if err != nil {
		t.Fatalf("CreateList error = %v", err)
	}
	if !got.NeverExpires {
		t.Fatalf("NeverExpires = false, want true")
	}
	if got.ExpiresAt != nil {
		t.Fatalf("ExpiresAt = %v, want nil", got.ExpiresAt)
	}
	if !fake.storedList.NeverExpires {
		t.Fatalf("stored NeverExpires = false, want true")
	}
}

func TestGetPublicListRejectsExpiredList(t *testing.T) {
	expiredAt := time.Now().Add(-time.Hour)
	fake := &fakeGiftRepo{list: domaingift.GiftList{
		Id:           "list-1",
		ShareCode:    "ABC12345",
		Visibility:   domaingift.ListVisibilityPublic,
		IsActive:     true,
		NeverExpires: false,
		ExpiresAt:    &expiredAt,
	}}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	_, err := svc.GetPublicList(context.Background(), "ABC12345")
	if !errors.Is(err, ErrGiftListNotPublic) {
		t.Fatalf("err = %v, want ErrGiftListNotPublic", err)
	}
}

func TestCreatePublicReservationDefaultsShowName(t *testing.T) {
	fake := &fakeGiftRepo{
		list: domaingift.GiftList{
			Id:           "list-1",
			ShareCode:    "ABC12345",
			Visibility:   domaingift.ListVisibilityPublic,
			IsActive:     true,
			NeverExpires: true,
		},
		item: domaingift.GiftItem{
			Id:         "item-1",
			ListId:     "list-1",
			Quantity:   1,
			IsActive:   true,
			IsArchived: false,
		},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	got, err := svc.CreatePublicReservation(context.Background(), "ABC12345", "item-1", dto.GiftReservationCreate{
		GuestEmail: "TEST@Example.COM",
		Quantity:   1,
	})
	if err != nil {
		t.Fatalf("CreatePublicReservation error = %v", err)
	}
	if got.GuestEmail != "test@example.com" {
		t.Fatalf("GuestEmail = %q", got.GuestEmail)
	}
	if !got.ShowName {
		t.Fatalf("ShowName = false, want true")
	}
}

func TestGetFriendListsUsesAcceptedFriends(t *testing.T) {
	fake := &fakeGiftRepo{
		friendLists: []domaingift.GiftList{{
			Id:       "list-2",
			OwnerId:  "friend-1",
			Title:    "Friend birthday",
			IsActive: true,
		}},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, fakeGiftFriendRepo{fake}, nil)

	got, total, err := svc.GetFriendLists(context.Background(), "user-1", filter.BaseParams{Limit: 20})
	if err != nil {
		t.Fatalf("GetFriendLists error = %v", err)
	}
	if total != 1 {
		t.Fatalf("total = %d, want 1", total)
	}
	if got[0].OwnerId != "friend-1" {
		t.Fatalf("owner = %q, want friend-1", got[0].OwnerId)
	}
}

func TestMarkReservationThankedSetsTimestamp(t *testing.T) {
	fake := &fakeGiftRepo{
		list: domaingift.GiftList{
			Id:      "list-1",
			OwnerId: "owner-1",
		},
		item: domaingift.GiftItem{
			Id:     "item-1",
			ListId: "list-1",
		},
		reservation: domaingift.GiftReservation{
			Id:     "reservation-1",
			ItemId: "item-1",
		},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	got, err := svc.MarkReservationThanked(context.Background(), "owner-1", "reservation-1")
	if err != nil {
		t.Fatalf("MarkReservationThanked error = %v", err)
	}
	if got.ThankedAt == nil {
		t.Fatalf("ThankedAt = nil, want timestamp")
	}
	if fake.updatedReservation.ThankedAt == nil {
		t.Fatalf("updated ThankedAt = nil, want timestamp")
	}
}

func TestCancelReservationSetsCanceledStatusAndOwner(t *testing.T) {
	fake := &fakeGiftRepo{
		list: domaingift.GiftList{
			Id:      "list-1",
			OwnerId: "owner-1",
		},
		item: domaingift.GiftItem{
			Id:     "item-1",
			ListId: "list-1",
		},
		reservation: domaingift.GiftReservation{
			Id:     "reservation-1",
			ItemId: "item-1",
			Status: domaingift.ReservationStatusConfirmed,
		},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake}, nil, nil)

	got, err := svc.CancelReservation(context.Background(), "owner-1", "reservation-1", dto.GiftReservationCancel{CancelReason: "Guest changed plan"})
	if err != nil {
		t.Fatalf("CancelReservation error = %v", err)
	}
	if got.Status != domaingift.ReservationStatusCanceled {
		t.Fatalf("Status = %q, want %q", got.Status, domaingift.ReservationStatusCanceled)
	}
	if got.CanceledAt == nil {
		t.Fatalf("CanceledAt = nil, want timestamp")
	}
	if got.CanceledBy == nil || *got.CanceledBy != "owner-1" {
		t.Fatalf("CanceledBy = %v, want owner-1", got.CanceledBy)
	}
	if got.CancelReason != "Guest changed plan" {
		t.Fatalf("CancelReason = %q, want reason", got.CancelReason)
	}
	if fake.updatedReservation.Status != domaingift.ReservationStatusCanceled {
		t.Fatalf("updated Status = %q, want %q", fake.updatedReservation.Status, domaingift.ReservationStatusCanceled)
	}
}

type fakeGiftRepo struct {
	list               domaingift.GiftList
	storedList         domaingift.GiftList
	item               domaingift.GiftItem
	items              []domaingift.GiftItem
	reservation        domaingift.GiftReservation
	updatedReservation domaingift.GiftReservation
	friendLists        []domaingift.GiftList
	reserved           map[string]int
}

type fakeGiftListRepo struct{ *fakeGiftRepo }
type fakeGiftItemRepo struct{ *fakeGiftRepo }
type fakeGiftReservationRepo struct{ *fakeGiftRepo }
type fakeGiftFriendRepo struct{ *fakeGiftRepo }

func (f fakeGiftListRepo) Store(_ context.Context, list domaingift.GiftList) error {
	f.storedList = list
	return nil
}
func (f fakeGiftListRepo) GetByID(context.Context, string) (domaingift.GiftList, error) {
	return f.list, nil
}
func (f fakeGiftListRepo) GetAll(context.Context, filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftListRepo) Update(context.Context, domaingift.GiftList) error { return nil }
func (f fakeGiftListRepo) Delete(context.Context, string) error              { return nil }
func (f fakeGiftListRepo) SoftDelete(context.Context, string, string) error  { return nil }
func (f fakeGiftListRepo) GetListByShareCode(context.Context, string) (domaingift.GiftList, error) {
	return f.list, nil
}
func (f fakeGiftListRepo) GetListsByOwner(context.Context, string, filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftListRepo) GetListsByFriendOwners(context.Context, string, filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return f.friendLists, int64(len(f.friendLists)), nil
}

func (f fakeGiftItemRepo) Store(context.Context, domaingift.GiftItem) error { return nil }
func (f fakeGiftItemRepo) GetByID(context.Context, string) (domaingift.GiftItem, error) {
	return f.item, nil
}
func (f fakeGiftItemRepo) GetAll(context.Context, filter.BaseParams) ([]domaingift.GiftItem, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftItemRepo) Update(context.Context, domaingift.GiftItem) error { return nil }
func (f fakeGiftItemRepo) Delete(context.Context, string) error              { return nil }
func (f fakeGiftItemRepo) SoftDelete(context.Context, string, string) error  { return nil }
func (f fakeGiftItemRepo) GetItemsByList(context.Context, string, bool) ([]domaingift.GiftItem, error) {
	return f.items, nil
}
func (f fakeGiftItemRepo) ReorderItems(context.Context, string, []dto.GiftItemPriority) error {
	return nil
}

func (f fakeGiftReservationRepo) Store(context.Context, domaingift.GiftReservation) error {
	return nil
}
func (f fakeGiftReservationRepo) GetByID(context.Context, string) (domaingift.GiftReservation, error) {
	return f.reservation, nil
}
func (f fakeGiftReservationRepo) GetAll(context.Context, filter.BaseParams) ([]domaingift.GiftReservation, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftReservationRepo) Update(_ context.Context, reservation domaingift.GiftReservation) error {
	f.updatedReservation = reservation
	return nil
}
func (f fakeGiftReservationRepo) Delete(context.Context, string) error             { return nil }
func (f fakeGiftReservationRepo) SoftDelete(context.Context, string, string) error { return nil }
func (f fakeGiftReservationRepo) GetReservedQuantities(context.Context, []string) (map[string]int, error) {
	return f.reserved, nil
}
func (f fakeGiftReservationRepo) CreateReservationWithAvailability(context.Context, domaingift.GiftReservation) error {
	return nil
}
func (f fakeGiftReservationRepo) GetReservationsByList(context.Context, string) ([]domaingift.GiftReservation, error) {
	return nil, nil
}

func (f fakeGiftFriendRepo) Store(context.Context, domaingift.GiftFriend) error { return nil }
func (f fakeGiftFriendRepo) GetByID(context.Context, string) (domaingift.GiftFriend, error) {
	return domaingift.GiftFriend{}, nil
}
func (f fakeGiftFriendRepo) GetAll(context.Context, filter.BaseParams) ([]domaingift.GiftFriend, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftFriendRepo) Update(context.Context, domaingift.GiftFriend) error { return nil }
func (f fakeGiftFriendRepo) Delete(context.Context, string) error                { return nil }
func (f fakeGiftFriendRepo) SoftDelete(context.Context, string, string) error    { return nil }
func (f fakeGiftFriendRepo) FindBetweenUsers(context.Context, string, string) (domaingift.GiftFriend, error) {
	return domaingift.GiftFriend{}, nil
}
func (f fakeGiftFriendRepo) GetFriends(context.Context, string, filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftFriendRepo) GetPendingRequests(context.Context, string, filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	return nil, 0, nil
}
