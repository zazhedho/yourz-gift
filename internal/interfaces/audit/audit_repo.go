package interfaceaudit

import (
	domainaudit "yourz-gift/internal/domain/audit"
	interfacegeneric "yourz-gift/internal/interfaces/generic"
)

type RepoAuditInterface interface {
	interfacegeneric.GenericRepository[domainaudit.AuditTrail]
}
