package handlermedia

import (
	"net/http"
	"strings"
	"yourz-gift/pkg/messages"
	"yourz-gift/pkg/response"
	"yourz-gift/pkg/storage"
	"yourz-gift/utils"

	"github.com/gin-gonic/gin"
)

const maxImageSize = 5 << 20

type MediaHandler struct {
	Storage storage.StorageProvider
}

func NewMediaHandler(storageProvider storage.StorageProvider) *MediaHandler {
	return &MediaHandler{Storage: storageProvider}
}

func (h *MediaHandler) UploadImage(ctx *gin.Context) {
	logId := utils.GenerateLogId(ctx)
	if h.Storage == nil {
		res := response.ErrorResponse(http.StatusServiceUnavailable, messages.MsgSomethingWrong, logId, "media storage is not configured")
		ctx.JSON(http.StatusServiceUnavailable, res)
		return
	}

	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		res := response.ErrorResponse(http.StatusBadRequest, messages.InvalidRequest, logId, "file is required")
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	defer file.Close()

	if header.Size > maxImageSize {
		res := response.ErrorResponse(http.StatusBadRequest, messages.InvalidRequest, logId, "image size must be 5MB or less")
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	contentType := strings.ToLower(header.Header.Get("Content-Type"))
	if !strings.HasPrefix(contentType, "image/") {
		res := response.ErrorResponse(http.StatusBadRequest, messages.InvalidRequest, logId, "file must be an image")
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	folder := strings.Trim(ctx.PostForm("folder"), "/")
	if folder == "" {
		folder = "gift"
	}
	url, err := h.Storage.UploadFile(ctx.Request.Context(), file, header, folder)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.InternalServerError(logId))
		return
	}

	ctx.JSON(http.StatusOK, response.Response(http.StatusOK, "Image uploaded successfully", logId, gin.H{"url": url}))
}
