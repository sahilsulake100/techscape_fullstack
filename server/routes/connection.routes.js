const express = require("express");
const router = express.Router();
const {
  sendRequest,
  getStatus,
  getPending,
  updateStatus,
  getAccepted,
} = require("../controllers/connection.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", sendRequest);
router.get("/status", getStatus);
router.get("/pending/:uid", getPending);
router.put("/:id", updateStatus);
router.get("/accepted/:uid", getAccepted);

module.exports = router;
