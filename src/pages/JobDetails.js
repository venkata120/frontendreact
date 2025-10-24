import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams(); // jobId from URL
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch job details
  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/job/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => setMessage("Failed to load job details."));
  }, [id]);

  const handleApply = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in before applying.");
        return;
      }

      await axios.post(
        `http://localhost:8081/api/job/apply/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Applied successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to apply. Maybe you already applied or are not a student.");
    }
  };

  if (!job) return <p>Loading job details...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{job.title}</h2>
      <p><strong>Designation:</strong> {job.designation}</p>
      <p><strong>Experience Type:</strong> {job.experienceType}</p>
      <p><strong>Company:</strong> {job.companyName}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Description:</strong> {job.description}</p>

      <button
        onClick={handleApply}
        style={{
          background: "green",
          color: "white",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Apply
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

export default JobDetails;
