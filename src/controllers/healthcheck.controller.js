import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    try {
        const health = {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
        return ApiResponse(200, health , "Health check successful")
        
    } catch (error) {
        return ApiError(500, error.message, "Health check failed")
        
    }
})

export {
    healthcheck
}
