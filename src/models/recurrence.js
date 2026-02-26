

// module.exports = Recurrence;
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Counter schema for auto-increment
const counterSchema = new Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

const recurrenceSchema = new Schema(
  {
    index: {
      type: Number,
      unique: true,
    },
    type: {
      type: String,
      enum: ["FIXED_DATE", "DATE_RANGE", "MONTHLY", "WEEKLY"],
      default: null,
    },
    rule: {
      type: Schema.Types.Mixed,
      default: null,
    },
    recurrenceType: {
      type: String,
      default: "OPEN",
    },
    maxCapacity: {
      type: Number,
      default: null,
    },
    maxCapacityForPickup: {
      type: Number,
      default: null,
    },
    minTotalPax: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Schema.Types.Mixed,
      default: null,
    },
    endDate: {
      type: Schema.Types.Mixed,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    affectedStartTimes: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    appliesToAllStartTimes: {
      type: Boolean,
      default: false,
    },
    guidedLanguages: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    bom: {
      type: Schema.Types.Mixed,
      default: null,
    },
    guidedLangs: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "recurrences",
    timestamps: true,
  }
);

// --- Virtual for associated availabilities ---
recurrenceSchema.virtual("availabilities", {
  ref: "Availability",
  localField: "_id",
  foreignField: "recurrenceRuleIds",
});

recurrenceSchema.set("toJSON", { virtuals: true });
recurrenceSchema.set("toObject", { virtuals: true });

// --- Auto-increment index without using next() ---
recurrenceSchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "recurrence_index" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.index = counter.seq;
  }
});

const Recurrence = mongoose.model("Recurrence", recurrenceSchema);

module.exports = Recurrence;
