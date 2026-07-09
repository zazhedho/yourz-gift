package handlermedia

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"yourz-gift/pkg/messages"
	"yourz-gift/pkg/response"
	"yourz-gift/pkg/storage"
	"yourz-gift/utils"

	"github.com/gin-gonic/gin"
)

const maxImageSize = 5 << 20

var allowedImageContentTypes = map[string]struct{}{
	"image/gif":  {},
	"image/jpeg": {},
	"image/png":  {},
	"image/webp": {},
}

type MediaHandler struct {
	Storage storage.StorageProvider
}

type deleteImageRequest struct {
	URL string `json:"url"`
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
	contentType, ok := detectAllowedImageContentType(file)
	if !ok {
		res := response.ErrorResponse(http.StatusBadRequest, messages.InvalidRequest, logId, "file must be an image")
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	header.Header.Set("Content-Type", contentType)

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

func detectAllowedImageContentType(file multipart.File) (string, bool) {
	head := make([]byte, 512)
	n, err := file.Read(head)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", false
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", false
	}

	contentType := strings.ToLower(http.DetectContentType(head[:n]))
	_, ok := allowedImageContentTypes[contentType]
	return contentType, ok
}

func (h *MediaHandler) DeleteImage(ctx *gin.Context) {
	logId := utils.GenerateLogId(ctx)
	if h.Storage == nil {
		res := response.ErrorResponse(http.StatusServiceUnavailable, messages.MsgSomethingWrong, logId, "media storage is not configured")
		ctx.JSON(http.StatusServiceUnavailable, res)
		return
	}

	var req deleteImageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.URL) == "" {
		res := response.ErrorResponse(http.StatusBadRequest, messages.InvalidRequest, logId, "url is required")
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	if err := h.Storage.DeleteFile(ctx.Request.Context(), strings.TrimSpace(req.URL)); err != nil {
		ctx.JSON(http.StatusInternalServerError, response.InternalServerError(logId))
		return
	}

	ctx.JSON(http.StatusOK, response.Response(http.StatusOK, "Image deleted successfully", logId, nil))
}
