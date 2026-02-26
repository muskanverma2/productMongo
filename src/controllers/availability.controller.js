const { recurrenceService, availabilityService } = require("../services");

const createAvailability = async (req, res) => {
  try {
    const availabilityData = req.body;
    const result = await availabilityService.createAvailability(availabilityData);
    return res.status(201).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating availability", error: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availabilityData = req.body;

    const updatedAvailability = await availabilityService.updateAvailability(
      id,
      availabilityData
    );

    if (!updatedAvailability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    return res.status(200).json(updatedAvailability);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating availability", error: error.message });
  }
};

const getAvailabilityBy = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await availabilityService.getAvailabilityById(id);

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const availabilities = await availabilityService.getAllAvailability(
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    await availabilityService.deleteAvailabilityById(id);

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAvailabilityProductId = async (req, res) => {
  try {
    const { recurrenceRuleIds } = req.params;

    if (!recurrenceRuleIds) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    await availabilityService.deleteAvailabilityProductId(recurrenceRuleIds);

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getAvailabilityByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;

    const recurrence = await availabilityService.getAvailabilityByProductId(
      productId,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: "RecurrenceProductByProductId fetched successfully",
      data: recurrence,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAvailability,
  updateAvailability,
  getAvailabilityBy,
  getAllAvailability,
  deleteAvailability,
  deleteAvailabilityProductId,
  getAvailabilityByProductId,
};
