package servicegift

import (
	"context"
	"errors"
	"testing"
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
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake})

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
		Id:         "list-1",
		ShareCode:  "ABC12345",
		Visibility: domaingift.ListVisibilityPrivate,
		IsActive:   true,
	}}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake})

	_, err := svc.GetPublicList(context.Background(), "ABC12345")
	if !errors.Is(err, ErrGiftListNotPublic) {
		t.Fatalf("err = %v, want ErrGiftListNotPublic", err)
	}
}

func TestCreatePublicReservationDefaultsShowName(t *testing.T) {
	fake := &fakeGiftRepo{
		list: domaingift.GiftList{
			Id:         "list-1",
			ShareCode:  "ABC12345",
			Visibility: domaingift.ListVisibilityPublic,
			IsActive:   true,
		},
		item: domaingift.GiftItem{
			Id:         "item-1",
			ListId:     "list-1",
			Quantity:   1,
			IsActive:   true,
			IsArchived: false,
		},
	}
	svc := NewGiftService(fakeGiftListRepo{fake}, fakeGiftItemRepo{fake}, fakeGiftReservationRepo{fake})

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

type fakeGiftRepo struct {
	list     domaingift.GiftList
	item     domaingift.GiftItem
	items    []domaingift.GiftItem
	reserved map[string]int
}

type fakeGiftListRepo struct{ *fakeGiftRepo }
type fakeGiftItemRepo struct{ *fakeGiftRepo }
type fakeGiftReservationRepo struct{ *fakeGiftRepo }

func (f fakeGiftListRepo) Store(context.Context, domaingift.GiftList) error { return nil }
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
	return domaingift.GiftReservation{}, nil
}
func (f fakeGiftReservationRepo) GetAll(context.Context, filter.BaseParams) ([]domaingift.GiftReservation, int64, error) {
	return nil, 0, nil
}
func (f fakeGiftReservationRepo) Update(context.Context, domaingift.GiftReservation) error {
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
