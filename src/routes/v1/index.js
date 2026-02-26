const express = require("express");
const router = express.Router();

const productRoute = require("./product.routes.js");
const gygAvailabilityRoute = require("./gygAvailability.route.js");
const availabilityRoute = require("./availability.route");
const recurrenceRoute = require("./recurrence.route");

const defaultRoutes = [
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/gygAvailability",
    route: gygAvailabilityRoute,
  },
  {
    path: "/availability",
    route: availabilityRoute,
  },
  {
    path: "/recurrence",
    route: recurrenceRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
