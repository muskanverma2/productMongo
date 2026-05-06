const { Recurrence, Availability } = require('../models');
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


const updateRecurrenceById = async (id, updateData) => {
    try {
        const recurrence = await Recurrence.findById(id);
        if (!recurrence) {
            throw new Error('Recurrence not found');
        }
        Object.assign(recurrence, updateData); 
        await recurrence.save();
        return recurrence;
    } catch (error) {
        throw new Error(error.message);
    }
};


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


const getAllRecurrences = async () => {
    try {
        const recurrences = await Recurrence.find({ status: true }).lean();
        return recurrences;
    } catch (error) {
        throw new Error(error.message);
    }
};


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

const deleteRecurrenceByProductId = async (productId) => {
    try {
        const result = await Recurrence.deleteMany({ productId });
        return result.deletedCount; 
    } catch (error) {
        console.error('Error in recurrenceService:', error);
        throw error;
    }
};


const getRecurrenceByProductId = async (productId) => {
    try {
        const recurrences = await Recurrence.find({ productId, status: true }).lean();
        if (!recurrences || recurrences.length === 0) {
            throw new Error('RecurrenceProduct not found');
        }
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
