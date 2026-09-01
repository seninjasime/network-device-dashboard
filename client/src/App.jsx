import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api/devices";
const HEALTH_URL = "http://localhost:3000/api/health";

const emptyForm = {
  name: "",
  hostname: "",
  ipAddress: "",
  deviceType: "Router",
  location: "",
  vlan: "",
  status: "Unknown",
  notes: "",
};

function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // =========================
  // GET ALL DEVICES
  // =========================

  const fetchDevices = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }

      const data = await response.json();

      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // =========================
  // FORM INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD / UPDATE DEVICE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      vlan: formData.vlan
        ? Number(formData.vlan)
        : undefined,
    };

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Request failed"
        );
      }

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchDevices();
    } catch (error) {
      alert(error.message);
    }
  };

  // =========================
  // EDIT DEVICE
  // =========================

  const handleEdit = (device) => {
    setEditingId(device._id);

    setFormData({
      name: device.name || "",
      hostname: device.hostname || "",
      ipAddress: device.ipAddress || "",
      deviceType: device.deviceType || "Router",
      location: device.location || "",
      vlan: device.vlan ?? "",
      status: device.status || "Unknown",
      notes: device.notes || "",
    });

    setShowForm(true);
  };

  // =========================
  // DELETE DEVICE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this device?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Delete failed"
        );
      }

      await fetchDevices();
    } catch (error) {
      alert(error.message);
    }
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // =========================
  // CHECK ONE DEVICE
  // =========================

  const checkDeviceHealth = async (device) => {
    try {
      const response = await fetch(
        `${HEALTH_URL}/${device.ipAddress}`
      );

      if (!response.ok) {
        return "Offline";
      }

      const data = await response.json();

      return data.status || "Unknown";
    } catch (error) {
      return "Offline";
    }
  };

  // =========================
  // CHECK ALL DEVICES
  // =========================
const refreshDeviceHealth = async () => {
  if (
    isCheckingHealth ||
    devices.length === 0
  ) {
    return;
  }

  setIsCheckingHealth(true);

  try {
    const updatedDevices = await Promise.all(
      devices.map(async (device) => {
        const healthStatus =
          await checkDeviceHealth(device);

        // ...
      })
    );

    setDevices(updatedDevices);
    setLastChecked(new Date());
  } finally {
    setIsCheckingHealth(false);
  }
};
  

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredDevices = devices.filter(
    (device) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        (device.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (device.hostname || "")
          .toLowerCase()
          .includes(searchText) ||
        (device.ipAddress || "")
          .toLowerCase()
          .includes(searchText) ||
        (device.deviceType || "")
          .toLowerCase()
          .includes(searchText) ||
        (device.location || "")
          .toLowerCase()
          .includes(searchText) ||
        String(
          device.vlan ?? ""
        ).includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        device.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        device.deviceType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    }
  );

  // =========================
  // STATISTICS
  // =========================

  const onlineDevices = devices.filter(
    (device) =>
      device.status === "Online"
  ).length;

  const offlineDevices = devices.filter(
    (device) =>
      device.status === "Offline"
  ).length;

  const unknownDevices = devices.filter(
    (device) =>
      device.status === "Unknown"
  ).length;

  // =========================
  // DEVICE TYPE COUNTS
  // =========================

  const deviceTypeCounts =
    devices.reduce(
      (counts, device) => {
        const type =
          device.deviceType || "Unknown";

        counts[type] =
          (counts[type] || 0) + 1;

        return counts;
      },
      {}
    );

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>
            Network Device Dashboard
          </h1>

          <p>
            Monitor and manage your network
            infrastructure
          </p>
        </div>

        <div className="header-buttons">

          <button
            className="add-button"
            onClick={refreshDeviceHealth}
            disabled={isCheckingHealth}
          >
            {isCheckingHealth
              ? "Checking..."
              : "Check Device Health"}
          </button>

          <button
            className="add-button"
            onClick={() => {
              if (showForm) {
                closeForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm
              ? "Close Form"
              : "+ Add Device"}
          </button>

        </div>

      </header>

      {/* ================= FORM ================= */}

      {showForm && (
        <section className="form-section">

          <h2>
            {editingId
              ? "Edit Network Device"
              : "Add Network Device"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="device-form"
          >

            <div className="form-group">
              <label>
                Device Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Hostname
              </label>

              <input
                name="hostname"
                value={formData.hostname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                IP Address
              </label>

              <input
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Device Type
              </label>

              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
              >
                <option value="Router">
                  Router
                </option>

                <option value="Switch">
                  Switch
                </option>

                <option value="Server">
                  Server
                </option>

                <option value="Firewall">
                  Firewall
                </option>

                <option value="Access Point">
                  Access Point
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Location
              </label>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                VLAN
              </label>

              <input
                type="number"
                name="vlan"
                value={formData.vlan}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Unknown">
                  Unknown
                </option>

                <option value="Online">
                  Online
                </option>

                <option value="Offline">
                  Offline
                </option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="save-button"
              >
                {editingId
                  ? "Update Device"
                  : "Add Device"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      )}

      {/* ================= STATISTICS ================= */}

      <section className="stats">

        <div className="stat-card">
          <span>
            Total Devices
          </span>

          <strong>
            {devices.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Online
          </span>

          <strong>
            {onlineDevices}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Offline
          </span>

          <strong>
            {offlineDevices}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Unknown
          </span>

          <strong>
            {unknownDevices}
          </strong>
        </div>

      </section>

      {/* ================= DEVICE TYPES ================= */}

      <section className="type-section">

        <div className="section-header">
          <h2>
            Device Types
          </h2>
        </div>

        <div className="type-grid">

          {Object.entries(
            deviceTypeCounts
          ).map(([type, count]) => (

            <div
              className="type-card"
              key={type}
            >

              <span>
                {type}
              </span>

              <strong>
                {count}
              </strong>

            </div>

          ))}

        </div>

      </section>

      {/* ================= DEVICES ================= */}

      <section className="devices-section">

        <div className="section-header">

          <div>
            <h2>
              Network Devices
            </h2>

            {lastChecked && (
              <span>
                Last checked:{" "}
                {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>

          <span>
            Showing{" "}
            {filteredDevices.length}{" "}
            of{" "}
            {devices.length}
          </span>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="filters">

          <input
            type="text"
            placeholder="Search name, hostname, IP, VLAN..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Online">
              Online
            </option>

            <option value="Offline">
              Offline
            </option>

            <option value="Unknown">
              Unknown
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="All">
              All Types
            </option>

            <option value="Router">
              Router
            </option>

            <option value="Switch">
              Switch
            </option>

            <option value="Server">
              Server
            </option>

            <option value="Firewall">
              Firewall
            </option>

            <option value="Access Point">
              Access Point
            </option>
          </select>

        </div>

        {/* ================= DEVICE CARDS ================= */}

        <div className="device-grid">

          {filteredDevices.map(
            (device) => (

              <div
                className="device-card"
                key={device._id}
              >

                <div className="device-top">

                  <h3>
                    {device.name}
                  </h3>

                  <span
                    className={`status ${
                      device.status === "Online"
                        ? "online"
                        : device.status === "Offline"
                        ? "offline"
                        : "unknown"
                    }`}
                  >
                    {device.status}
                  </span>

                </div>

                <div className="device-info">

                  <p>
                    <strong>
                      Hostname:
                    </strong>{" "}
                    {device.hostname}
                  </p>

                  <p>
                    <strong>
                      IP Address:
                    </strong>{" "}
                    {device.ipAddress}
                  </p>

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    {device.deviceType}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {device.location}
                  </p>

                  <p>
                    <strong>
                      VLAN:
                    </strong>{" "}
                    {device.vlan ?? "N/A"}
                  </p>

                  {device.notes && (
                    <p>
                      <strong>
                        Notes:
                      </strong>{" "}
                      {device.notes}
                    </p>
                  )}

                </div>

                <div className="device-actions">

                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(device)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(
                        device._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

        {filteredDevices.length === 0 && (
          <div className="empty">
            No devices found.
          </div>
        )}

      </section>

    </div>
  );
}

export default App;