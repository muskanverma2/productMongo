const { recurrenceService, availabilityService, productService } = require('../services');
const { parse, addHours, format } = require('date-fns');
const moment = require('moment');
const { Worker } = require('worker_threads');
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const MYSQL_BASE_URL = "http://192.168.29.95:3000/kan/recurrence";



const getWeekdayIndex = (weekdayName) => {
    const date = new Date();
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
        date.setDate(date.getDate() - date.getDay() + i);
        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).slice(0, 2);
        weekdays.push(weekday);
    }
    return weekdays.indexOf(weekdayName);
};

function getWeekdayName(dayIndex) {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[dayIndex];
}



// const createRecurrence = async (req, res) => {
//     try {
//         const data = req.body;
//         const product = await productService.getProductById(data.productId);
//         if (!product) throw new Error('Product not found');

//         const times = product.times;
//         const recurrence = await recurrenceService.createRecurrence(data);
//         const availabilities = await createAvailabilityForRecurrence(data, times, recurrence._id);

//         return res.status(201).json({
//             success: true,
//             message: 'Recurrence and availability created successfully',
//             data: { recurrence, availabilities },
//         });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };



const createRecurrence = async (req, res) => {
  try {

    const data = { ...req.body };

    if (!data.syncId) {
      data.syncId = uuidv4();
    }

    // 🔥 Fetch product using incoming ID (UUID)
    const product = await productService.getProductById(data.productId);

    if (!product) throw new Error("Product not found");

    // ✅ CRITICAL FIX — use Mongo ObjectId internally
    data.productId = product._id;

    const times = product.times;

    const recurrence = await recurrenceService.createRecurrence(data);

    const recurrenceId = recurrence._id;
    const syncId = recurrence.syncId || data.syncId;

    const availabilities = await createAvailabilityForRecurrence(
      data,
      times,
      recurrenceId
    );

    const syncSource = req.headers["x-sync-source"] || "mongo";
    const mysqlSyncEnabled = Boolean(MYSQL_BASE_URL);

    const shouldSyncToMysql =
      mysqlSyncEnabled && syncSource !== "mysql" && recurrenceId;

    if (shouldSyncToMysql) {
      try {
        await axios.post(
          MYSQL_BASE_URL,
          {
            ...data,
            syncId,
            mongoRecurrenceId: recurrenceId,
            availabilities,
          },
          { headers: { "x-sync-source": "mongo" } }
        );

        console.log("✅ Recurrence + Availability synced to MySQL successfully");

      } catch (mysqlErr) {
        console.error(
          "❌ MySQL sync error (recurrence create):",
          mysqlErr.response?.data || mysqlErr.message
        );
      }

    } else {
      if (!mysqlSyncEnabled) {
        console.log("Skipping Mongo → MySQL sync (MYSQL_BASE_URL not set)");
      } else if (syncSource === "mysql") {
        console.log("Skipping Mongo → MySQL sync (request came from MySQL)");
      } else {
        console.log("Skipping Mongo → MySQL sync (missing recurrenceId)");
      }
    }

    return res.status(201).json({
      success: true,
      message: "Recurrence and availability created successfully",
      data: { recurrence, availabilities },
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// --- Availability Creation for Recurrence ---
 
const createAvailabilityForRecurrence = async (data, times, recurrenceId) => {
console.log("muskanone")
    let availabilities = [];

    if (['FIXED_DATE', 'DATE_RANGE'].includes(data.type)) {
        const { productId, bom, appliesToAllStartTimes, affectedStartTimes } = data;
        const { dtStart, until, byWeekday } = bom;
        const startDate = new Date(dtStart);
        const endDate = new Date(until);
        const availabilityPromises = [];

        if (data.type === 'DATE_RANGE') {
            const daysToCreate = [];
            console.log("muskanone222222222222222222222222222")
            if (!Array.isArray(byWeekday)) {
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    daysToCreate.push(new Date(d));
                }
            } else {
                const targetWeekdays = byWeekday.map(day => getWeekdayIndex(day));
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    if (targetWeekdays.includes(d.getDay())) daysToCreate.push(new Date(d));
                }
            }

            for (const date of daysToCreate) {
                if (appliesToAllStartTimes) {
                    times.forEach(timeSlot => availabilityPromises.push(createAvailabilityForTimeSlot(timeSlot, date, recurrenceId, productId, data)));
                } else {
                    affectedStartTimes.forEach(startTimeId => {
                        const slot = times.find(t => t.id === startTimeId);
                        if (slot) availabilityPromises.push(createAvailabilityForTimeSlot(slot, date, recurrenceId, productId, data));
                    });
                }
            }
        } else if (data.type === 'FIXED_DATE') {
            console.log("muskanone99999999999999999999999999999999999")
            if (appliesToAllStartTimes) {
                times.forEach(timeSlot => availabilityPromises.push(createAvailabilityForTimeSlot(timeSlot, startDate, recurrenceId, productId, data)));
            } else {
                affectedStartTimes.forEach(startTimeId => {
                    const slot = times.find(t => t.id === startTimeId);
                    if (slot) availabilityPromises.push(createAvailabilityForTimeSlot(slot, startDate, recurrenceId, productId, data));
                });
            }
        }

        availabilities = await Promise.all(availabilityPromises);
    }

    else if (data.type === 'MONTHLY') {
        console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
        const { productId, bom, appliesToAllStartTimes, affectedStartTimes } = data;
        const { byMonth, byWeekday } = bom;
        const currentYear = new Date().getFullYear();
        const yearsToProcess = [currentYear, currentYear + 1];
        const monthsToProcess = byMonth.map(({ value }) => new Date(`${value} 1, ${currentYear}`).getMonth());
        const targetWeekdays = byWeekday.map(day => getWeekdayIndex(day));
        const availabilityPromises = [];

        yearsToProcess.forEach(year => {
            monthsToProcess.forEach(monthIndex => {
                const firstDay = new Date(year, monthIndex, 1);
                const lastDay = new Date(year, monthIndex + 1, 0);
                for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                    if (targetWeekdays.includes(d.getDay())) {
                        if (appliesToAllStartTimes) {
                            times.forEach(timeSlot => availabilityPromises.push(createAvailabilityForTimeSlot(timeSlot, d, recurrenceId, productId, data)));
                        } else {
                            affectedStartTimes.forEach(startTimeId => {
                                const slot = times.find(t => t.id === startTimeId);
                                if (slot) availabilityPromises.push(createAvailabilityForTimeSlot(slot, d, recurrenceId, productId, data));
                            });
                        }
                    }
                }
            });
        });

        availabilities = await Promise.all(availabilityPromises);
    }

    else if (data.type === 'WEEKLY') {
        const { productId, bom, appliesToAllStartTimes, affectedStartTimes } = data;
        const { dtStart, until, byWeekday } = bom;
        const targetWeekdays = byWeekday.map(day => getWeekdayIndex(day));
        let startDate = new Date();
        let endDate = until ? new Date(until) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate.getTime())) startDate = new Date();
        if (isNaN(endDate.getTime())) endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        const availabilityPromises = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (targetWeekdays.includes(d.getDay())) {
                if (appliesToAllStartTimes) {
                    times.forEach(timeSlot => availabilityPromises.push(createAvailabilityForTimeSlot(timeSlot, d, recurrenceId, productId, data)));
                } else {
                    affectedStartTimes.forEach(startTimeId => {
                        const slot = times.find(t => t.id === startTimeId);
                        if (slot) availabilityPromises.push(createAvailabilityForTimeSlot(slot, d, recurrenceId, productId, data));
                    });
                }
            }
        }
        availabilities = await Promise.all(availabilityPromises);
    }

    return availabilities.filter(item => Object.keys(item).length > 0);
};

// --- Availability by TimeSlot ---
const createAvailabilityForTimeSlot = async (timeSlot, date, recurrenceId, productId, data) => {
    const { startTime, duration } = timeSlot;
    const { color, minTotalPax, maxCapacity, maxCapacityForPickup } = data;
    const endTime = calculateEndTime(startTime, duration);
    const dateString = date instanceof Date ? date.toISOString() : null;
    if (!dateString) return {};

    const datePart = dateString.split('T')[0];
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const startDateAndTimeD = moment(datePart).set({
        hour: parseInt(formattedStartTime.split(':')[0], 10),
        minute: parseInt(formattedStartTime.split(':')[1], 10),
        second: 0,
        millisecond: 0
    }).toISOString();

    const endDateAndTimeD = moment(datePart).set({
        hour: parseInt(formattedEndTime.split(':')[0], 10),
        minute: parseInt(formattedEndTime.split(':')[1], 10),
        second: 0,
        millisecond: 0
    }).toISOString();

    // Create availability in Mongo
    const availability = await availabilityService.createAvailability({
        startTime: formattedStartTime,
        time: { startTime: formattedStartTime, endTime: formattedEndTime },
        date: date.toISOString(),
        recurrenceRuleIds: recurrenceId,
        productId,
        dateAndTime: { startDateAndTime: startDateAndTimeD, endDateAndTime: endDateAndTimeD },
        color,
        minTotalPax,
        maxCapacity,
        maxCapacityForPickup,
    });

    return availability.toObject();
};

// --- Helpers ---
const formatTime = (time) => time.slice(0, 5);
const calculateEndTime = (startTime, duration) => {
    const parsedStartTime = parse(startTime, 'HH:mm', new Date());
    const endTime = addHours(parsedStartTime, parseInt(duration, 10));
    return format(endTime, 'HH:mm');
};

// --- Other CRUD Controllers ---
const updateRecurrence = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingRecurrence = await recurrenceService.getRecurrenceById(id);
        if (!existingRecurrence) return res.status(404).json({ success: false, message: 'Recurrence not found' });

        let availabilityData = null;
        const shouldUpdateAvailability = ['productId', 'type', 'bom', 'affectedStartTimes', 'appliesToAllStartTimes']
            .some(key => updateData[key] !== undefined && updateData[key] !== existingRecurrence[key]);

        if (shouldUpdateAvailability) {
            const product = await productService.getProductById(updateData.productId);
            if (!product) throw new Error('Product not found');

            const times = product.times;
            availabilityData = await createAvailabilityForRecurrence(updateData, times, id);
        }

        const updatedRecurrence = await recurrenceService.updateRecurrenceById(id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Recurrence updated successfully',
            data: { updatedRecurrence, availabilityData },
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getRecurrenceBy = async (req, res) => {
    try {
        const recurrence = await recurrenceService.getRecurrenceById(req.params.id);
        return res.status(200).json({ success: true, message: 'Recurrence fetched successfully', data: recurrence });
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const getAllRecurrence = async (req, res) => {
    try {
        const recurrences = await recurrenceService.getAllRecurrences();
        return res.status(200).json({ success: true, message: 'All recurrences fetched successfully', data: recurrences });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRecurrence = async (req, res) => {
    try {
        const result = await recurrenceService.deleteRecurrenceById(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRecurrenceByProductId = async (req, res) => {
    try {
        const result = await recurrenceService.deleteRecurrenceByProductId(req.params.productId);
        if (result) return res.status(200).json({ message: 'Recurrence data deleted successfully', deletedCount: result });
        return res.status(404).json({ message: 'No recurrence data found for the given product ID' });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting recurrence data', error: error.message });
    }
};

const getRecurrenceByProductId = async (req, res) => {
    try {
        const recurrence = await recurrenceService.getRecurrenceByProductId(req.params.productId);
        return res.status(200).json({ success: true, message: 'RecurrenceProductByProductId fetched successfully', data: recurrence });
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

module.exports = {
    createRecurrence,
    updateRecurrence,
    getRecurrenceBy,
    getAllRecurrence,
    deleteRecurrence,
    createAvailabilityForTimeSlot,
    calculateEndTime,
    createAvailabilityForRecurrence,
    deleteRecurrenceByProductId,
    getRecurrenceByProductId
};

