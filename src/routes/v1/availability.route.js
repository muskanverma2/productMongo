const express = require('express');
const availabilityController = require('../../controllers/availability.controller.js');
const router = express.Router();

router.post('/', availabilityController.createAvailability);
router.put('/:id', availabilityController.updateAvailability);
router.get('/:id', availabilityController.getAvailabilityBy);
router.get('',availabilityController.getAllAvailability);
router.delete('/:id', availabilityController.deleteAvailability);
router.delete('/deleteAvailabilityProductId/:recurrenceRuleIds', availabilityController.deleteAvailabilityProductId);
router.get('/product/:productId',availabilityController.getAvailabilityByProductId)
module.exports = router;
