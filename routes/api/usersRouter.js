const express = require("express");
const {
  loginController,
  registerController,
  getCurrent,
  logOut,
} = require("../../controllers/userController");
const asyncWrapper = require("../../helpers/apiHelpers");
const { authMiddleware } = require("../../middlewares/authMiddlewares");

const router = express.Router();
router.post("/register", asyncWrapper(registerController));
router.get("/login", asyncWrapper(loginController));
router.post("/logout", asyncWrapper(authMiddleware), asyncWrapper(logOut));
router.get("/current", asyncWrapper(authMiddleware), asyncWrapper(getCurrent));

module.exports = router;
