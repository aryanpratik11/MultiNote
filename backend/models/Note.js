import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
