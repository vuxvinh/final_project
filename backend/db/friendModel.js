const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
  {
    // lưu theo cặp có thứ tự để tránh trùng (A,B) và (B,A)
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date_time: { type: Date, default: Date.now },
  },
  { collection: "friend" }
);

// đảm bảo duy nhất 1 quan hệ bạn bè cho 1 cặp
FriendSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model("Friend", FriendSchema);
