import { Router } from "express";
import {
  getAllUser,
  loginUser,
  registerUser,
  upadateAvatar,
  upadateCover,
  upadateProfile,
  updatePasswordWord,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser,
);
router.route("/login").post(loginUser);
router.route("").get(verifyUser, getAllUser);
router.route("/update-profile").post(verifyUser, upadateProfile);
router.route("/update-coverimage").post(
  verifyUser,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  upadateCover,
);
router.route("/update-avatar").post(
  verifyUser,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  upadateAvatar,
);
router.route("/change-password").post(verifyUser, updatePasswordWord);
export default router;
