import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const TweetRoute = Router();
TweetRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

TweetRoute.route("/").post(createTweet);
TweetRoute.route("/user/:userId").get(getUserTweets);
TweetRoute.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default TweetRoute