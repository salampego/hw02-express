const { register, login } = require("../models/user");
const { User } = require("../models/user.model");

const registerController = async (req, res) => {
  const { email, password } = req.body;
  await register(email, password);
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
module.exports = { registerController, loginController, logOut, getCurrent };
