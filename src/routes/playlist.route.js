import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const PlayListRoute = Router();

PlayListRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

PlayListRoute.route("/").post(createPlaylist)

PlayListRoute
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

PlayListRoute.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
PlayListRoute.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

PlayListRoute.route("/user/:userId").get(getUserPlaylists);

export default PlayListRoute