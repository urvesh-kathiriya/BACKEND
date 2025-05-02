import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const UserRouter = Router();

// GET

UserRouter.route("/get-current-user").get(verifyJWT, getCurrentUser)
UserRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile)
UserRouter.route("/history").get(verifyJWT, getWatchHistory)

//POST

UserRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
        ,
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

UserRouter.route("/login").post(loginUser)
UserRouter.route("/logout").post(verifyJWT, logoutUser)
UserRouter.route("/refresh-token").post(refreshAccessToken)
UserRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)

//PATCH

UserRouter.route("/update-details").patch(verifyJWT, updateAccountDetails)
UserRouter.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
UserRouter.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

export default UserRouter;