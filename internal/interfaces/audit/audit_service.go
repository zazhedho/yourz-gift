package interfaceaudit

import (
	"context"
	domainaudit "yourz-gift/internal/domain/audit"
	"yourz-gift/internal/dto"
	"yourz-gift/pkg/filter"
)

type ServiceAuditInterface interface {
	Store(ctx context.Context, req domainaudit.AuditEvent) error
	GetAll(ctx context.Context, params filter.BaseParams) ([]dto.AuditTrailResponse, int64, error)
	GetByID(ctx context.Context, id string) (dto.AuditTrailResponse, error)
}
