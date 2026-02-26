const mongoose = require("mongoose");
const { Schema } = mongoose;

const gygReserveSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    gygBookingReference: {
      type: String,
      default: null,
    },
    dateTime: {
      type: Date,
      default: null,
    },
    bookingItems: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "gygReserve",
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const GygReserve = mongoose.model("GygReserve", gygReserveSchema);

module.exports = GygReserve;
