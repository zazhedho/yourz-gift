package handlergift

import (
	"errors"
	"net/http"
	"yourz-gift/internal/authscope"
	domainaudit "yourz-gift/internal/domain/audit"
	"yourz-gift/internal/dto"
	handlercommon "yourz-gift/internal/handlers/http/common"
	interfaceaudit "yourz-gift/internal/interfaces/audit"
	interfacegift "yourz-gift/internal/interfaces/gift"
	repositorygift "yourz-gift/internal/repositories/gift"
	servicegift "yourz-gift/internal/services/gift"
	"yourz-gift/pkg/filter"
	"yourz-gift/pkg/messages"
	"yourz-gift/pkg/response"
	"yourz-gift/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GiftHandler struct {
	Service interfacegift.ServiceGiftInterface
	handlercommon.AuditWriter
}

func NewGiftHandler(s interfacegift.ServiceGiftInterface, auditService interfaceaudit.ServiceAuditInterface) *GiftHandler {
	return &GiftHandler{
		Service:     s,
		AuditWriter: handlercommon.NewAuditWriter(auditService, "GiftHandler"),
	}
}

func (h *GiftHandler) CreateList(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	var req dto.GiftListCreate
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][CreateList]", &req) {
		return
	}
	data, err := h.Service.CreateList(ctx.Request.Context(), ownerId, req)
	h.writeMutationAudit(ctx, domainaudit.ActionCreate, "gift_list", data.Id, "Created gift list", nil, data, err)
	writeGiftResult(ctx, http.StatusCreated, "Gift list created successfully", data, err)
}

func (h *GiftHandler) GetLists(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	logId := utils.GenerateLogId(ctx)
	params, err := filter.GetBaseParams(ctx, "created_at", "desc", 20)
	if err != nil {
		res := response.Response(http.StatusBadRequest, messages.InvalidRequest, logId, nil)
		res.Error = response.Errors{Code: http.StatusBadRequest, Message: "invalid query parameters"}
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	data, total, err := h.Service.GetOwnerLists(ctx.Request.Context(), ownerId, params)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.InternalServerError(logId))
		return
	}
	ctx.JSON(http.StatusOK, response.PaginationResponse(http.StatusOK, int(total), params.Page, params.Limit, logId, data))
}

func (h *GiftHandler) GetList(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	data, err := h.Service.GetOwnerList(ctx.Request.Context(), ownerId, ctx.Param("id"))
	writeGiftResult(ctx, http.StatusOK, "Get gift list successfully", data, err)
}

func (h *GiftHandler) UpdateList(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	var req dto.GiftListUpdate
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][UpdateList]", &req) {
		return
	}
	before, _ := h.Service.GetOwnerList(ctx.Request.Context(), ownerId, ctx.Param("id"))
	data, err := h.Service.UpdateList(ctx.Request.Context(), ownerId, ctx.Param("id"), req)
	h.writeMutationAudit(ctx, domainaudit.ActionUpdate, "gift_list", ctx.Param("id"), "Updated gift list", before, data, err)
	writeGiftResult(ctx, http.StatusOK, "Gift list updated successfully", data, err)
}

func (h *GiftHandler) DeleteList(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	before, _ := h.Service.GetOwnerList(ctx.Request.Context(), ownerId, ctx.Param("id"))
	err := h.Service.DeleteList(ctx.Request.Context(), ownerId, ctx.Param("id"))
	h.writeMutationAudit(ctx, domainaudit.ActionDelete, "gift_list", ctx.Param("id"), "Deleted gift list", before, nil, err)
	writeGiftResult(ctx, http.StatusOK, "Gift list deleted successfully", nil, err)
}

func (h *GiftHandler) CreateItem(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	var req dto.GiftItemCreate
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][CreateItem]", &req) {
		return
	}
	data, err := h.Service.CreateItem(ctx.Request.Context(), ownerId, ctx.Param("list_id"), req)
	h.writeMutationAudit(ctx, domainaudit.ActionCreate, "gift_item", data.Id, "Created gift item", nil, data, err)
	writeGiftResult(ctx, http.StatusCreated, "Gift item created successfully", data, err)
}

func (h *GiftHandler) GetItems(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	data, err := h.Service.GetOwnerItems(ctx.Request.Context(), ownerId, ctx.Param("list_id"), ctx.Query("archived") == "true")
	writeGiftResult(ctx, http.StatusOK, "Get gift items successfully", data, err)
}

func (h *GiftHandler) UpdateItem(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	var req dto.GiftItemUpdate
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][UpdateItem]", &req) {
		return
	}
	data, err := h.Service.UpdateItem(ctx.Request.Context(), ownerId, ctx.Param("id"), req)
	h.writeMutationAudit(ctx, domainaudit.ActionUpdate, "gift_item", ctx.Param("id"), "Updated gift item", nil, data, err)
	writeGiftResult(ctx, http.StatusOK, "Gift item updated successfully", data, err)
}

func (h *GiftHandler) DeleteItem(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	err := h.Service.DeleteItem(ctx.Request.Context(), ownerId, ctx.Param("id"))
	h.writeMutationAudit(ctx, domainaudit.ActionDelete, "gift_item", ctx.Param("id"), "Deleted gift item", nil, nil, err)
	writeGiftResult(ctx, http.StatusOK, "Gift item deleted successfully", nil, err)
}

func (h *GiftHandler) ReorderItems(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	var req dto.GiftItemReorder
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][ReorderItems]", &req) {
		return
	}
	err := h.Service.ReorderItems(ctx.Request.Context(), ownerId, ctx.Param("list_id"), req)
	h.writeMutationAudit(ctx, domainaudit.ActionUpdate, "gift_item", ctx.Param("list_id"), "Reordered gift items", nil, req, err)
	writeGiftResult(ctx, http.StatusOK, "Gift items reordered successfully", nil, err)
}

func (h *GiftHandler) GetReservations(ctx *gin.Context) {
	ownerId, ok := ownerID(ctx)
	if !ok {
		unauthorized(ctx)
		return
	}
	data, err := h.Service.GetReservations(ctx.Request.Context(), ownerId, ctx.Param("list_id"))
	writeGiftResult(ctx, http.StatusOK, "Get gift reservations successfully", data, err)
}

func (h *GiftHandler) GetPublicList(ctx *gin.Context) {
	data, err := h.Service.GetPublicList(ctx.Request.Context(), ctx.Param("code"))
	writeGiftResult(ctx, http.StatusOK, "Get public gift list successfully", data, err)
}

func (h *GiftHandler) GetPublicItems(ctx *gin.Context) {
	data, err := h.Service.GetPublicItems(ctx.Request.Context(), ctx.Param("code"))
	writeGiftResult(ctx, http.StatusOK, "Get public gift items successfully", data, err)
}

func (h *GiftHandler) CreatePublicReservation(ctx *gin.Context) {
	var req dto.GiftReservationCreate
	logId := utils.GenerateLogId(ctx)
	if !handlercommon.BindJSON(ctx, logId, "[GiftHandler][CreatePublicReservation]", &req) {
		return
	}
	data, err := h.Service.CreatePublicReservation(ctx.Request.Context(), ctx.Param("code"), ctx.Param("item_id"), req)
	h.writeMutationAudit(ctx, domainaudit.ActionCreate, "gift_reservation", data.Id, "Created gift reservation", nil, data, err)
	writeGiftResult(ctx, http.StatusCreated, "Gift item reserved successfully", data, err)
}

func ownerID(ctx *gin.Context) (string, bool) {
	scope := authscope.FromContext(ctx.Request.Context())
	return scope.UserID, scope.UserID != ""
}

func unauthorized(ctx *gin.Context) {
	logId := utils.GenerateLogId(ctx)
	ctx.JSON(http.StatusUnauthorized, response.Response(http.StatusUnauthorized, "Unauthorized", logId, nil))
}

func writeGiftResult(ctx *gin.Context, status int, message string, data interface{}, err error) {
	logId := utils.GenerateLogId(ctx)
	if err == nil {
		ctx.JSON(status, response.Response(status, message, logId, data))
		return
	}
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound), errors.Is(err, servicegift.ErrGiftListNotPublic):
		res := response.Response(http.StatusNotFound, "Gift resource not found", logId, nil)
		res.Error = response.Errors{Code: http.StatusNotFound, Message: "gift resource not found"}
		ctx.JSON(http.StatusNotFound, res)
	case errors.Is(err, servicegift.ErrForbiddenGiftAccess):
		res := response.Response(http.StatusForbidden, "Forbidden", logId, nil)
		res.Error = response.Errors{Code: http.StatusForbidden, Message: "forbidden"}
		ctx.JSON(http.StatusForbidden, res)
	case errors.Is(err, repositorygift.ErrInsufficientQuantity):
		res := response.Response(http.StatusConflict, "Insufficient item quantity", logId, nil)
		res.Error = response.Errors{Code: http.StatusConflict, Message: "insufficient item quantity"}
		ctx.JSON(http.StatusConflict, res)
	default:
		ctx.JSON(http.StatusInternalServerError, response.InternalServerError(logId))
	}
}

func (h *GiftHandler) writeMutationAudit(ctx *gin.Context, action, resource, resourceID, message string, before, after interface{}, err error) {
	event := domainaudit.AuditEvent{
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Status:     domainaudit.StatusSuccess,
		Message:    message,
		BeforeData: before,
		AfterData:  after,
	}
	if err != nil {
		event.Status = domainaudit.StatusFailed
		event.ErrorMessage = err.Error()
	}
	h.WriteAudit(ctx, event)
}
