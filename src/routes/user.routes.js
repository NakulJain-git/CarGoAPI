import { Router } from "express";
import {registerUser,
    login,
    logout,
    refreshAccessToken,
    getMe,
    updatePassword

} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(login)
//secured routes
router.route("/logout").post(verifyJWT,logout)
router.route("/refresh").post(refreshAccessToken)
router.route("/getMe").get(verifyJWT,getMe)
router.route("/update-password").put(verifyJWT,updatePassword)
export default router;