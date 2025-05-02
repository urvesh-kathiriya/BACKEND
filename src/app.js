import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { DATA_LIMIT } from './constants.js';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:DATA_LIMIT}));
app.use(express.urlencoded({extended:true,limit:DATA_LIMIT}));
app.use(express.static('public'));
app.use(cookieParser());

const api=process.env.API_URL ;

import UserRouter from './routes/user.route.js';
import CommentRoute from './routes/comment.route.js';
import HealthCheckRoute from './routes/healthcheck.route.js';
import LikeRoute from './routes/like.route.js';
import PlayListRoute from './routes/playlist.route.js';
import SubscriptionRoute from './routes/subscription.route.js';
import TweetRoute from './routes/tweet.route.js';
import VideoRoute from './routes/video.route.js';


app.use(`${api}/user`,UserRouter)
app.use(`${api}/comment`,CommentRoute)
app.use(`${api}/healthcheck`,HealthCheckRoute)
app.use(`${api}/like`,LikeRoute)
app.use(`${api}/playlist`,PlayListRoute)
app.use(`${api}/subscription`,SubscriptionRoute)
app.use(`${api}/tweet`,TweetRoute)
app.use(`${api}/video`,VideoRoute)

export default app;