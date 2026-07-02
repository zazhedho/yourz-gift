CREATE TABLE IF NOT EXISTS gift_lists (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    occasion_type VARCHAR(40) NOT NULL DEFAULT 'custom',
    share_code VARCHAR(16) NOT NULL UNIQUE,
    cover_image_url TEXT NOT NULL DEFAULT '',
    shipping_note TEXT NOT NULL DEFAULT '',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    reservation_visibility VARCHAR(40) NOT NULL DEFAULT 'immediately',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gift_lists_owner_id ON gift_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_gift_lists_share_code ON gift_lists(share_code);
CREATE INDEX IF NOT EXISTS idx_gift_lists_visibility_active ON gift_lists(visibility, is_active) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS gift_items (
    id UUID PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES gift_lists(id) ON DELETE CASCADE,
    name VARCHAR(180) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    product_url TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    price NUMERIC(14,2),
    currency VARCHAR(8) NOT NULL DEFAULT 'IDR',
    quantity INT NOT NULL DEFAULT 1,
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT gift_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT gift_items_priority_non_negative CHECK (priority >= 0)
);

CREATE INDEX IF NOT EXISTS idx_gift_items_list_id ON gift_items(list_id);
CREATE INDEX IF NOT EXISTS idx_gift_items_list_priority ON gift_items(list_id, priority);
CREATE INDEX IF NOT EXISTS idx_gift_items_public ON gift_items(list_id, is_active, is_archived) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS gift_reservations (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES gift_items(id) ON DELETE CASCADE,
    guest_email VARCHAR(255) NOT NULL,
    guest_name VARCHAR(160) NOT NULL DEFAULT '',
    quantity INT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    show_name BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(24) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT gift_reservations_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_gift_reservations_item_id ON gift_reservations(item_id);
CREATE INDEX IF NOT EXISTS idx_gift_reservations_guest_email ON gift_reservations(guest_email);
CREATE INDEX IF NOT EXISTS idx_gift_reservations_active_status ON gift_reservations(item_id, status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS gift_friends (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(24) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT gift_friends_no_self CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_gift_friends_requester ON gift_friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_gift_friends_addressee ON gift_friends(addressee_id);
CREATE INDEX IF NOT EXISTS idx_gift_friends_status ON gift_friends(status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_friends_unique_pair
ON gift_friends (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
WHERE deleted_at IS NULL;
