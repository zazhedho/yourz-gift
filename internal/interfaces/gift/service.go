package interfacegift

import (
	"context"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	"yourz-gift/pkg/filter"
)

type ServiceGiftInterface interface {
	CreateList(ctx context.Context, ownerId string, req dto.GiftListCreate) (domaingift.GiftList, error)
	GetOwnerLists(ctx context.Context, ownerId string, params filter.BaseParams) ([]domaingift.GiftList, int64, error)
	GetOwnerList(ctx context.Context, ownerId, listId string) (domaingift.GiftList, error)
	UpdateList(ctx context.Context, ownerId, listId string, req dto.GiftListUpdate) (domaingift.GiftList, error)
	DeleteList(ctx context.Context, ownerId, listId string) error

	CreateItem(ctx context.Context, ownerId, listId string, req dto.GiftItemCreate) (domaingift.GiftItem, error)
	GetOwnerItems(ctx context.Context, ownerId, listId string, includeArchived bool) ([]dto.GiftItemPublicResponse, error)
	UpdateItem(ctx context.Context, ownerId, itemId string, req dto.GiftItemUpdate) (domaingift.GiftItem, error)
	DeleteItem(ctx context.Context, ownerId, itemId string) error
	ReorderItems(ctx context.Context, ownerId, listId string, req dto.GiftItemReorder) error
	GetReservations(ctx context.Context, ownerId, listId string) ([]domaingift.GiftReservation, error)

	GetPublicList(ctx context.Context, shareCode string) (dto.GiftListPublicResponse, error)
	GetPublicItems(ctx context.Context, shareCode string) ([]dto.GiftItemPublicResponse, error)
	CreatePublicReservation(ctx context.Context, shareCode, itemId string, req dto.GiftReservationCreate) (domaingift.GiftReservation, error)
}
