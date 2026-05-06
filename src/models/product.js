const mongoose = require("mongoose");
const { randomUUID } = require('crypto');
const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: null,
    },

    code: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      default: null,
    },

    identifier: {
      type: String,
      default: null,
    },

    productStatus: {
      type: String,
      default: null,
    },

    images: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    faq: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    destinations: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    types: {
      type: String,
      enum: ["Date_And_Time", "Only_Date", "Pass"],
      default: null,
    },

    experienceType: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    recurrencesId: {
      type: String,
      default: null,
    },

    supplierId: {
      type: String,
      default: null,
    },

    themes: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    startRequest: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    categories: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    videoLink: {
      type: String,
      default: null,
    },

    type2: {
      type: String,
      default: null,
    },

    capacityType: {
      type: String,
      enum: ["Unlimited", "Limited", "On Request"],
      default: null,
    },

    bookingCutOffTime: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    times: {
      type: mongoose.Schema.Types.Mixed,
      default: () => [
        {
          id: randomUUID(),
          startTime: "00:00",
          duration: "24",
          image: "https://via.placeholder.com/50",
          action: "Edit",
          isDisplay: false,
        },
      ],
    },

    salesStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    pickupPlaces: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    dropoffPlaces: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    locations: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    languagesTour: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    languages: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    cancellationPolicies: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    whatToBring: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    knowBeforeYouGo: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    route: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    tasks: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    ageRanges: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    exclusions: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    inclusions: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    resources: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    rates: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    product: {
      type: Boolean,
      default: true,
    },

    checkStatus: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },
    syncId: {
      type: String,
      unique: true,
      default: () => randomUUID(),
    },
  },
    {
    collection: "products",
    timestamps: true,
    strict: false,        
    strictQuery: false,     
  }

);

ProductSchema.virtual("availabilities", {
  ref: "Availability",     
  localField: "id",      
  foreignField: "productId", 
});

module.exports = mongoose.model("Product", ProductSchema);
