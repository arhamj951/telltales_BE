const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Post = require("../models/post");
const User = require("../models/user");
const Alert = require("../models/alert");

const getAllApprovedPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find({ Approval: "approve" });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  if (posts.length === 0) {
    return res.json({ message: "no posts has been posted yet" });
  } else if (!posts) {
    return next(new HttpError("Could not find posts for Approval.", 404));
  }

  res.json({
    posts: posts.map((post) => post.toObject({ getters: true })),
  });
};

const getPostById = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a post.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError(
      "Could not find post for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ post: post });
};

const getPostByPendingApproval = async (req, res, next) => {
  let postsWithPendingApproval;
  try {
    postsWithPendingApproval = await Post.find({ Approval: "Pending" });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  if (postsWithPendingApproval.length === 0) {
    return res.json({ message: "no posts for apporval" });
  } else if (!postsWithPendingApproval) {
    return next(new HttpError("Could not find posts for Approval.", 404));
  }

  res.json({
    posts: postsWithPendingApproval.map((post) =>
      post.toObject({ getters: true })
    ),
  });
};

const getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let posts;
  let userWithPosts;
  try {
    userWithPosts = await User.findById(userId).populate("posts");
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!posts || posts.length === 0) {
  if (!userWithPosts || userWithPosts.posts.length === 0) {
    return next(
      new HttpError("Could not find posts for the provided user id.", 404)
    );
  }
  res.json({
    posts: userWithPosts.posts.map((post) => post.toObject({ getters: true })),
  });
};

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, tag, creator } = req.body;

  // let coordinates;
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  const createdPost = new Post({
    title,
    description,
    tag,
    creator,
    Approval: "Pending",
  });

  console.log(createdPost);

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating post failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  const createdAlert = new Alert({
    title: "New Post Created",
    description: `A new post titled "${title}" has been created by ${user.name}.`,
    creator: user._id,
  });

  try {
    await createdPost.save();
    // const sess = await mongoose.startSession();
    // console.log("1");

    // sess.startTransaction();
    // await createdPost.save({ session: sess });
    // console.log("2");

    user.posts.push(createdPost);
    // console.log("3");

    await user.save();
    await createdAlert.save();
    // console.log("4");

    // await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating post failed(session failed), please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};

const updatePostApproval = async (req, res, next) => {
  const { Approval } = req.body;
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update post.",
      500
    );
    return next(error);
  }

  if (Approval) {
    post.Approval = Approval;
  } else {
    console.log("Approval field not found");
  }

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ post: post });
};

const updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, tag } = req.body;
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update post.",
      500
    );
    return next(error);
  }

  post.title = title;
  post.description = description;
  post.tag = tag;
  post.Approval = "Pending";

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ post: post });
};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    // Find the post and populate the creator field
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }

  try {
    await Post.findByIdAndDelete(postId);

    post.creator.posts = post.creator.posts.filter(
      (post) => post.toString() !== postId
    );
    await post.creator.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted post." });
};

exports.getPostById = getPostById;
exports.getPostsByUserId = getPostsByUserId;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPostByPendingApproval = getPostByPendingApproval;
exports.updatePostApproval = updatePostApproval;
exports.getAllApprovedPosts = getAllApprovedPosts;
