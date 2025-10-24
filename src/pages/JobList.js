import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in first.");
          navigate("/");
          return;
        }

        const res = await axios.get("http://localhost:8081/api/job/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Map using your actual response structure!
        const mappedJobs = res.data
          .filter(job => job.jobId) // Only jobs with valid jobId
          .map(job => ({
            id: job.jobId,                    // unique key for React
            jobId: job.jobId,                 // for navigation and key
            jobTitle: job.title || job.designation,
            jobDescription: job.designation,  // or your description field
            experience: job.min_requirement || job.experience || "—",
            location: job.location || "—",
            company: job.companyName || "N/A" // if available in your data
          }));

        setJobs(mappedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (err.response && err.response.status === 403) {
          setError("Access denied. Please log in again.");
        } else if (err.code === "ERR_NETWORK") {
          setError("Backend not reachable. Please start your Spring Boot server.");
        } else {
          setError("Failed to load job list. Please try again later.");
        }
      }
    };

    fetchJobs();
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Jobs</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {jobs.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Experience</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={tdStyle}>{job.jobTitle || "—"}</td>
                <td style={tdStyle}>{job.jobDescription || "—"}</td>
                <td style={tdStyle}>{job.experience || "—"}</td>
                <td style={tdStyle}>{job.location || "—"}</td>
                <td style={tdStyle}>{job.company || "N/A"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate(`/job/${job.jobId}`)}
                    style={buttonStyle}
                    disabled={!job.jobId}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>Loading jobs...</p>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "#f0f0f0",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

export default JobList;
