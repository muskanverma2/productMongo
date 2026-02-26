const mongoose = require("mongoose");


const AvailabilitySchema = new mongoose.Schema(
  {

    date: {
      type: String,
      default: null,
    },

    productId: {
      type: String,
      default: null,
    },

    startTime: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    dateAndTime: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    time: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    recurrenceRuleIds: {
      type: String,
      default: null,
    },

    total: {
      type: Number,
      default: null,
    },

    pickupTotal: {
      type: Number,
      default: 0,
    },

    minimum: {
      type: Number,
      default: 0,
    },

    booked: {
      type: Number,
      default: 0,
    },

    pickupBooked: {
      type: Number,
      default: 0,
    },

    available: {
      type: Number,
      default: 0,
    },

    pickupAvailable: {
      type: Number,
      default: 0,
    },

    pickupAllotment: {
      type: Boolean,
      default: false,
    },

    freeSale: {
      type: Boolean,
      default: false,
    },

    closed: {
      type: Boolean,
      default: false,
    },

    unavailable: {
      type: Boolean,
      default: false,
    },

    guidedLanguages: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "availabilities",
    timestamps: true,
    toJSON: { virtuals: true },  
    toObject: { virtuals: true },
  }
);



AvailabilitySchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "id",
  justOne: true,
});


AvailabilitySchema.virtual("recurrence", {
  ref: "Recurrence",
  localField: "recurrenceRuleIds",
  foreignField: "id",
  justOne: true,
});

module.exports = mongoose.model("Availability", AvailabilitySchema);
