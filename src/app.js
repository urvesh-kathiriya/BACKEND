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

const api=process.env.API_URL || '/api/v1';

import UserRouter from './routes/user.route.js';


app.use(`${api}/user`,UserRouter)

export default app;