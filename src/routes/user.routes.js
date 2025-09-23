import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
console.log('Router created, registering route');

router.route("/register").post(registerUser)
console.log('Route /register registered');

export default router
