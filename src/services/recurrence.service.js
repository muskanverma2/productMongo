const { Recurrence, Availability } = require('../models');

// Create a recurrence
const createRecurrence = async (data) => {
    try {
        const recurrence = await Recurrence.create(data);
        console.log('Successfully created Recurrence');
        return recurrence;
    } catch (error) {
        console.log('Error in createRecurrence:', error.message);
        throw new Error(error.message);
    }
};

// Update recurrence by ID
const updateRecurrenceById = async (id, updateData) => {
    try {
        const recurrence = await Recurrence.findById(id);
        if (!recurrence) {
            throw new Error('Recurrence not found');
        }

        Object.assign(recurrence, updateData); // Apply updates
        await recurrence.save();
        return recurrence;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get recurrence by ID
const getRecurrenceById = async (id) => {
    try {
        const recurrence = await Recurrence.findById(id).lean();
        if (!recurrence) {
            throw new Error('Recurrence not found');
        }
        return recurrence;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get all recurrences with status true
const getAllRecurrences = async () => {
    try {
        const recurrences = await Recurrence.find({ status: true }).lean();
        return recurrences;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Soft delete recurrence by ID and update related availability
const deleteRecurrenceById = async (id) => {
    try {
        const recurrence = await Recurrence.findById(id);
        if (!recurrence) {
            throw new Error('Recurrence not found');
        }

        recurrence.status = false;
        await recurrence.save();

        await Availability.updateMany(
            { recurrenceRuleIds: id },
            { status: false }
        );

        return recurrence;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete all recurrences by productId
const deleteRecurrenceByProductId = async (productId) => {
    try {
        const result = await Recurrence.deleteMany({ productId });
        return result.deletedCount; // Number of documents deleted
    } catch (error) {
        console.error('Error in recurrenceService:', error);
        throw error;
    }
};

// Get recurrences by productId with status true
const getRecurrenceByProductId = async (productId) => {
    try {
        const recurrences = await Recurrence.find({ productId, status: true }).lean();
        if (!recurrences || recurrences.length === 0) {
            throw new Error('RecurrenceProduct not found');
        }
        console.log("recurrences-----------------", recurrences);
        return recurrences;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createRecurrence,
    updateRecurrenceById,
    getRecurrenceById,
    getAllRecurrences,
    deleteRecurrenceById,
    deleteRecurrenceByProductId,
    getRecurrenceByProductId
};
