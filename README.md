# Network Device Dashboard

A full-stack web application for managing and monitoring network devices.

The dashboard allows users to add, edit, delete, search, filter, and check the health status of network devices from a simple web interface.

## Features

- Add network devices
- Edit existing devices
- Delete devices
- Search devices by:
  - Name
  - Hostname
  - IP address
  - VLAN
  - Device type
  - Location
- Filter devices by status
- Filter devices by device type
- View total devices
- View online and offline devices
- View device type statistics
- Check device health
- Automatically update device status
- Store device information in MongoDB
- REST API using Express.js
- Responsive dashboard interface

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

## Project Structure

```text
network-device-dashboard/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Device.js
│   ├── routes/
│   │   ├── deviceRoutes.js
│   │   └── healthRoutes.js
│   ├── app.js
│   └── package.json
│
└── README.md
| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| GET    | `/api/devices`     | Get all devices  |
| POST   | `/api/devices`     | Add a new device |
| PUT    | `/api/devices/:id` | Update a device  |
| DELETE | `/api/devices/:id` | Delete a device  |
1.Clone the repository
git clone https://github.com/seninjasime/network-device-dashboard.git
cd network-device-dashboard
2.Install frontend dependencies
cd client
npm install
3.install backend dependencies
cd server
npm install
4.Configure MongoDB
5.Start the backend
npm run dev
6. Start the frontend
npm run dev
7.Production Build
cd client
npm run build
