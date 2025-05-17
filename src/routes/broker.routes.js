import { Router } from "express";
import {
    getAllBrokers,
    getBrokerById,
    createBroker, updateBroker,
    deleteBroker
} from "../controllers/broker.controllers.js";
import {verifyJWT,authorize} from "../middlewares/auth.middlewares.js"

const router = Router();

router.route("/")
.get(verifyJWT,getAllBrokers)
.post(verifyJWT,authorize("admin"),createBroker)

router.route("/:id")
.get(verifyJWT,getBrokerById)
.put(verifyJWT,authorize("admin"),updateBroker)
.delete(verifyJWT,authorize("admin"),deleteBroker)

export default router;
