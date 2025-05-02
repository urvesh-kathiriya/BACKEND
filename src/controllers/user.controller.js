import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import option from "../utils/Cookie.Option.js";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}


export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body

    if ([username, email, fullName, password].some(item => !item || item.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }


    const existedUser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (existedUser) {
        throw new ApiError(409, "Username or email already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;

    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is not upload on server")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select({ password: 0, refreshToken: 0 })

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(200, "email and username required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const IsValidPassword = await user.isPasswordCorrect(password)
    if (!IsValidPassword) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loginuser = await User.findById(user._id).select({ password: 0, refreshToken: 0 }) // to fetch user with refresh tokens
    if (!loginuser) {
        throw new ApiError(500, "Something went wrong while logging in the user")
    }
    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(200, { user: loginuser, accessToken, refreshToken }, "User logged in Successfully")
        )


})

export const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: ""
        }
    },
        { new: true }
    )
    if (!user) {
        throw new ApiError(500, "Something went wrong while logging out the user")
    }
    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponse(200, {}, `${user.username} User logged out Successfully`)
        )
})


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }


        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body;

    if (!oldpassword && !newpassword) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isValidPassword = await user.isPasswordCorrect(oldpassword)

    if (!isValidPassword) {
        throw new ApiError(401, "Invalid old password")
    }
    user.password = newpassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body

    if (!email && !fullName) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
                fullName
            }
        },
        { new: true }
    ).select({ password: 0, refreshToken: 0 })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User updated successfully")
    )
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const existuser = await User.findById(req.user?._id)
    if (!existuser) {
        throw new ApiError(404, "User not found")
    }
    const deletedPrevAvatar = await deleteFromCloudinary(existuser?.avatar)
    if (!deletedPrevAvatar) {
        throw new ApiError(400, "Prev Avatar file is not deleted from server")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is not upload on server")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select({ password: 0, refreshToken: 0 })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json(
        new ApiResponse(200, { "avatar": user.avatar }, "User avatar updated successfully")
    )
}
)

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is required")
    }

    const existuser = await User.findById(req.user?._id)
    if (!existuser) {
        throw new ApiError(404, "User not found")
    }
    const deletedPrevcoverImage = await deleteFromCloudinary(existuser?.coverImage)
    if (!deletedPrevcoverImage) {
        throw new ApiError(400, "Prev Cover Image file is not deleted from server")
    }

    const CoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!CoverImage) {
        throw new ApiError(400, "Cover Image file is not upload on server")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: CoverImage.url
            }
        },
        { new: true }
    ).select({ password: 0, refreshToken: 0 })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json(
        new ApiResponse(200, { "coverImage": user.coverImage }, "User Cover Image updated successfully")
    )
}
)

export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
})

export const getWatdhHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$owner"
                            }
                        }
                    }
                ]

            }
        }
    ])
})