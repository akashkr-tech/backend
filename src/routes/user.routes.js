import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import{upload} from "../controllers/user.controller.js"
const router = Router();
console.log('Router created, registering route');

router.route("/register").post(registerUser)
console.log('Route /register registered');

router.route("/upload").post(upload.fields([
    {name:'avatar', maxCount:1},
    {name:'coverImage', maxCount:1}
]),
registerUser
)

export default router
