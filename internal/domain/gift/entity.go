package domaingift

import (
	"time"

	"gorm.io/gorm"
)

const (
	ListVisibilityPublic  = "public"
	ListVisibilityPrivate = "private"

	ReservationStatusConfirmed = "confirmed"
	ReservationStatusCanceled  = "canceled"

	FriendStatusPending  = "pending"
	FriendStatusAccepted = "accepted"
	FriendStatusRejected = "rejected"
)

func (GiftList) TableName() string {
	return "gift_lists"
}

type GiftList struct {
	Id                    string         `json:"id" gorm:"column:id;primaryKey"`
	OwnerId               string         `json:"owner_id" gorm:"column:owner_id"`
	Title                 string         `json:"title" gorm:"column:title"`
	Description           string         `json:"description" gorm:"column:description"`
	OccasionType          string         `json:"occasion_type" gorm:"column:occasion_type"`
	ShareCode             string         `json:"share_code" gorm:"column:share_code;unique"`
	CoverImageUrl         string         `json:"cover_image_url" gorm:"column:cover_image_url"`
	ShippingNote          string         `json:"shipping_note" gorm:"column:shipping_note"`
	Visibility            string         `json:"visibility" gorm:"column:visibility"`
	ReservationVisibility string         `json:"reservation_visibility" gorm:"column:reservation_visibility"`
	IsActive              bool           `json:"is_active" gorm:"column:is_active"`
	NeverExpires          bool           `json:"never_expires" gorm:"column:never_expires"`
	ExpiresAt             *time.Time     `json:"expires_at,omitempty" gorm:"column:expires_at"`
	CreatedAt             time.Time      `json:"created_at,omitempty" gorm:"column:created_at"`
	UpdatedAt             *time.Time     `json:"updated_at,omitempty" gorm:"column:updated_at"`
	DeletedAt             gorm.DeletedAt `json:"-" gorm:"index"`
}

func (GiftItem) TableName() string {
	return "gift_items"
}

type GiftItem struct {
	Id          string         `json:"id" gorm:"column:id;primaryKey"`
	ListId      string         `json:"list_id" gorm:"column:list_id"`
	Name        string         `json:"name" gorm:"column:name"`
	Description string         `json:"description" gorm:"column:description"`
	ProductUrl  string         `json:"product_url" gorm:"column:product_url"`
	ImageUrl    string         `json:"image_url" gorm:"column:image_url"`
	Price       *float64       `json:"price" gorm:"column:price"`
	Currency    string         `json:"currency" gorm:"column:currency"`
	Quantity    int            `json:"quantity" gorm:"column:quantity"`
	Priority    int            `json:"priority" gorm:"column:priority"`
	IsActive    bool           `json:"is_active" gorm:"column:is_active"`
	IsArchived  bool           `json:"is_archived" gorm:"column:is_archived"`
	CreatedAt   time.Time      `json:"created_at,omitempty" gorm:"column:created_at"`
	UpdatedAt   *time.Time     `json:"updated_at,omitempty" gorm:"column:updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (GiftReservation) TableName() string {
	return "gift_reservations"
}

type GiftReservation struct {
	Id           string         `json:"id" gorm:"column:id;primaryKey"`
	ItemId       string         `json:"item_id" gorm:"column:item_id"`
	GuestEmail   string         `json:"guest_email" gorm:"column:guest_email"`
	GuestName    string         `json:"guest_name" gorm:"column:guest_name"`
	Quantity     int            `json:"quantity" gorm:"column:quantity"`
	Note         string         `json:"note" gorm:"column:note"`
	ShowName     bool           `json:"show_name" gorm:"column:show_name"`
	Status       string         `json:"status" gorm:"column:status"`
	ThankedAt    *time.Time     `json:"thanked_at,omitempty" gorm:"column:thanked_at"`
	CanceledAt   *time.Time     `json:"canceled_at,omitempty" gorm:"column:canceled_at"`
	CanceledBy   *string        `json:"canceled_by,omitempty" gorm:"column:canceled_by"`
	CancelReason string         `json:"cancel_reason,omitempty" gorm:"column:cancel_reason"`
	CreatedAt    time.Time      `json:"created_at,omitempty" gorm:"column:created_at"`
	UpdatedAt    *time.Time     `json:"updated_at,omitempty" gorm:"column:updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (GiftFriend) TableName() string {
	return "gift_friends"
}

type GiftFriend struct {
	Id          string         `json:"id" gorm:"column:id;primaryKey"`
	RequesterId string         `json:"requester_id" gorm:"column:requester_id"`
	AddresseeId string         `json:"addressee_id" gorm:"column:addressee_id"`
	Status      string         `json:"status" gorm:"column:status"`
	CreatedAt   time.Time      `json:"created_at,omitempty" gorm:"column:created_at"`
	UpdatedAt   *time.Time     `json:"updated_at,omitempty" gorm:"column:updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
