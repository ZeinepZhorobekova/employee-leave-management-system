
import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem(
          "user", JSON.stringify(data.user)
        );
        onLogin(data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>LeaveTrack</h1>
        <p>Employee Leave Management System</p>
        <h2>Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit">Sign In</button>
        </form>

        <small>Employee | Manager | Administrator</small>
      </div>
    </div>
  );
}
