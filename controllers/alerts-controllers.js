const mongoose = require("mongoose");

const Alert = require("../models/alert");
const User = require("../models/user");

const HttpError = require("../models/http-error");

const getAlerts = async (req, res, next) => {
  let alerts;
  try {
    alerts = await Alert.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ alerts: alerts });
};

const getAllAlerts = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found.", 404);
    return next(error);
  }

  let alerts;
  try {
    if (user.admin) {
      alerts = await Alert.find().sort({ _id: -1 });
    } else {
      alerts = await Alert.find({ creator: userId }).sort({ _id: -1 });
    }
  } catch (err) {
    const error = new HttpError(
      "Fetching alerts failed, please try again later.",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ alerts: alerts.map((alert) => alert.toObject({ getters: true })) });
};

const createAlert = async (req, res, next) => {
  const { title, description, creator } = req.body;

  const createdAlert = new Alert({
    title,
    description,
    creator,
  });

  console.log(createdAlert.title);
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating alert failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();

    sess.startTransaction();
    await createdAlert.save({ session: sess });

    user.alerts.push(createdAlert);

    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating alert failed(session failed), please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ alert: createdAlert });
};

const updateAlert = async (req, res, next) => {
  const alertId = req.params.alertId;

  let alert;
  try {
    alert = await Alert.findById(alertId);
  } catch (err) {
    const error = new HttpError("could not find the Alert.", 500);
    return next(error);
  }

  alert.read = true;

  try {
    await alert.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update alert.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Alert Updated" });
};

exports.createAlert = createAlert;
exports.getAlerts = getAlerts;
exports.getAllAlerts = getAllAlerts;
exports.updateAlert = updateAlert;
