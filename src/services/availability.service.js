const { Availability, Recurrence } = require("../models"); // Mongoose models
const recurrenceService = require("./recurrence.service");
const productService = require("./product.service");

// Create Availability
const createAvailability = async (availabilityData) => {
  try {
    const newAvailability = await Availability.create(availabilityData);
    return newAvailability;
  } catch (error) {
    throw new Error(`Error creating availability: ${error.message}`);
  }
};

// Update Availability
const updateAvailability = async (id, availabilityData) => {
  try {
    const availability = await Availability.findById(id);

    if (!availability) return null;

    Object.assign(availability, availabilityData);
    await availability.save();

    return availability;
  } catch (error) {
    throw new Error(`Error updating availability: ${error.message}`);
  }
};

// Get Availability by ID
const getAvailabilityById = async (id) => {
  try {
    const availability = await Availability.findById(id)
      .populate("recurrenceRuleIds") // populate recurrence
      .lean();

    if (!availability) throw new Error("Availability not found");

    return availability;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all Availability with optional date filter
const getAllAvailability = async (startDate, endDate) => {
  try {
    const filter = { status: true };

    if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const availabilities = await Availability.find(filter)
      .populate("recurrenceRuleIds")
      .lean();

    // parse fields (time, date, dateAndTime, startTime)
    const parsedAvailabilities = availabilities.map((availability) => {
      ["time", "date", "dateAndTime", "startTime"].forEach((field) => {
        if (availability[field]) {
          availability[field] = availability[field];
        }
      });
      return availability;
    });

    return parsedAvailabilities;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete Availability by ID (soft delete)
const deleteAvailabilityById = async (id) => {
  try {
    const availability = await Availability.findById(id);
    if (!availability) throw new Error("Availability not found");

    availability.status = false;
    await availability.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete Availability by productId or recurrenceRuleIds
const deleteAvailability = async (productId, recurrenceRuleIds) => {
  try {
    const filter = {};

    if (Array.isArray(productId)) productId = productId[0];

    if (Array.isArray(recurrenceRuleIds) && recurrenceRuleIds.length > 0) {
      filter.recurrenceRuleIds = { $in: recurrenceRuleIds };
    } else if (productId) {
      filter.productId = productId;
    } else {
      throw new Error("Either recurrenceRuleIds or productId must be provided");
    }

    const result = await Availability.updateMany(filter, { status: false });
    console.log(`${result.modifiedCount} availability entries updated successfully`);
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw new Error(`Error deleting availability: ${error.message}`);
  }
};

// Delete Availability by recurrenceRuleIds
const deleteAvailabilityProductId = async (recurrenceRuleIds) => {
  try {
    const result = await Availability.deleteMany({ recurrenceRuleIds });
    return { message: "availability deleted successfully", deletedCount: result.deletedCount };
  } catch (error) {
    throw new Error(`Error deleting availability by product ID: ${error.message}`);
  }
};

// Get Availability by Product ID with optional date filter
const getAvailabilityByProductId = async (productId, startDate, endDate) => {
  console.log("this endpoint is calling")
  try {
    console.log("this try  is calling")
    const recurrenceForProductIds = await recurrenceService.getRecurrenceByProductId(productId);
    console.log("recurrenceForProductIds-------------------------",recurrenceForProductIds)
    const product = await productService.getProductById(productId);
    console.log("productAvailability---------------------------",product)

    if (!product) throw new Error("Product not found");

    const times = product.times;
    console.log("times-------------------------",times)
    const recurrenceController = require("../controllers/recurrence.controller");

    // generate availability for each recurrence
    const availabilities = await Promise.all(
      recurrenceForProductIds.map(async (recurrence) => {
        const recurrenceId = recurrence._id || recurrence.id;
        const data = recurrence;
        return await recurrenceController.createAvailabilityForRecurrence(data, times, recurrenceId);
      })
    );

    console.log("availabilities----------------------",availabilities)

    // flatten and filter by startDate/endDate
    const filteredAvailabilities = availabilities.flat().filter((availability) => {
      const availabilityDate = new Date(availability.date);
      if (startDate && endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return availabilityDate >= new Date(startDate) && availabilityDate <= endOfDay;
      } else if (startDate) {
        return availabilityDate >= new Date(startDate);
      } else if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return availabilityDate <= endOfDay;
      }
      return true;
    });

    console.log("filteredAvailabilities-------------------------------------------",filteredAvailabilities)

    if (!filteredAvailabilities.length)
      throw new Error("No availability found for the given product within the specified date range");

    return filteredAvailabilities;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createAvailability,
  updateAvailability,
  getAvailabilityById,
  getAllAvailability,
  deleteAvailabilityById,
  deleteAvailability,
  deleteAvailabilityProductId,
  getAvailabilityByProductId,
};
