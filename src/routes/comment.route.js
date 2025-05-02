import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const CommentRoute = Router();

CommentRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

CommentRoute.route("/:videoId").get(getVideoComments).post(addComment);
CommentRoute.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default CommentRoute