import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const SubscriptionRoute = Router();
SubscriptionRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

SubscriptionRoute
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

SubscriptionRoute.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default SubscriptionRoute