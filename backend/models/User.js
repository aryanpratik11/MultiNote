import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: "member" },
  tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;