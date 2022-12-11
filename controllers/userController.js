const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const createError = require("http-errors");
const sgMail = require("@sendgrid/mail");
const { User } = require("../models/user.model");
const { register, login } = require("../models/user");
require("dotenv").config();

const { SEND_GRID_API } = process.env;

sgMail.setApiKey(SEND_GRID_API);

const registerController = async (req, res) => {
  const { email, password, subscription } = req.body;
  await register(email, password, subscription);
  res.status(201).json({ status: "success", code: 201 });
};
const loginController = async (req, res) => {
  const { email, password } = req.body;
  const currentUser = await User.findOne({ email });
  const { subscription } = currentUser;

  const token = await login(email, password);
  res.json({
    status: "success",
    code: 200,
    token,
    user: { email, subscription },
  });
};

const logOut = async (req, res) => {
  const { user } = req;
  user.token = null;
  await User.findByIdAndUpdate(user._id, user);
  res.status(204).send();
};

const getCurrent = async (req, res) => {
  const { email } = req.user;
  const currentUser = await User.findOne({ email });
  const { subscription } = currentUser;
  res.status(200).json({
    status: "success",
    code: 200,
    data: { email, subscription },
  });
};

const setAvatar = async (req, res) => {
  const avatarsDir = path.join(__dirname, "../public/avatars");

  try {
    const { _id } = req.user;
    const { path: tempPath, originalname } = req.file;

    const [extension] = originalname.split(".").reverse();

    const newName = `${_id}.${extension}`;

    const uploadPath = path.join(avatarsDir, newName);

    await fs.rename(tempPath, uploadPath);

    Jimp.read(uploadPath)
      .then((fname) => {
        return fname.resize(250, 250).write(uploadPath);
      })
      .catch((err) => {
        console.error(err);
      });

    const avatarURL = path.join("avatars", newName);

    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
      status: "success",
      code: 200,
      data: { avatarURL },
    });
  } catch (error) {
    await fs.unlink(req.file.path);
    throw error;
  }
};

const verification = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true }
  );

  if (!user) {
    throw createError(404, "User not found");
  }

  const msgRegistration = {
    to: user.email,
    from: "samplelogo19@gmail.com",
    subject: "Registration successfull!",
    text: "Thanks for the choose our service. Have a good one!",
    html: "<strong>Thanks for the chose our service. And have a good one!</strong>",
  };

  sgMail.send(msgRegistration);

  res.json({ message: "Verification successful" });
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(404, "User not found");
  }

  if (user.verify) {
    throw createError(400, "Verification has already been passed");
  }

  const msgVerification = {
    to: email,
    from: "samplelogo19@gmail.com",
    subject: "Please Verify Your Account",
    text: `Let's verify your email. Click on the link to confirm email http://localhost:3000/api/users/verify/${user.verificationToken}`,
    html: `<h2> Let's verify your email. </h2> <p>Click on the link to confirm email http://localhost:3000/api/users/verify/${user.verificationToken}</p>`,
  };

  sgMail.send(msgVerification);

  res.json({ message: "Verification email sent" });
};

module.exports = {
  registerController,
  loginController,
  logOut,
  getCurrent,
  setAvatar,
  verification,
  resendVerificationCode,
};
