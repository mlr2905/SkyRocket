
<div id="header" align="center">
  

<h2>
 The git of :
 Michael Rozental
</h2>
</div>
<div align="center">
  <img src="https://media.giphy.com/media/dWesBcTLavkZuG35MI/giphy.gif" width="600" height="300"/>
</div>

---

:man_technologist: 
About Me :Full Stack Developer  from Israel.<img src="https://media.giphy.com/media/WUlplcMpOCEmTGBtBW/giphy.gif" width="70">

---


<div>
  <img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-original.svg" title="HTML5" alt="HTML" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-plain-wordmark.svg"  title="CSS3" alt="CSS" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/bootstrap/bootstrap-original-wordmark.svg" title="Bootstrap" alt="Bootstrap" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/jquery/jquery-original-wordmark.svg" title="jQuery" alt="jQuery" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/react/react-original-wordmark.svg" title="React" alt="React" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/typescript/typescript-original.svg" title="TypesCript" alt="TypesCript" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/mysql/mysql-original-wordmark.svg" title="MySQL"  alt="MySQL" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/postgresql/postgresql-original-wordmark.svg" title="PostgreSQL"  alt="PostgreSQL" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-plain-wordmark.svg" title="mongodb"  alt="mongoDb" width="40" height="40"/>&nbsp;

# SkyRocket

## 📋 Project Description
SkyRocket is a web-based project designed to provide an innovative solution in the flight booking and aviation services sector. The system offers a smooth and intuitive user experience while maintaining a high level of security and ensuring fast performance.

## 🛠️ Technologies
The system is built using leading industry technologies:

### Backend
- Node.js / Express.js 
- MongoDB
- JWT for authentication
- RESTful API
- Middlewares for security and logging

### Frontend
- React.js
- Redux for state management
- Material-UI / Bootstrap for design
- Axios for API communication

## 🚀 Installation & Setup

### Prerequisites
- Node.js (version 14.0.0 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/mlr2905/SkyRocket.git
cd SkyRocket
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Set up environment variables:
   Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skyrocket
JWT_SECRET=your_secret_key
```

5. Start the server:
```bash
cd ../server
npm start
```

6. Start the client in a separate terminal:
```bash
cd ../client
npm start
```

7. Open your browser at `http://localhost:3000`

## 📊 Project Structure

```
SkyRocket/
├── client/                  # Client-side code
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   │   ├── components/      # Shared components
│   │   ├── pages/           # Pages
│   │   ├── redux/           # Redux state management
│   │   ├── services/        # API services
│   │   ├── utils/           # Helper functions
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   └── package.json         # Client dependencies
│
├── server/                  # Server-side code
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Middleware
│   ├── models/              # Database models
│   ├── routes/              # API route definitions
│   ├── utils/               # Utility functions
│   ├── app.js               # Express application
│   ├── server.js            # Server setup
│   └── package.json         # Server dependencies
│
├── docs/                    # Documentation
├── .gitignore               # Git ignore file
└── README.md                # This README file
```

## 🔍 Key Features

- **Flight Search**: Advanced search engine allowing users to find flights according to dates, destinations, and budget
- **Flight Booking**: Simple and clear booking process
- **User Management**: Registration, login, and profile management
- **Booking History**: Track past and upcoming bookings
- **Notifications**: Real-time updates about flight changes
- **Admin Interface**: For managing flights and users (for system administrators)

## 📬 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get logged in user profile

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/:id` - Get specific flight information
- `GET /api/flights/search` - Search flights by criteria
- `POST /api/flights` (Admin) - Add new flight
- `PUT /api/flights/:id` (Admin) - Update flight details
- `DELETE /api/flights/:id` (Admin) - Delete flight

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all user bookings
- `GET /api/bookings/:id` - Get specific booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 👨‍💻 Development & Contribution

We welcome contributions to the project! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## 📝 Additional Documentation

For more detailed documentation, visit the `docs/` directory or the repository's Wiki page.

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 👤 About

Developed by a Full Stack Developer from Israel.

---

Made with ❤️ by Michael Rozental
