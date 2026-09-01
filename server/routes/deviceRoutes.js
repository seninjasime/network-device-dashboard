const express = require("express");
const router = express.Router();

const Device = require("../models/Device");

// GET all devices
router.get("/", async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new device
router.post("/", async (req, res) => {
  try {
    const device = new Device(req.body);
    const savedDevice = await device.save();

    res.status(201).json(savedDevice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update device
router.put("/:id", async (req, res) => {
  try {
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json(updatedDevice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE device
router.delete("/:id", async (req, res) => {
  try {
    const deletedDevice = await Device.findByIdAndDelete(req.params.id);

    if (!deletedDevice) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;