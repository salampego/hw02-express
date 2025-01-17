const express = require("express");
const {
  loginController,
  registerController,
  getCurrent,
  logOut,
  setAvatar,
  verification,
  resendVerificationCode,
} = require("../../controllers/userController");
const asyncWrapper = require("../../helpers/apiHelpers");
const { authMiddleware } = require("../../middlewares/authMiddlewares");
const { upload } = require("../../middlewares/upload");

const router = express.Router();
router.post("/register", asyncWrapper(registerController));

router.get("/login", asyncWrapper(loginController));

router.post("/logout", asyncWrapper(authMiddleware), asyncWrapper(logOut));

router.get("/current", asyncWrapper(authMiddleware), asyncWrapper(getCurrent));

router.patch(
  "/avatars",
  asyncWrapper(authMiddleware),
  asyncWrapper(upload.single("avatar")),
  asyncWrapper(setAvatar)
);

router.get("/verify/:verificationToken", asyncWrapper(verification));

router.post("/verify", asyncWrapper(resendVerificationCode));

module.exports = router;
