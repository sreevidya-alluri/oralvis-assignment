OralVis Dental Management System

Tech Stack Used: 

Frontend: 
React 19.1.1 (with Vite 7.1.2 for bundling)
React Router DOM 7.8.2 (for routing)
Axios (for API requests)
jsPDF (for generating PDF reports)
jwt-decode (for decoding JWT tokens)


Backend: 
Node.js 22.16.0
Express.js (web framework)
SQLite3 (database)
bcryptjs (password hashing)
jsonwebtoken (JWT authentication)
cors (CORS handling)
multer (file uploads)
cloudinary (image storage)


Hosting: Render (free tier for both frontend and backend)

Steps to Run the Project Locally
Prerequisites

Node.js (v18 or later recommended)
npm (comes with Node.js)
Git (for cloning the repository)

Setup

Clone the Repository
git clone [https://github.com/sreevidya-alluri/oralvis.git](https://github.com/sreevidya-alluri/oralvis-assignment)
cd oralvis


Backend Setup

Navigate to the backend directory:cd oralvis-backend 


Install dependencies:npm install


Create a .env file in the backend directory with the following variables:PORT=5000
JWT_SECRET=your-secure-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret


Start the backend server:node index.js


The backend should run on http://localhost:5000.


Frontend Setup

Navigate to the frontend directory:cd ../oralvis-frontend


Install dependencies:npm install


Create a .env file in the frontend directory with:VITE_API_URL=http://localhost:5000


Start the development server:npm run dev


Open http://localhost:5173 in your browser to view the app.


Testing

Register a new user (Technician or Dentist) on the Register page.
Log in and test the Technician (upload scans) and Dentist (view scans) dashboards.
Download a PDF report from the Dentist dashboard.



Screenshots

Register Page  
Login Page  
Technician Dashboard  
Dentist Dashboard

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1fa80e25-3ad1-49e1-9f5d-786c3e9b23a7" /> 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/43be92cf-c7f2-4a98-95cb-c8062dca1673" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5eca939b-4541-4e4f-ba5f-5e98ac3785fc" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9306352f-4f1f-4e5e-af18-b568f607eb23" />


Hosted Demo Link
Check out the live demo of the application here:https://oralvis-assignment.onrender.comBackend: https://oralvis-assignment-backend-sreevidya.onrender.com
