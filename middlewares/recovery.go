package middlewares

import (
	"fmt"
	"net/http"
	"yourz-gift/pkg/logger"
	"yourz-gift/pkg/response"
	"yourz-gift/utils"

	"github.com/gin-gonic/gin"
)

func ErrorHandler(c *gin.Context, err any) {
	logId := utils.GenerateLogId(c)
	logger.WriteLogWithContext(c, logger.LogLevelPanic, fmt.Sprintf("RECOVERY; Error: %+v;", err))

	res := response.InternalServerError(logId)
	c.AbortWithStatusJSON(http.StatusInternalServerError, res)
}
