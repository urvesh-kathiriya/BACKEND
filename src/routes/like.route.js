import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const LikeRoute = Router();
LikeRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

LikeRoute.route("/toggle/v/:videoId").post(toggleVideoLike);
LikeRoute.route("/toggle/c/:commentId").post(toggleCommentLike);
LikeRoute.route("/toggle/t/:tweetId").post(toggleTweetLike);
LikeRoute.route("/videos").get(getLikedVideos);

export default LikeRoute