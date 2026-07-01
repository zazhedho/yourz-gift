package interfacegift

import (
	"context"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	interfacegeneric "yourz-gift/internal/interfaces/generic"
	"yourz-gift/pkg/filter"
)

type RepoGiftListInterface interface {
	interfacegeneric.GenericRepository[domaingift.GiftList]

	GetListByShareCode(ctx context.Context, code string) (domaingift.GiftList, error)
	GetListsByOwner(ctx context.Context, ownerId string, params filter.BaseParams) ([]domaingift.GiftList, int64, error)
}

type RepoGiftItemInterface interface {
	interfacegeneric.GenericRepository[domaingift.GiftItem]

	GetItemsByList(ctx context.Context, listId string, includeArchived bool) ([]domaingift.GiftItem, error)
	ReorderItems(ctx context.Context, listId string, items []dto.GiftItemPriority) error
}

type RepoGiftReservationInterface interface {
	interfacegeneric.GenericRepository[domaingift.GiftReservation]

	GetReservedQuantities(ctx context.Context, itemIds []string) (map[string]int, error)
	CreateReservationWithAvailability(ctx context.Context, reservation domaingift.GiftReservation) error
	GetReservationsByList(ctx context.Context, listId string) ([]domaingift.GiftReservation, error)
}
