const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        hostname: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        ipAddress: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        deviceType: {
            type: String,
            required: true,
            enum: [
                "Router",
                "Switch",
                "Server",
                "Firewall",
                "Access Point"
            ]
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        vlan: {
            type: Number
        },

        status: {
            type: String,
            enum: ["Online", "Offline", "Unknown"],
            default: "Unknown"
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Device", deviceSchema);