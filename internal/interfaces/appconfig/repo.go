package interfaceappconfig

import (
	"context"
	domainappconfig "yourz-gift/internal/domain/appconfig"
	interfacegeneric "yourz-gift/internal/interfaces/generic"
)

type RepoAppConfigInterface interface {
	interfacegeneric.GenericRepository[domainappconfig.AppConfig]

	GetByKey(ctx context.Context, configKey string) (domainappconfig.AppConfig, error)
}
