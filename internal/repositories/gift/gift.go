package repositorygift

import (
	"context"
	"errors"
	"fmt"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	interfacegift "yourz-gift/internal/interfaces/gift"
	repositorygeneric "yourz-gift/internal/repositories/generic"
	"yourz-gift/pkg/filter"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrInsufficientQuantity = errors.New("insufficient item quantity")

type GiftListRepo struct {
	*repositorygeneric.GenericRepository[domaingift.GiftList]
}

type GiftItemRepo struct {
	*repositorygeneric.GenericRepository[domaingift.GiftItem]
}

type GiftReservationRepo struct {
	*repositorygeneric.GenericRepository[domaingift.GiftReservation]
}

func NewGiftListRepo(db *gorm.DB) interfacegift.RepoGiftListInterface {
	return &GiftListRepo{GenericRepository: repositorygeneric.New[domaingift.GiftList](db)}
}

func NewGiftItemRepo(db *gorm.DB) interfacegift.RepoGiftItemInterface {
	return &GiftItemRepo{GenericRepository: repositorygeneric.New[domaingift.GiftItem](db)}
}

func NewGiftReservationRepo(db *gorm.DB) interfacegift.RepoGiftReservationInterface {
	return &GiftReservationRepo{GenericRepository: repositorygeneric.New[domaingift.GiftReservation](db)}
}

func (r *GiftListRepo) GetListByShareCode(ctx context.Context, code string) (domaingift.GiftList, error) {
	return r.GetOneByField(ctx, "share_code", code)
}

func (r *GiftListRepo) GetAll(ctx context.Context, params filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return r.GenericRepository.GetAll(ctx, params, repositorygeneric.QueryOptions{
		Search:              repositorygeneric.BuildSearchFunc("title", "description", "share_code"),
		AllowedFilters:      []string{"owner_id", "visibility", "is_active", "occasion_type"},
		FilterSanitizer:     filter.WhitelistStringFilter,
		AllowedOrderColumns: []string{"created_at", "title"},
		DefaultOrders:       []string{"created_at DESC"},
	})
}

func (r *GiftListRepo) GetListsByOwner(ctx context.Context, ownerId string, params filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return r.GenericRepository.GetAll(ctx, params, repositorygeneric.QueryOptions{
		BaseQuery: func(q *gorm.DB) *gorm.DB {
			return q.Where("owner_id = ?", ownerId)
		},
		Search:              repositorygeneric.BuildSearchFunc("title", "description", "share_code"),
		AllowedOrderColumns: []string{"created_at", "title"},
		DefaultOrders:       []string{"created_at DESC"},
	})
}

func (r *GiftItemRepo) GetAll(ctx context.Context, params filter.BaseParams) ([]domaingift.GiftItem, int64, error) {
	return r.GenericRepository.GetAll(ctx, params, repositorygeneric.QueryOptions{
		Search:              repositorygeneric.BuildSearchFunc("name", "description"),
		AllowedFilters:      []string{"list_id", "is_active", "is_archived", "currency"},
		FilterSanitizer:     filter.WhitelistStringFilter,
		AllowedOrderColumns: []string{"created_at", "priority", "name", "price"},
		DefaultOrders:       []string{"priority ASC", "created_at ASC"},
	})
}

func (r *GiftItemRepo) GetItemsByList(ctx context.Context, listId string, includeArchived bool) ([]domaingift.GiftItem, error) {
	var items []domaingift.GiftItem
	q := r.DB.WithContext(ctx).Where("list_id = ? AND is_active = ?", listId, true)
	if !includeArchived {
		q = q.Where("is_archived = ?", false)
	}
	err := q.Order("priority ASC, created_at ASC").Find(&items).Error
	return items, err
}

func (r *GiftItemRepo) ReorderItems(ctx context.Context, listId string, items []dto.GiftItemPriority) error {
	return r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			res := tx.Model(&domaingift.GiftItem{}).
				Where("id = ? AND list_id = ?", item.Id, listId).
				Update("priority", item.Priority)
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return gorm.ErrRecordNotFound
			}
		}
		return nil
	})
}

func (r *GiftReservationRepo) GetAll(ctx context.Context, params filter.BaseParams) ([]domaingift.GiftReservation, int64, error) {
	return r.GenericRepository.GetAll(ctx, params, repositorygeneric.QueryOptions{
		AllowedFilters:      []string{"item_id", "guest_email", "status"},
		FilterSanitizer:     filter.WhitelistStringFilter,
		AllowedOrderColumns: []string{"created_at", "guest_email", "status"},
		DefaultOrders:       []string{"created_at DESC"},
	})
}

func (r *GiftReservationRepo) GetReservedQuantities(ctx context.Context, itemIds []string) (map[string]int, error) {
	type row struct {
		ItemId string
		Total  int
	}
	result := make(map[string]int, len(itemIds))
	if len(itemIds) == 0 {
		return result, nil
	}
	var rows []row
	err := r.DB.WithContext(ctx).Model(&domaingift.GiftReservation{}).
		Select("item_id, COALESCE(SUM(quantity), 0) AS total").
		Where("item_id IN ? AND status = ?", itemIds, domaingift.ReservationStatusConfirmed).
		Group("item_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.ItemId] = row.Total
	}
	return result, nil
}

func (r *GiftReservationRepo) CreateReservationWithAvailability(ctx context.Context, reservation domaingift.GiftReservation) error {
	return r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var item domaingift.GiftItem
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND is_active = ? AND is_archived = ?", reservation.ItemId, true, false).
			First(&item).Error; err != nil {
			return err
		}

		var reserved int
		if err := tx.Model(&domaingift.GiftReservation{}).
			Select("COALESCE(SUM(quantity), 0)").
			Where("item_id = ? AND status = ?", reservation.ItemId, domaingift.ReservationStatusConfirmed).
			Scan(&reserved).Error; err != nil {
			return err
		}

		if item.Quantity-reserved < reservation.Quantity {
			return fmt.Errorf("%w: remaining %d", ErrInsufficientQuantity, item.Quantity-reserved)
		}

		return repositorygeneric.New[domaingift.GiftReservation](tx).Store(ctx, reservation)
	})
}

func (r *GiftReservationRepo) GetReservationsByList(ctx context.Context, listId string) ([]domaingift.GiftReservation, error) {
	var reservations []domaingift.GiftReservation
	err := r.DB.WithContext(ctx).
		Joins("JOIN gift_items ON gift_items.id = gift_reservations.item_id").
		Where("gift_items.list_id = ?", listId).
		Order("gift_reservations.created_at DESC").
		Find(&reservations).Error
	return reservations, err
}
