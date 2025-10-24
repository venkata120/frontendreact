import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import JobList from "../pages/JobList";
import JobDetails from "../pages/JobDetails";
import StudentProfile from "../pages/StudentProfile";
import RecruiterProfile from "../pages/RecruiterProfile";
import AdminDashboard from "../pages/AdminDashboard";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
