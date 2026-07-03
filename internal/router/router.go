package router

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"yourz-gift/infrastructure/database"
	mediaInfra "yourz-gift/infrastructure/media"
	permissioncache "yourz-gift/internal/cache/permission"
	appConfigHandler "yourz-gift/internal/handlers/http/appconfig"
	auditHandler "yourz-gift/internal/handlers/http/audit"
	giftHandler "yourz-gift/internal/handlers/http/gift"
	locationHandler "yourz-gift/internal/handlers/http/location"
	mediaHandler "yourz-gift/internal/handlers/http/media"
	menuHandler "yourz-gift/internal/handlers/http/menu"
	permissionHandler "yourz-gift/internal/handlers/http/permission"
	roleHandler "yourz-gift/internal/handlers/http/role"
	sessionHandler "yourz-gift/internal/handlers/http/session"
	userHandler "yourz-gift/internal/handlers/http/user"
	interfaceaudit "yourz-gift/internal/interfaces/audit"
	interfacepermission "yourz-gift/internal/interfaces/permission"
	interfacesession "yourz-gift/internal/interfaces/session"
	appConfigRepo "yourz-gift/internal/repositories/appconfig"
	auditRepo "yourz-gift/internal/repositories/audit"
	authRepo "yourz-gift/internal/repositories/auth"
	giftRepo "yourz-gift/internal/repositories/gift"
	locationRepo "yourz-gift/internal/repositories/location"
	menuRepo "yourz-gift/internal/repositories/menu"
	otpRepo "yourz-gift/internal/repositories/otp"
	permissionRepo "yourz-gift/internal/repositories/permission"
	resetRepo "yourz-gift/internal/repositories/reset"
	roleRepo "yourz-gift/internal/repositories/role"
	sessionRepo "yourz-gift/internal/repositories/session"
	userRepo "yourz-gift/internal/repositories/user"
	appConfigSvc "yourz-gift/internal/services/appconfig"
	auditSvc "yourz-gift/internal/services/audit"
	giftSvc "yourz-gift/internal/services/gift"
	locationSvc "yourz-gift/internal/services/location"
	menuSvc "yourz-gift/internal/services/menu"
	otpSvc "yourz-gift/internal/services/otp"
	permissionSvc "yourz-gift/internal/services/permission"
	resetSvc "yourz-gift/internal/services/reset"
	roleSvc "yourz-gift/internal/services/role"
	sessionSvc "yourz-gift/internal/services/session"
	userSvc "yourz-gift/internal/services/user"
	"yourz-gift/middlewares"
	"yourz-gift/pkg/config"
	"yourz-gift/pkg/logger"
	"yourz-gift/pkg/mailer"
	"yourz-gift/pkg/security"
	"yourz-gift/utils"
)

type Routes struct {
	App *gin.Engine
	DB  *gorm.DB
}

func NewRoutes() *Routes {
	app := gin.Default()

	app.Use(middlewares.CORS())
	app.Use(gin.CustomRecovery(middlewares.ErrorHandler))
	app.Use(middlewares.SetContextId())
	app.Use(middlewares.RequestLogger())

	app.GET("/healthcheck", func(ctx *gin.Context) {
		logger.WriteLogWithContext(ctx, logger.LogLevelDebug, "ClientIP: "+ctx.ClientIP())
		ctx.JSON(http.StatusOK, gin.H{
			"message": "OK!!",
		})
	})

	return &Routes{
		App: app,
	}
}

func (r *Routes) auditService() interfaceaudit.ServiceAuditInterface {
	return auditSvc.NewAuditService(auditRepo.NewAuditRepo(r.DB))
}

func (r *Routes) permissionRepo() interfacepermission.RepoPermissionInterface {
	return permissionRepo.NewPermissionRepo(r.DB)
}

func (r *Routes) middleware(permissionRepo interfacepermission.RepoPermissionInterface) *middlewares.Middleware {
	return middlewares.NewMiddleware(authRepo.NewBlacklistRepo(r.DB), permissionRepo)
}

func (r *Routes) UserRoutes() {
	blacklistRepo := authRepo.NewBlacklistRepo(r.DB)
	repo := userRepo.NewUserRepo(r.DB)
	rRepo := roleRepo.NewRoleRepo(r.DB)
	pRepo := r.permissionRepo()
	redisClient := database.GetRedisClient()
	permissionInvalidator := permissioncache.NewInvalidator(redisClient)
	uc := userSvc.NewUserService(repo, blacklistRepo, rRepo, pRepo, permissionInvalidator)
	var userSessionSvc interfacesession.ServiceSessionInterface
	repoAppConfig := appConfigRepo.NewAppConfigRepo(r.DB)
	svcAppConfig := appConfigSvc.NewAppConfigService(repoAppConfig)

	// Setup login limiter if Redis is available
	var loginLimiter security.LoginLimiter
	var registerOTPService = otpSvc.NewOTPService(nil, nil, config.LoadOTPConfig())
	var passwordResetService = resetSvc.NewPasswordResetService(nil, nil, config.LoadPasswordResetConfig())
	if redisClient != nil {
		loginLimiter = security.NewRedisLoginLimiter(
			redisClient,
			utils.GetEnv("LOGIN_ATTEMPT_LIMIT", 5),
			time.Duration(utils.GetEnv("LOGIN_ATTEMPT_WINDOW_SECONDS", 60))*time.Second,
			time.Duration(utils.GetEnv("LOGIN_BLOCK_DURATION_SECONDS", 300))*time.Second,
		)

		sRepo := sessionRepo.NewSessionRepository(redisClient)
		userSessionSvc = sessionSvc.NewSessionService(sRepo)

		sender, err := mailer.NewBrevoSenderFromEnv()
		if err != nil {
			logger.WriteLog(logger.LogLevelWarn, "Email sender not configured: ", err)
		} else {
			registerOTPService = otpSvc.NewOTPService(otpRepo.NewOTPRepository(redisClient), sender, config.LoadOTPConfig())
			passwordResetService = resetSvc.NewPasswordResetService(resetRepo.NewPasswordResetRepository(redisClient), sender, config.LoadPasswordResetConfig())
		}
	}

	h := userHandler.NewUserHandler(uc, blacklistRepo, userSessionSvc, loginLimiter, r.auditService(), svcAppConfig, registerOTPService, passwordResetService)
	mdw := middlewares.NewMiddleware(blacklistRepo, pRepo)

	// Setup register rate limiter
	registerLimit := utils.GetEnv("REGISTER_RATE_LIMIT", 5)
	registerWindowSeconds := utils.GetEnv("REGISTER_RATE_WINDOW_SECONDS", 60)
	if registerWindowSeconds <= 0 {
		registerWindowSeconds = 60
	}
	registerLimiter := middlewares.IPRateLimitMiddleware(
		redisClient,
		"user_register",
		registerLimit,
		time.Duration(registerWindowSeconds)*time.Second,
	)

	user := r.App.Group("/api/user")
	{
		user.GET("/register/status", h.GetRegisterStatus)
		user.POST("/register", registerLimiter, h.Register)
		user.POST("/register/otp/send", registerLimiter, h.SendRegisterOTP)
		user.POST("/login", h.Login)
		user.POST("/google/login", h.GoogleLogin)
		user.POST("/refresh-token", h.RefreshToken)
		user.POST("/forgot-password", h.ForgotPassword)
		user.POST("/reset-password", h.ResetPassword)

		userPriv := user.Group("").Use(mdw.AuthMiddleware())
		{
			userPriv.POST("/logout", h.Logout)
			userPriv.GET("", h.GetUserByAuth)
			userPriv.GET("/:id", mdw.PermissionMiddleware("users", "view"), h.GetUserById)
			userPriv.POST("/:id/impersonate", mdw.PermissionMiddleware("users", "impersonate"), h.ImpersonateUser)
			userPriv.POST("/stop-impersonation", h.StopImpersonation)
			userPriv.PUT("", h.Update)
			userPriv.PUT("/:id", mdw.PermissionMiddleware("users", "update"), h.UpdateUserById)
			userPriv.PUT("/change/password", h.ChangePassword)
			userPriv.DELETE("", h.Delete)
			userPriv.DELETE("/:id", mdw.PermissionMiddleware("users", "delete"), h.DeleteUserById)

			// Admin create user endpoint (with role selection)
			userPriv.POST("", mdw.PermissionMiddleware("users", "create"), h.AdminCreateUser)
		}
	}

	r.App.GET("/api/users", mdw.AuthMiddleware(), mdw.PermissionMiddleware("users", "list"), h.GetAllUsers)
}

func (r *Routes) RoleRoutes() {
	repoRole := roleRepo.NewRoleRepo(r.DB)
	repoPermission := r.permissionRepo()
	repoMenu := menuRepo.NewMenuRepo(r.DB)
	permissionInvalidator := permissioncache.NewInvalidator(database.GetRedisClient())
	svc := roleSvc.NewRoleService(repoRole, repoPermission, repoMenu, permissionInvalidator)
	h := roleHandler.NewRoleHandler(svc, r.auditService())
	mdw := r.middleware(repoPermission)

	// List endpoints
	r.App.GET("/api/roles", mdw.AuthMiddleware(), mdw.PermissionMiddleware("roles", "list"), h.GetAll)

	// CRUD endpoints
	role := r.App.Group("/api/role").Use(mdw.AuthMiddleware())
	{
		role.POST("", mdw.PermissionMiddleware("roles", "create"), h.Create)
		role.GET("/:id", mdw.PermissionMiddleware("roles", "view"), h.GetByID)
		role.PUT("/:id", mdw.PermissionMiddleware("roles", "update"), h.Update)
		role.DELETE("/:id", mdw.PermissionMiddleware("roles", "delete"), h.Delete)

		// Permission and menu assignment
		role.POST("/:id/permissions", mdw.PermissionMiddleware("roles", "assign_permissions"), h.AssignPermissions)
	}
}

func (r *Routes) PermissionRoutes() {
	repo := r.permissionRepo()
	permissionInvalidator := permissioncache.NewInvalidator(database.GetRedisClient())
	svc := permissionSvc.NewPermissionService(repo, permissionInvalidator)
	h := permissionHandler.NewPermissionHandler(svc, r.auditService())
	mdw := r.middleware(repo)

	// List endpoints
	r.App.GET("/api/permissions", mdw.AuthMiddleware(), mdw.PermissionMiddleware("permissions", "list"), h.GetAll)

	// Get current user's permissions
	r.App.GET("/api/permissions/me", mdw.AuthMiddleware(), h.GetUserPermissions)

	// CRUD endpoints
	permission := r.App.Group("/api/permission").Use(mdw.AuthMiddleware())
	{
		permission.POST("", mdw.PermissionMiddleware("permissions", "create"), h.Create)
		permission.GET("/:id", mdw.PermissionMiddleware("permissions", "view"), h.GetByID)
		permission.PUT("/:id", mdw.PermissionMiddleware("permissions", "update"), h.Update)
		permission.DELETE("/:id", mdw.PermissionMiddleware("permissions", "delete"), h.Delete)
	}
}

func (r *Routes) MenuRoutes() {
	repo := menuRepo.NewMenuRepo(r.DB)
	pRepo := r.permissionRepo()
	svc := menuSvc.NewMenuService(repo, pRepo)
	h := menuHandler.NewMenuHandler(svc, r.auditService())
	mdw := r.middleware(pRepo)

	// Public endpoints for authenticated users
	r.App.GET("/api/menus/active", mdw.AuthMiddleware(), h.GetActiveMenus)
	r.App.GET("/api/menus/me", mdw.AuthMiddleware(), h.GetUserMenus)

	// List endpoints
	r.App.GET("/api/menus", mdw.AuthMiddleware(), mdw.PermissionMiddleware("menus", "list"), h.GetAll)

	// CRUD endpoints
	menu := r.App.Group("/api/menu").Use(mdw.AuthMiddleware())
	{
		menu.GET("/:id", mdw.PermissionMiddleware("menus", "view"), h.GetByID)
		menu.PUT("/:id", mdw.PermissionMiddleware("menus", "update"), h.Update)
	}
}

func (r *Routes) AppConfigRoutes() {
	repo := appConfigRepo.NewAppConfigRepo(r.DB)
	svc := appConfigSvc.NewAppConfigService(repo)
	h := appConfigHandler.NewAppConfigHandler(svc, r.auditService())
	pRepo := r.permissionRepo()
	mdw := r.middleware(pRepo)

	r.App.GET("/api/configs", mdw.AuthMiddleware(), mdw.PermissionMiddleware("configs", "list"), h.GetAll)

	appConfig := r.App.Group("/api/config").Use(mdw.AuthMiddleware())
	{
		appConfig.GET("/:id", mdw.PermissionMiddleware("configs", "view"), h.GetByID)
		appConfig.PUT("/:id", mdw.PermissionMiddleware("configs", "update"), h.Update)
	}
}

func (r *Routes) AuditRoutes() {
	repo := auditRepo.NewAuditRepo(r.DB)
	svc := auditSvc.NewAuditService(repo)
	h := auditHandler.NewAuditHandler(svc)
	pRepo := r.permissionRepo()
	mdw := r.middleware(pRepo)

	r.App.GET("/api/audits", mdw.AuthMiddleware(), mdw.PermissionMiddleware("audits", "list"), h.GetAll)

	audit := r.App.Group("/api/audit").Use(mdw.AuthMiddleware())
	{
		audit.GET("/:id", mdw.PermissionMiddleware("audits", "view"), h.GetByID)
	}
}

func (r *Routes) SessionRoutes() {
	redisClient := database.GetRedisClient()
	if redisClient == nil {
		logger.WriteLog(logger.LogLevelDebug, "Redis not available, session routes will not be registered")
		return
	}

	repo := sessionRepo.NewSessionRepository(redisClient)
	svc := sessionSvc.NewSessionService(repo)
	h := sessionHandler.NewSessionHandler(svc, r.auditService())
	pRepo := r.permissionRepo()
	mdw := r.middleware(pRepo)

	// Session management endpoints (authenticated users only)
	sessionGroup := r.App.Group("/api/user").Use(mdw.AuthMiddleware())
	{
		sessionGroup.GET("/sessions", h.GetActiveSessions)
		sessionGroup.DELETE("/session/:session_id", h.RevokeSession)
		sessionGroup.POST("/sessions/revoke-others", h.RevokeAllOtherSessions)
	}

	logger.WriteLog(logger.LogLevelInfo, "Session management routes registered")
}

func (r *Routes) LocationRoutes() {
	repo := locationRepo.NewLocationRepo(r.DB)
	svc := locationSvc.NewLocationService(repo, database.GetRedisClient())
	h := locationHandler.NewLocationHandler(svc)
	pRepo := r.permissionRepo()
	mdw := r.middleware(pRepo)

	location := r.App.Group("/api/location")
	{
		location.GET("/province", h.GetProvince)
		location.GET("/city", h.GetCity)
		location.GET("/district", h.GetDistrict)
		location.GET("/village", h.GetVillage)
	}

	locationPriv := r.App.Group("/api/location").Use(mdw.AuthMiddleware())
	{
		locationPriv.POST("/sync", mdw.PermissionMiddleware("locations", "sync"), h.Sync)
		locationPriv.GET("/sync/:id", mdw.PermissionMiddleware("locations", "sync"), h.GetSyncJob)
	}
}

func (r *Routes) GiftRoutes() {
	listRepo := giftRepo.NewGiftListRepo(r.DB)
	itemRepo := giftRepo.NewGiftItemRepo(r.DB)
	reservationRepo := giftRepo.NewGiftReservationRepo(r.DB)
	friendRepo := giftRepo.NewGiftFriendRepo(r.DB)
	uRepo := userRepo.NewUserRepo(r.DB)
	svc := giftSvc.NewGiftService(listRepo, itemRepo, reservationRepo, friendRepo, uRepo)
	h := giftHandler.NewGiftHandler(svc, r.auditService())
	pRepo := r.permissionRepo()
	mdw := r.middleware(pRepo)

	public := r.App.Group("/api/public/gift-lists")
	{
		public.GET("/:code", h.GetPublicList)
		public.GET("/:code/items", h.GetPublicItems)
		public.POST("/:code/items/:item_id/reservations", h.CreatePublicReservation)
	}

	lists := r.App.Group("/api/gift-lists").Use(mdw.AuthMiddleware())
	{
		lists.GET("", mdw.PermissionMiddleware("gift_lists", "list"), h.GetLists)
		lists.POST("", mdw.PermissionMiddleware("gift_lists", "create"), h.CreateList)
		lists.GET("/friends", mdw.PermissionMiddleware("gift_lists", "list"), h.GetFriendLists)
		lists.GET("/:id", mdw.PermissionMiddleware("gift_lists", "view"), h.GetList)
		lists.PUT("/:id", mdw.PermissionMiddleware("gift_lists", "update"), h.UpdateList)
		lists.DELETE("/:id", mdw.PermissionMiddleware("gift_lists", "delete"), h.DeleteList)
		lists.GET("/:id/items", mdw.PermissionMiddleware("gift_items", "list"), h.GetItems)
		lists.POST("/:id/items", mdw.PermissionMiddleware("gift_items", "create"), h.CreateItem)
		lists.POST("/:id/items/reorder", mdw.PermissionMiddleware("gift_items", "update"), h.ReorderItems)
		lists.GET("/:id/reservations", mdw.PermissionMiddleware("gift_reservations", "list"), h.GetReservations)
	}

	items := r.App.Group("/api/gift-items").Use(mdw.AuthMiddleware())
	{
		items.PUT("/:id", mdw.PermissionMiddleware("gift_items", "update"), h.UpdateItem)
		items.DELETE("/:id", mdw.PermissionMiddleware("gift_items", "delete"), h.DeleteItem)
	}

	reservations := r.App.Group("/api/gift-reservations").Use(mdw.AuthMiddleware())
	{
		reservations.POST("/:id/thank", mdw.PermissionMiddleware("gift_reservations", "update"), h.MarkReservationThanked)
	}

	friends := r.App.Group("/api/friends").Use(mdw.AuthMiddleware())
	{
		friends.GET("", mdw.PermissionMiddleware("friends", "list"), h.GetFriends)
		friends.GET("/requests", mdw.PermissionMiddleware("friends", "list"), h.GetPendingFriendRequests)
		friends.POST("/request", mdw.PermissionMiddleware("friends", "create"), h.RequestFriend)
		friends.POST("/:id/accept", mdw.PermissionMiddleware("friends", "update"), h.AcceptFriend)
		friends.POST("/:id/reject", mdw.PermissionMiddleware("friends", "update"), h.RejectFriend)
		friends.DELETE("/:id", mdw.PermissionMiddleware("friends", "delete"), h.DeleteFriend)
	}
}

func (r *Routes) MediaRoutes() {
	storageProvider, err := mediaInfra.InitStorage()
	if err != nil {
		logger.WriteLog(logger.LogLevelError, "MediaRoutes; storage init failed: "+err.Error())
	}
	h := mediaHandler.NewMediaHandler(storageProvider)
	mdw := r.middleware(r.permissionRepo())

	media := r.App.Group("/api/media").Use(mdw.AuthMiddleware())
	{
		media.POST("/upload", h.UploadImage)
	}
}
