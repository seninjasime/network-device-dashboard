const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

router.get("/:ip", (req, res) => {
  const { ip } = req.params;

  exec(
    `ping -c 1 -W 1000 ${ip}`,
    (error) => {
      if (error) {
        return res.json({
          ip,
          status: "Offline",
          message: "Device is unreachable",
        });
      }

      res.json({
        ip,
        status: "Online",
        message: "Device is reachable",
      });
    }
  );
});

module.exports = router;