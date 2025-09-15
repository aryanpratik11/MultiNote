import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  subscription_plan: { type: String, default: "free" },
  created_at: { type: Date, default: Date.now },
});

const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant;
