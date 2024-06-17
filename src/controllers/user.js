const User = require("../models/user");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    await user.save();

    res.status(200).json({ message: "Avatar uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading avatar" });
  }
};

exports.getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.avatar || !user.avatar.data) {
      return res.status(404).json({ message: "Avatar not found" });
    }

    res.contentType(user.avatar.contentType);
    res.send(user.avatar.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving avatar" });
  }
};
