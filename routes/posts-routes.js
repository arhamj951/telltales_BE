const express = require("express");
const { check } = require("express-validator");

const postsControllers = require("../controllers/posts-controllers");

const router = express.Router();

router.get("/allapprovedposts", postsControllers.getAllApprovedPosts);
router.get("/adminposts", postsControllers.getPostByPendingApproval);
router.get("/:pid", postsControllers.getPostById);
router.get("/user/:uid", postsControllers.getPostsByUserId);

router.post(
  "/createpost",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  postsControllers.createPost
);

router.patch(
  "/update/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  postsControllers.updatePost
);

router.patch("/adminposts/:pid", postsControllers.updatePostApproval);

router.delete("/delete/:pid", postsControllers.deletePost);

module.exports = router;
