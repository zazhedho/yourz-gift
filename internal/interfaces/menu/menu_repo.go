package interfacemenu

import (
	"context"
	domainmenu "yourz-gift/internal/domain/menu"
	interfacegeneric "yourz-gift/internal/interfaces/generic"
)

type RepoMenuInterface interface {
	interfacegeneric.GenericRepository[domainmenu.MenuItem]

	GetByName(ctx context.Context, name string) (domainmenu.MenuItem, error)
	GetActiveMenus(ctx context.Context) ([]domainmenu.MenuItem, error)
	GetUserMenus(ctx context.Context, userId string) ([]domainmenu.MenuItem, error)
}
