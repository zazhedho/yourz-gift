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
	interfaceuser "yourz-gift/internal/interfaces/user"
	"yourz-gift/pkg/filter"
	"yourz-gift/utils"

	"gorm.io/gorm"
)

var (
	ErrForbiddenGiftAccess = errors.New("gift resource does not belong to user")
	ErrGiftListNotPublic   = errors.New("gift list is not public")
	ErrFriendSelf          = errors.New("cannot add yourself as friend")
	ErrFriendUserNotFound  = errors.New("friend user not found")
	ErrFriendServiceConfig = errors.New("friend service is not configured")
)

type GiftService struct {
	ListRepo        interfacegift.RepoGiftListInterface
	ItemRepo        interfacegift.RepoGiftItemInterface
	ReservationRepo interfacegift.RepoGiftReservationInterface
	FriendRepo      interfacegift.RepoGiftFriendInterface
	UserRepo        interfaceuser.RepoUserInterface
}

func NewGiftService(
	listRepo interfacegift.RepoGiftListInterface,
	itemRepo interfacegift.RepoGiftItemInterface,
	reservationRepo interfacegift.RepoGiftReservationInterface,
	friendRepo interfacegift.RepoGiftFriendInterface,
	userRepo interfaceuser.RepoUserInterface,
) *GiftService {
	return &GiftService{
		ListRepo:        listRepo,
		ItemRepo:        itemRepo,
		ReservationRepo: reservationRepo,
		FriendRepo:      friendRepo,
		UserRepo:        userRepo,
	}
}

func (s *GiftService) CreateList(ctx context.Context, ownerId string, req dto.GiftListCreate) (domaingift.GiftList, error) {
	neverExpires := true
	if req.NeverExpires != nil {
		neverExpires = *req.NeverExpires
	}
	var expiresAt *time.Time
	if !neverExpires {
		expiresAt = req.ExpiresAt
	}
	list := domaingift.GiftList{
		Id:                    utils.CreateUUID(),
		OwnerId:               ownerId,
		Title:                 utils.TitleCase(utils.StripHTML(req.Title)),
		Description:           utils.StripHTML(req.Description),
		OccasionType:          utils.StringOrDefault(req.OccasionType, "custom"),
		ShareCode:             utils.RandomCode(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"),
		CoverImageUrl:         req.CoverImageUrl,
		ShippingNote:          utils.StripHTML(req.ShippingNote),
		Visibility:            utils.StringOrDefault(req.Visibility, domaingift.ListVisibilityPublic),
		ReservationVisibility: utils.StringOrDefault(req.ReservationVisibility, "immediately"),
		IsActive:              true,
		NeverExpires:          neverExpires,
		ExpiresAt:             expiresAt,
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
		list.Title = utils.TitleCase(utils.StripHTML(req.Title))
	}
	if req.Description != "" {
		list.Description = utils.StripHTML(req.Description)
	}
	if req.OccasionType != "" {
		list.OccasionType = req.OccasionType
	}
	if req.CoverImageUrl != "" {
		list.CoverImageUrl = req.CoverImageUrl
	}
	if req.ShippingNote != "" {
		list.ShippingNote = utils.StripHTML(req.ShippingNote)
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
	if req.NeverExpires != nil {
		list.NeverExpires = *req.NeverExpires
		if list.NeverExpires {
			list.ExpiresAt = nil
		}
	}
	if req.ExpiresAt != nil {
		list.ExpiresAt = req.ExpiresAt
		list.NeverExpires = false
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
		Name:        utils.TitleCase(utils.StripHTML(req.Name)),
		Description: utils.StripHTML(req.Description),
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
		item.Name = utils.TitleCase(utils.StripHTML(req.Name))
	}
	if req.Description != "" {
		item.Description = utils.StripHTML(req.Description)
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

func (s *GiftService) MarkReservationThanked(ctx context.Context, ownerId, reservationId string) (domaingift.GiftReservation, error) {
	reservation, err := s.ReservationRepo.GetByID(ctx, reservationId)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	item, err := s.ItemRepo.GetByID(ctx, reservation.ItemId)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	if _, err := s.GetOwnerList(ctx, ownerId, item.ListId); err != nil {
		return domaingift.GiftReservation{}, err
	}
	reservation.ThankedAt = new(time.Now())
	reservation.UpdatedAt = new(time.Now())
	if err := s.ReservationRepo.Update(ctx, reservation); err != nil {
		return domaingift.GiftReservation{}, err
	}
	return reservation, nil
}

func (s *GiftService) CancelReservation(ctx context.Context, ownerId, reservationId string, req dto.GiftReservationCancel) (domaingift.GiftReservation, error) {
	reservation, err := s.ReservationRepo.GetByID(ctx, reservationId)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	item, err := s.ItemRepo.GetByID(ctx, reservation.ItemId)
	if err != nil {
		return domaingift.GiftReservation{}, err
	}
	if _, err := s.GetOwnerList(ctx, ownerId, item.ListId); err != nil {
		return domaingift.GiftReservation{}, err
	}
	now := time.Now()
	reservation.Status = domaingift.ReservationStatusCanceled
	reservation.CanceledAt = &now
	reservation.CanceledBy = &ownerId
	reservation.CancelReason = utils.StripHTML(req.CancelReason)
	reservation.UpdatedAt = &now
	if err := s.ReservationRepo.Update(ctx, reservation); err != nil {
		return domaingift.GiftReservation{}, err
	}
	return reservation, nil
}

func (s *GiftService) GetFriendLists(ctx context.Context, ownerId string, params filter.BaseParams) ([]domaingift.GiftList, int64, error) {
	return s.ListRepo.GetListsByFriendOwners(ctx, ownerId, params)
}

func (s *GiftService) RequestFriend(ctx context.Context, userId string, req dto.GiftFriendRequest) (domaingift.GiftFriend, error) {
	if s.FriendRepo == nil || s.UserRepo == nil {
		return domaingift.GiftFriend{}, ErrFriendServiceConfig
	}
	target, err := s.UserRepo.GetByEmail(ctx, utils.SanitizeEmail(req.Email))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domaingift.GiftFriend{}, ErrFriendUserNotFound
		}
		return domaingift.GiftFriend{}, err
	}
	if target.Id == userId {
		return domaingift.GiftFriend{}, ErrFriendSelf
	}
	existing, err := s.FriendRepo.FindBetweenUsers(ctx, userId, target.Id)
	if err == nil {
		if existing.Status == domaingift.FriendStatusRejected {
			existing.RequesterId = userId
			existing.AddresseeId = target.Id
			existing.Status = domaingift.FriendStatusPending
			existing.UpdatedAt = new(time.Now())
			return existing, s.FriendRepo.Update(ctx, existing)
		}
		return existing, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return domaingift.GiftFriend{}, err
	}
	friend := domaingift.GiftFriend{
		Id:          utils.CreateUUID(),
		RequesterId: userId,
		AddresseeId: target.Id,
		Status:      domaingift.FriendStatusPending,
		CreatedAt:   time.Now(),
	}
	if err := s.FriendRepo.Store(ctx, friend); err != nil {
		return domaingift.GiftFriend{}, err
	}
	return friend, nil
}

func (s *GiftService) GetFriends(ctx context.Context, userId string, params filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	if s.FriendRepo == nil {
		return nil, 0, ErrFriendServiceConfig
	}
	return s.FriendRepo.GetFriends(ctx, userId, params)
}

func (s *GiftService) GetPendingFriendRequests(ctx context.Context, userId string, params filter.BaseParams) ([]dto.GiftFriendResponse, int64, error) {
	if s.FriendRepo == nil {
		return nil, 0, ErrFriendServiceConfig
	}
	return s.FriendRepo.GetPendingRequests(ctx, userId, params)
}

func (s *GiftService) AcceptFriend(ctx context.Context, userId, friendId string) (domaingift.GiftFriend, error) {
	return s.updateFriendStatus(ctx, userId, friendId, domaingift.FriendStatusAccepted)
}

func (s *GiftService) RejectFriend(ctx context.Context, userId, friendId string) (domaingift.GiftFriend, error) {
	return s.updateFriendStatus(ctx, userId, friendId, domaingift.FriendStatusRejected)
}

func (s *GiftService) DeleteFriend(ctx context.Context, userId, friendId string) error {
	if s.FriendRepo == nil {
		return ErrFriendServiceConfig
	}
	friend, err := s.FriendRepo.GetByID(ctx, friendId)
	if err != nil {
		return err
	}
	if friend.RequesterId != userId && friend.AddresseeId != userId {
		return ErrForbiddenGiftAccess
	}
	return s.FriendRepo.Delete(ctx, friendId)
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
		NeverExpires:          list.NeverExpires,
		ExpiresAt:             list.ExpiresAt,
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
		GuestEmail: utils.SanitizeEmail(req.GuestEmail),
		GuestName:  utils.StripHTML(strings.TrimSpace(req.GuestName)),
		Quantity:   req.Quantity,
		Note:       utils.StripHTML(req.Note),
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
	if !isGiftListAvailable(list, time.Now()) || list.Visibility != domaingift.ListVisibilityPublic {
		return domaingift.GiftList{}, ErrGiftListNotPublic
	}
	return list, nil
}

func isGiftListAvailable(list domaingift.GiftList, now time.Time) bool {
	if !list.IsActive {
		return false
	}
	if list.NeverExpires {
		return true
	}
	return list.ExpiresAt != nil && list.ExpiresAt.After(now)
}

func (s *GiftService) updateFriendStatus(ctx context.Context, userId, friendId, status string) (domaingift.GiftFriend, error) {
	if s.FriendRepo == nil {
		return domaingift.GiftFriend{}, ErrFriendServiceConfig
	}
	friend, err := s.FriendRepo.GetByID(ctx, friendId)
	if err != nil {
		return domaingift.GiftFriend{}, err
	}
	if friend.AddresseeId != userId || friend.Status != domaingift.FriendStatusPending {
		return domaingift.GiftFriend{}, ErrForbiddenGiftAccess
	}
	friend.Status = status
	friend.UpdatedAt = new(time.Now())
	if err := s.FriendRepo.Update(ctx, friend); err != nil {
		return domaingift.GiftFriend{}, err
	}
	return friend, nil
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
			IsArchived:        item.IsArchived,
		})
	}
	return out, nil
}

var _ interfacegift.ServiceGiftInterface = (*GiftService)(nil)
