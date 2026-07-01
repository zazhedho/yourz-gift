package servicegift

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	domaingift "yourz-gift/internal/domain/gift"
	"yourz-gift/internal/dto"
	interfacegift "yourz-gift/internal/interfaces/gift"
	"yourz-gift/pkg/filter"
	"yourz-gift/utils"
)

var (
	ErrForbiddenGiftAccess = errors.New("gift resource does not belong to user")
	ErrGiftListNotPublic   = errors.New("gift list is not public")
)

type GiftService struct {
	ListRepo        interfacegift.RepoGiftListInterface
	ItemRepo        interfacegift.RepoGiftItemInterface
	ReservationRepo interfacegift.RepoGiftReservationInterface
}

func NewGiftService(
	listRepo interfacegift.RepoGiftListInterface,
	itemRepo interfacegift.RepoGiftItemInterface,
	reservationRepo interfacegift.RepoGiftReservationInterface,
) *GiftService {
	return &GiftService{
		ListRepo:        listRepo,
		ItemRepo:        itemRepo,
		ReservationRepo: reservationRepo,
	}
}

func (s *GiftService) CreateList(ctx context.Context, ownerId string, req dto.GiftListCreate) (domaingift.GiftList, error) {
	list := domaingift.GiftList{
		Id:                    utils.CreateUUID(),
		OwnerId:               ownerId,
		Title:                 req.Title,
		Description:           req.Description,
		OccasionType:          utils.StringOrDefault(req.OccasionType, "custom"),
		ShareCode:             utils.RandomCode(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"),
		CoverImageUrl:         req.CoverImageUrl,
		ShippingNote:          req.ShippingNote,
		Visibility:            utils.StringOrDefault(req.Visibility, domaingift.ListVisibilityPublic),
		ReservationVisibility: utils.StringOrDefault(req.ReservationVisibility, "immediately"),
		IsActive:              true,
		CreatedAt:             time.Now(),
	}
	if err := s.ListRepo.Store(ctx, list); err != nil {
		return domaingift.GiftList{}, err
	}
	return list, nil
}

func (s *GiftService) GetOwnerLists(ctx context.Context, ownerId string, params filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return s.ListRepo.GetListsByOwner(ctx, ownerId, params)
}

func (s *GiftService) GetOwnerList(ctx context.Context, ownerId, listId string) (domaingift.GiftList, error) {
	list, err := s.ListRepo.GetByID(ctx, listId)
	if err != nil {
		return domaingift.GiftList{}, err
	}
	if list.OwnerId != ownerId {
		return domaingift.GiftList{}, ErrForbiddenGiftAccess
	}
	return list, nil
}

func (s *GiftService) UpdateList(ctx context.Context, ownerId, listId string, req dto.GiftListUpdate) (domaingift.GiftList, error) {
	list, err := s.GetOwnerList(ctx, ownerId, listId)
	if err != nil {
		return domaingift.GiftList{}, err
	}
	if req.Title != "" {
		list.Title = req.Title
	}
	if req.Description != "" {
		list.Description = req.Description
	}
	if req.OccasionType != "" {
		list.OccasionType = req.OccasionType
	}
	if req.CoverImageUrl != "" {
		list.CoverImageUrl = req.CoverImageUrl
	}
	if req.ShippingNote != "" {
		list.ShippingNote = req.ShippingNote
	}
	if req.Visibility != "" {
		list.Visibility = req.Visibility
	}
	if req.ReservationVisibility != "" {
		list.ReservationVisibility = req.ReservationVisibility
	}
	if req.IsActive != nil {
		list.IsActive = *req.IsActive
	}
	list.UpdatedAt = new(time.Now())
	if err := s.ListRepo.Update(ctx, list); err != nil {
		return domaingift.GiftList{}, err
	}
	return list, nil
}

func (s *GiftService) DeleteList(ctx context.Context, ownerId, listId string) error {
	if _, err := s.GetOwnerList(ctx, ownerId, listId); err != nil {
		return err
	}
	return s.ListRepo.Delete(ctx, listId)
}

func (s *GiftService) CreateItem(ctx context.Context, ownerId, listId string, req dto.GiftItemCreate) (domaingift.GiftItem, error) {
	if _, err := s.GetOwnerList(ctx, ownerId, listId); err != nil {
		return domaingift.GiftItem{}, err
	}
	item := domaingift.GiftItem{
		Id:          utils.CreateUUID(),
		ListId:      listId,
		Name:        req.Name,
		Description: req.Description,
		ProductUrl:  req.ProductUrl,
		ImageUrl:    req.ImageUrl,
		Price:       req.Price,
		Currency:    utils.StringOrDefault(req.Currency, "IDR"),
		Quantity:    req.Quantity,
		Priority:    req.Priority,
		IsActive:    true,
		IsArchived:  false,
		CreatedAt:   time.Now(),
	}
	if err := s.ItemRepo.Store(ctx, item); err != nil {
		return domaingift.GiftItem{}, err
	}
	return item, nil
}

func (s *GiftService) GetOwnerItems(ctx context.Context, ownerId, listId string, includeArchived bool) ([]dto.GiftItemPublicResponse, error) {
	if _, err := s.GetOwnerList(ctx, ownerId, listId); err != nil {
		return nil, err
	}
	return s.buildItemResponses(ctx, listId, includeArchived)
}

func (s *GiftService) UpdateItem(ctx context.Context, ownerId, itemId string, req dto.GiftItemUpdate) (domaingift.GiftItem, error) {
	item, err := s.getOwnerItem(ctx, ownerId, itemId)
	if err != nil {
		return domaingift.GiftItem{}, err
	}
	if req.Name != "" {
		item.Name = req.Name
	}
	if req.Description != "" {
		item.Description = req.Description
	}
	if req.ProductUrl != "" {
		item.ProductUrl = req.ProductUrl
	}
	if req.ImageUrl != "" {
		item.ImageUrl = req.ImageUrl
	}
	if req.Price != nil {
		item.Price = req.Price
	}
	if req.Currency != "" {
		item.Currency = req.Currency
	}
	if req.Quantity != nil {
		item.Quantity = *req.Quantity
	}
	if req.Priority != nil {
		item.Priority = *req.Priority
	}
	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}
	if req.IsArchived != nil {
		item.IsArchived = *req.IsArchived
	}
	item.UpdatedAt = new(time.Now())
	if err := s.ItemRepo.Update(ctx, item); err != nil {
		return domaingift.GiftItem{}, err
	}
	return item, nil
}

func (s *GiftService) DeleteItem(ctx context.Context, ownerId, itemId string) error {
	if _, err := s.getOwnerItem(ctx, ownerId, itemId); err != nil {
		return err
	}
	return s.ItemRepo.Delete(ctx, itemId)
}

func (s *GiftService) ReorderItems(ctx context.Context, ownerId, listId string, req dto.GiftItemReorder) error {
	if _, err := s.GetOwnerList(ctx, ownerId, listId); err != nil {
		return err
	}
	return s.ItemRepo.ReorderItems(ctx, listId, req.Items)
}

func (s *GiftService) GetReservations(ctx context.Context, ownerId, listId string) ([]domaingift.GiftReservation, error) {
	if _, err := s.GetOwnerList(ctx, ownerId, listId); err != nil {
		return nil, err
	}
	return s.ReservationRepo.GetReservationsByList(ctx, listId)
}

func (s *GiftService) GetPublicList(ctx context.Context, shareCode string) (dto.GiftListPublicResponse, error) {
	list, err := s.getPublicList(ctx, shareCode)
	if err != nil {
		return dto.GiftListPublicResponse{}, err
	}
	items, err := s.buildItemResponses(ctx, list.Id, false)
	if err != nil {
		return dto.GiftListPublicResponse{}, err
	}
	var available, reserved int
	for _, item := range items {
		if item.QuantityRemaining > 0 {
			available++
		} else {
			reserved++
		}
	}
	return dto.GiftListPublicResponse{
		Id:                    list.Id,
		Title:                 list.Title,
		Description:           list.Description,
		OccasionType:          list.OccasionType,
		ShareCode:             list.ShareCode,
		CoverImageUrl:         list.CoverImageUrl,
		ShippingNote:          list.ShippingNote,
		ReservationVisibility: list.ReservationVisibility,
		AvailableItems:        available,
		ReservedItems:         reserved,
	}, nil
}

func (s *GiftService) GetPublicItems(ctx context.Context, shareCode string) ([]dto.GiftItemPublicResponse, error) {
	list, err := s.getPublicList(ctx, shareCode)
	if err != nil {
		return nil, err
	}
	return s.buildItemResponses(ctx, list.Id, false)
}

func (s *GiftService) CreatePublicReservation(ctx context.Context, shareCode, itemId string, req dto.GiftReservationCreate) (domaingift.GiftReservation, error) {
	list, err := s.getPublicList(ctx, shareCode)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	item, err := s.ItemRepo.GetByID(ctx, itemId)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	if item.ListId != list.Id || !item.IsActive || item.IsArchived {
		return domaingift.GiftReservation{}, ErrGiftListNotPublic
	}
	showName := true
	if req.ShowName != nil {
		showName = *req.ShowName
	}
	reservation := domaingift.GiftReservation{
		Id:         utils.CreateUUID(),
		ItemId:     itemId,
		GuestEmail: strings.ToLower(strings.TrimSpace(req.GuestEmail)),
		GuestName:  strings.TrimSpace(req.GuestName),
		Quantity:   req.Quantity,
		Note:       req.Note,
		ShowName:   showName,
		Status:     domaingift.ReservationStatusConfirmed,
		CreatedAt:  time.Now(),
	}
	if err := s.ReservationRepo.CreateReservationWithAvailability(ctx, reservation); err != nil {
		return domaingift.GiftReservation{}, err
	}
	return reservation, nil
}

func (s *GiftService) getPublicList(ctx context.Context, shareCode string) (domaingift.GiftList, error) {
	list, err := s.ListRepo.GetListByShareCode(ctx, strings.ToUpper(strings.TrimSpace(shareCode)))
	if err != nil {
		return domaingift.GiftList{}, err
	}
	if !list.IsActive || list.Visibility != domaingift.ListVisibilityPublic {
		return domaingift.GiftList{}, ErrGiftListNotPublic
	}
	return list, nil
}

func (s *GiftService) getOwnerItem(ctx context.Context, ownerId, itemId string) (domaingift.GiftItem, error) {
	item, err := s.ItemRepo.GetByID(ctx, itemId)
	if err != nil {
		return domaingift.GiftItem{}, err
	}
	if _, err := s.GetOwnerList(ctx, ownerId, item.ListId); err != nil {
		return domaingift.GiftItem{}, err
	}
	return item, nil
}

func (s *GiftService) buildItemResponses(ctx context.Context, listId string, includeArchived bool) ([]dto.GiftItemPublicResponse, error) {
	items, err := s.ItemRepo.GetItemsByList(ctx, listId, includeArchived)
	if err != nil {
		return nil, err
	}
	ids := make([]string, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.Id)
	}
	reserved, err := s.ReservationRepo.GetReservedQuantities(ctx, ids)
	if err != nil {
		return nil, err
	}
	out := make([]dto.GiftItemPublicResponse, 0, len(items))
	for _, item := range items {
		remaining := item.Quantity - reserved[item.Id]
		if remaining < 0 {
			remaining = 0
		}
		out = append(out, dto.GiftItemPublicResponse{
			Id:                item.Id,
			Name:              item.Name,
			Description:       item.Description,
			ProductUrl:        item.ProductUrl,
			UrlHost:           utils.URLHost(item.ProductUrl),
			ImageUrl:          item.ImageUrl,
			Price:             item.Price,
			Currency:          item.Currency,
			Quantity:          item.Quantity,
			QuantityRemaining: remaining,
			DisplayQuantity:   fmt.Sprintf("%d of %d available", remaining, item.Quantity),
			Priority:          item.Priority,
			CanReserve:        remaining > 0 && item.IsActive && !item.IsArchived,
			IsReserved:        remaining == 0,
		})
	}
	return out, nil
}

var _ interfacegift.ServiceGiftInterface = (*GiftService)(nil)
