const Comment = require("../model/commentModel"); // Assuming you have the model path correct
const User = require("../model/UserModel");

const createComment = ({ userId, content }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return resolve({
          status: "ERR",
          message: "User not found",
        });
      }

      const newComment = await Comment.create({
        content,
        user: userId,
      });

      resolve({
        status: "OK",
        message: "Comment created successfully",
        data: newComment,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Internal Server Error",
      });
    }
  });
};

const updateComment = ({ commentId, content }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
      );

      if (!comment) {
        return resolve({
          status: "ERR",
          message: "Comment not found",
        });
      }

      resolve({
        status: "OK",
        message: "Comment updated successfully",
        data: comment,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Internal Server Error",
      });
    }
  });
};

const deleteComment = (commentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment) {
        return resolve({
          status: "ERR",
          message: "Comment not found",
        });
      }
      resolve({
        status: "OK",
        message: "Comment deleted successfully",
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Internal Server Error",
      });
    }
  });
};

const getAllComments = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const comments = await Comment.find();
      resolve({
        status: "OK",
        data: comments,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: error.message || "Internal Server Error",
      });
    }
  });
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getAllComments,
};
