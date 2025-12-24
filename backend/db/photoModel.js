const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema(
  {
    file_name: { type: String, required: true },
    date_time: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    comments: [
      {
        comment: { type: String, required: true },
        date_time: { type: Date, default: Date.now },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],

    // ✅ NEW: likes (danh sách user đã like ảnh)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { collection: "photos" }
);

module.exports = mongoose.model("Photo", PhotoSchema);
