import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ", "").trim()

        if (!token) {
            throw new ApiError(401, "You are not authorized to access this resource")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       
        const user = await User.findById(decodeToken?._id).select({ password: 0, refreshToken: 0 })

        if (!user) {
            throw new ApiError(401, "invalid user creadentials")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid user creadentials")
    }


})