
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "";

function App() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get leave requests from backend
  async function fetchLeaves() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/leaves`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Unable to load leave requests.");
      }

      setLeaves(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Submit a new leave request
  async function submitLeave(event) {
    event.preventDefault();

    if (!startDate || !endDate || endDate < startDate) {
      alert("Please enter valid leave dates.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee: "Demo Employee",
          type: leaveType,
          start: startDate,
          end: endDate,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Submission failed.");
      }

      await fetchLeaves();

      setShowForm(false);
      setStartDate("");
      setEndDate("");

      alert("Leave request submitted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const pending = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approved = leaves.filter(
    (leave) => leave.status === "Approved"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>LeaveTrack</h2>

        <p className="menu-title">MAIN MENU</p>

        <div className="menu active">Dashboard</div>
        <div className="menu">My Leave Requests</div>
        <div className="menu">Leave Balance</div>
        <div className="menu">Profile</div>

        <div className="sidebar-bottom">
          Employee Portal
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h2>Employee Dashboard</h2>
            <p>Welcome back! Manage your leave requests.</p>
          </div>

          <div className="user">Employee</div>
        </header>

        <section className="welcome">
          <h1>Welcome to LeaveTrack</h1>

          <p>
            Manage your leave applications and track
            your available leave balance.
          </p>

          <button onClick={() => setShowForm(true)}>
            + Apply for Leave
          </button>
        </section>

        <section className="stats">
          <div className="stat-card">
            <p>Annual Leave Balance</p>
            <h2>15 Days</h2>
          </div>

          <div className="stat-card">
            <p>Pending Requests</p>
            <h2>{pending}</h2>
          </div>

          <div className="stat-card">
            <p>Approved Requests</p>
            <h2>{approved}</h2>
          </div>

          <div className="stat-card">
            <p>Total Requests</p>
            <h2>{leaves.length}</h2>
          </div>
        </section>

        <section className="table-section">
          <h2>Recent Leave Requests</h2>

          {loading && <p>Loading leave requests...</p>}

          {error && (
            <p style={{ color: "red" }}>
              {error}
              <button onClick={fetchLeaves}>
                Retry
              </button>
            </p>
          )}

          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.employee}</td>
                    <td>{leave.type}</td>
                    <td>{leave.start}</td>
                    <td>{leave.end}</td>
                    <td>{leave.days}</td>
                    <td>
                      <span
                        className={`status ${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>

<td>
  {leave.status === "Pending" ? (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        style={{
          background: "#16a34a",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() =>
          updateLeaveStatus(leave.id, "Approved")
        }
      >
        Approve
      </button>

      <button
        style={{
          background: "#dc2626",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() =>
          updateLeaveStatus(leave.id, "Rejected")
        }
      >
        Reject
      </button>
    </div>
  ) : (
    <span>Completed</span>
  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {showForm && (
          <div className="modal">
            <form onSubmit={submitLeave}>
              <h2>Apply for Leave</h2>

              <label>Leave Type</label>

              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option>Annual Leave</option>
                <option>Sick Leave</option>
                <option>Personal Leave</option>
              </select>

              <label>Start Date</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <label>End Date</label>

              <input
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
