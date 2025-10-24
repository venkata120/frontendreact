import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", {
        email,
        password,
      });

      let token = "";

      // ✅ If backend sends plain string: "Bearer eyJ..."
      if (typeof res.data === "string" && res.data.startsWith("Bearer ")) {
        token = res.data.replace("Bearer ", "");
      }
      // ✅ If backend sends JSON: { token: "Bearer eyJ..." } or { jwt: "eyJ..." }
      else if (typeof res.data === "object") {
        token =
          res.data.token?.replace("Bearer ", "") ||
          res.data.jwt?.replace("Bearer ", "") ||
          "";
      }

      if (!token) {
        setMessage("⚠️ Invalid server response — token missing.");
        return;
      }

      // Save token
      localStorage.setItem("token", token);
      setMessage("✅ Login successful!");

      // Redirect
      navigate("/jobs");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.status === 403) {
        setMessage("❌ Invalid email or password.");
      } else if (err.code === "ERR_NETWORK") {
        setMessage("❌ Backend not reachable (check if Spring Boot is running).");
      } else {
        setMessage("❌ Login failed. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0 15px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0 15px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            color: message.includes("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;
