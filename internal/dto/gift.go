package dto

type GiftListCreate struct {
	Title                 string `json:"title" binding:"required,min=2,max=160"`
	Description           string `json:"description" binding:"omitempty,max=2000"`
	OccasionType          string `json:"occasion_type" binding:"omitempty,max=40"`
	CoverImageUrl         string `json:"cover_image_url" binding:"omitempty,url,max=1000"`
	ShippingNote          string `json:"shipping_note" binding:"omitempty,max=2000"`
	Visibility            string `json:"visibility" binding:"omitempty,oneof=public private"`
	ReservationVisibility string `json:"reservation_visibility" binding:"omitempty,max=40"`
}

type GiftListUpdate struct {
	Title                 string `json:"title" binding:"omitempty,min=2,max=160"`
	Description           string `json:"description" binding:"omitempty,max=2000"`
	OccasionType          string `json:"occasion_type" binding:"omitempty,max=40"`
	CoverImageUrl         string `json:"cover_image_url" binding:"omitempty,url,max=1000"`
	ShippingNote          string `json:"shipping_note" binding:"omitempty,max=2000"`
	Visibility            string `json:"visibility" binding:"omitempty,oneof=public private"`
	ReservationVisibility string `json:"reservation_visibility" binding:"omitempty,max=40"`
	IsActive              *bool  `json:"is_active" binding:"omitempty"`
}

type GiftItemCreate struct {
	Name        string   `json:"name" binding:"required,min=2,max=180"`
	Description string   `json:"description" binding:"omitempty,max=2000"`
	ProductUrl  string   `json:"product_url" binding:"omitempty,url,max=1000"`
	ImageUrl    string   `json:"image_url" binding:"omitempty,url,max=1000"`
	Price       *float64 `json:"price" binding:"omitempty,gte=0"`
	Currency    string   `json:"currency" binding:"omitempty,max=8"`
	Quantity    int      `json:"quantity" binding:"required,gte=1,lte=999"`
	Priority    int      `json:"priority" binding:"omitempty,gte=0"`
}

type GiftItemUpdate struct {
	Name        string   `json:"name" binding:"omitempty,min=2,max=180"`
	Description string   `json:"description" binding:"omitempty,max=2000"`
	ProductUrl  string   `json:"product_url" binding:"omitempty,url,max=1000"`
	ImageUrl    string   `json:"image_url" binding:"omitempty,url,max=1000"`
	Price       *float64 `json:"price" binding:"omitempty,gte=0"`
	Currency    string   `json:"currency" binding:"omitempty,max=8"`
	Quantity    *int     `json:"quantity" binding:"omitempty,gte=1,lte=999"`
	Priority    *int     `json:"priority" binding:"omitempty,gte=0"`
	IsActive    *bool    `json:"is_active" binding:"omitempty"`
	IsArchived  *bool    `json:"is_archived" binding:"omitempty"`
}

type GiftItemReorder struct {
	Items []GiftItemPriority `json:"items" binding:"required,min=1,dive"`
}

type GiftItemPriority struct {
	Id       string `json:"id" binding:"required"`
	Priority int    `json:"priority" binding:"gte=0"`
}

type GiftReservationCreate struct {
	GuestEmail string `json:"guest_email" binding:"required,email,max=255"`
	GuestName  string `json:"guest_name" binding:"omitempty,max=160"`
	Quantity   int    `json:"quantity" binding:"required,gte=1,lte=999"`
	Note       string `json:"note" binding:"omitempty,max=500"`
	ShowName   *bool  `json:"show_name" binding:"omitempty"`
}

type GiftListPublicResponse struct {
	Id                    string `json:"id"`
	Title                 string `json:"title"`
	Description           string `json:"description"`
	OccasionType          string `json:"occasion_type"`
	ShareCode             string `json:"share_code"`
	CoverImageUrl         string `json:"cover_image_url"`
	ShippingNote          string `json:"shipping_note"`
	ReservationVisibility string `json:"reservation_visibility"`
	AvailableItems        int    `json:"available_items"`
	ReservedItems         int    `json:"reserved_items"`
}

type GiftItemPublicResponse struct {
	Id                string   `json:"id"`
	Name              string   `json:"name"`
	Description       string   `json:"description"`
	ProductUrl        string   `json:"product_url"`
	UrlHost           string   `json:"url_host"`
	ImageUrl          string   `json:"image_url"`
	Price             *float64 `json:"price"`
	Currency          string   `json:"currency"`
	Quantity          int      `json:"quantity"`
	QuantityRemaining int      `json:"quantity_remaining"`
	DisplayQuantity   string   `json:"display_quantity"`
	Priority          int      `json:"priority"`
	CanReserve        bool     `json:"can_reserve"`
	IsReserved        bool     `json:"is_reserved"`
}
