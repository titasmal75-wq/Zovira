const mongoose = require("mongoose");
const favourite = require("./favourite");

const homeSchema = new mongoose.Schema({
  
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  houseName: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 20
  },

  location: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true
  },

  photo: String,

  description: String
});

homeSchema.virtual("photoUrl").get(function() {
  const photo = this.photo;
  if (!photo || typeof photo !== "string" || photo.trim() === "") {
    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80";
  }
  const trimmed = photo.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
    return trimmed;
  }
  let normalized = trimmed.replace(/\\/g, "/");
  normalized = normalized.replace(/^\/?uploads\//, "");
  normalized = normalized.replace(/^\/+/, "");
  return "/uploads/" + normalized;
});

homeSchema.pre('findOneAndDelete', async function() {
  console.log('Came to pre hook while deleting a home');
  const homeId = this.getQuery()._id;
  await favourite.deleteMany({ houseId: homeId });
});

module.exports = mongoose.model("Home", homeSchema);
