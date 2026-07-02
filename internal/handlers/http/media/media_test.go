package handlermedia

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"testing"
	"yourz-gift/pkg/storage"

	"github.com/gin-gonic/gin"
)

type mediaStorageStub struct {
	url string
}

func (s mediaStorageStub) UploadFile(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader, folder string) (string, error) {
	return s.url, nil
}

func (s mediaStorageStub) UploadFileFromBytes(ctx context.Context, data []byte, filename string, folder string, contentType string) (string, error) {
	return s.url, nil
}

func (s mediaStorageStub) DeleteFile(ctx context.Context, fileURL string) error { return nil }
func (s mediaStorageStub) GetFileURL(objectName string) string                  { return s.url }
func (s mediaStorageStub) DownloadFile(ctx context.Context, objectName string) (io.ReadCloser, error) {
	return io.NopCloser(bytes.NewReader(nil)), nil
}

var _ storage.StorageProvider = (*mediaStorageStub)(nil)

func TestUploadImageReturnsUploadedURL(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	header := make(textproto.MIMEHeader)
	header.Set("Content-Disposition", `form-data; name="file"; filename="gift.png"`)
	header.Set("Content-Type", "image/png")
	part, err := writer.CreatePart(header)
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := part.Write([]byte("png")); err != nil {
		t.Fatalf("write file: %v", err)
	}
	if err := writer.WriteField("folder", "gift-lists"); err != nil {
		t.Fatalf("write field: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}

	router := gin.New()
	handler := NewMediaHandler(mediaStorageStub{url: "https://cdn.example.com/gift.png"})
	router.POST("/api/media/upload", handler.UploadImage)

	req := httptest.NewRequest(http.MethodPost, "/api/media/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if !bytes.Contains(rec.Body.Bytes(), []byte("https://cdn.example.com/gift.png")) {
		t.Fatalf("expected uploaded URL in response, got %s", rec.Body.String())
	}
}
