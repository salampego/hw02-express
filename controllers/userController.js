const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const { User } = require("../models/user.model");
const { register, login } = require("../models/user");

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

module.exports = {
  registerController,
  loginController,
  logOut,
  getCurrent,
  setAvatar,
};
