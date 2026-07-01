package interfacerole

import (
	"context"
	domainrole "yourz-gift/internal/domain/role"
	interfacegeneric "yourz-gift/internal/interfaces/generic"
)

type RepoRoleInterface interface {
	interfacegeneric.GenericRepository[domainrole.Role]

	GetByName(ctx context.Context, name string) (domainrole.Role, error)

	AssignPermissions(ctx context.Context, roleId string, permissionIds []string) error
	RemovePermissions(ctx context.Context, roleId string, permissionIds []string) error
	GetRolePermissions(ctx context.Context, roleId string) ([]string, error)

	AssignMenus(ctx context.Context, roleId string, menuIds []string) error
	RemoveMenus(ctx context.Context, roleId string, menuIds []string) error
	GetRoleMenus(ctx context.Context, roleId string) ([]string, error)
}
