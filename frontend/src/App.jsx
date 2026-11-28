
import Login from "./Login";
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  };
}

function Dashboard({ user }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isEmployee = user.role === "Employee";
  const isManager = user.role === "Manager";
  const isAdmin = user.role === "Admin";

  async function fetchLeaves() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/leaves`, {
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load leave requests."
        );
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

  async function submitLeave(event) {
    event.preventDefault();

    if (!isEmployee) return;

    if (!startDate || !endDate || endDate < startDate) {
      alert("Please enter valid leave dates.");
      return;
    }

    const days =
      (new Date(endDate) - new Date(startDate)) / 86400000 + 1;

    if (leaveType === "Annual Leave" && days > remainingLeave) {
      alert("Insufficient annual leave balance.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/leaves`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employee: user.name,
          type: leaveType,
          start: startDate,
          end: endDate,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Submission failed.");
      }

      setShowForm(false);
      setStartDate("");
      setEndDate("");

      await fetchLeaves();

      alert("Leave request submitted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateLeaveStatus(id, status) {
    if (!isManager) return;

    try {
      setUpdating(id);

      const response = await fetch(
        `${API_URL}/api/leaves/${id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Update failed.");
      }

      await fetchLeaves();

      alert(`Leave request ${status.toLowerCase()} successfully!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const visibleLeaves = isEmployee
    ? leaves.filter((leave) => leave.employee === user.name)
    : leaves;

  const pending = visibleLeaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approved = visibleLeaves.filter(
    (leave) => leave.status === "Approved"
  ).length;

  const rejected = visibleLeaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  const annualLeaveAllowance = 15;

  const usedAnnualLeave = visibleLeaves
    .filter(
      (leave) =>
        leave.type === "Annual Leave" &&
        leave.status === "Approved"
    )
    .reduce((total, leave) => total + Number(leave.days), 0);

  const remainingLeave =
    annualLeaveAllowance - usedAnnualLeave;

  const filteredLeaves = visibleLeaves.filter((leave) => {
    const matchesSearch =
      `${leave.employee} ${leave.type} ${leave.status}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const menuItems = [
    "Dashboard",
    ...(isEmployee
      ? ["My Leave Requests", "Leave Balance"]
      : []),
    ...(isManager ? ["Leave Approvals"] : []),
    ...(isAdmin ? ["Leave Records"] : []),
    "Profile",
  ];

  const primaryButton = {
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  function navigate(page) {
    setActivePage(page);
    setSearch("");
    setStatusFilter("All");
    setShowForm(false);
  }

  function renderLeaveTable() {
    return (
      <section className="table-section">
        <h2>
          {isEmployee
            ? "My Leave Requests"
            : "Employee Leave Requests"}
        </h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            margin: "20px 0",
          }}
        >
          <input
            type="search"
            placeholder="Search leave requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            style={primaryButton}
            onClick={fetchLeaves}
          >
            Refresh
          </button>
        </div>

        {loading && <p>Loading leave requests...</p>}

        {error && (
          <div style={{ color: "red" }}>
            <p>{error}</p>
            <button onClick={fetchLeaves}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan={isManager ? 7 : 6}>
                      No leave requests found.
                    </td>
                  </tr>
                )}

                {filteredLeaves.map((leave) => (
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

                    {isManager && (
                      <td>
                        {leave.status === "Pending" ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              disabled={updating !== null}
                              style={{
                                ...primaryButton,
                                background: "#16a34a",
                                padding: "8px 12px",
                              }}
                              onClick={() =>
                                updateLeaveStatus(
                                  leave.id,
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              disabled={updating !== null}
                              style={{
                                ...primaryButton,
                                background: "#dc2626",
                                padding: "8px 12px",
                              }}
                              onClick={() =>
                                updateLeaveStatus(
                                  leave.id,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span>Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>LeaveTrack</h2>

        <p className="menu-title">MAIN MENU</p>

        {menuItems.map((page) => (
          <button
            key={page}
            type="button"
            className={`menu ${
              activePage === page ? "active" : ""
            }`}
            onClick={() => navigate(page)}
            aria-current={
              activePage === page ? "page" : undefined
            }
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              color: "white",
              border: "none",
              fontSize: "inherit",
              background:
                activePage === page
                  ? "#2563eb"
                  : "transparent",
              cursor: "pointer",
            }}
          >
            {page}
          </button>
        ))}

        <div className="sidebar-bottom">
          {user.role} Portal
        </div>
      </aside>

      <main className="main" style={{ minWidth: 0 }}>
        <header className="header">
          <div>
            <h2>
              {activePage === "Dashboard"
                ? `${user.role} Dashboard`
                : activePage}
            </h2>

            <p>
              {isEmployee &&
                "Manage your leave requests and balances."}

              {isManager &&
                "Review and manage employee leave requests."}

              {isAdmin &&
                "Monitor employee leave records."}
            </p>
          </div>

          <div className="user">{user.role}</div>
        </header>

        {/* DASHBOARD PAGE */}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome">
              <h1>Welcome, {user.name}</h1>

              <p>
                {isEmployee &&
                  "Apply for leave and track your request status."}

                {isManager &&
                  "Approve or reject employee leave requests."}

                {isAdmin &&
                  "Monitor organizational leave activity."}
              </p>

              {isEmployee && (
                <button
                  disabled={loading || Boolean(error)}
                  onClick={() => setShowForm(true)}
                >
                  + Apply for Leave
                </button>
              )}
            </section>

            <section className="stats">
              <div className="stat-card">
                <p>
                  {isEmployee
                    ? "Annual Leave Balance"
                    : "Rejected Requests"}
                </p>

                <h2>
                  {loading || error
                    ? "—"
                    : isEmployee
                    ? `${remainingLeave} Days`
                    : rejected}
                </h2>
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
                <h2>{visibleLeaves.length}</h2>
              </div>
            </section>

            {renderLeaveTable()}
          </>
        )}

        {/* MY LEAVE REQUESTS PAGE */}

        {activePage === "My Leave Requests" &&
          isEmployee && (
            <>
              <section className="welcome">
                <h1>My Leave Requests</h1>
                <p>View and track your leave history.</p>

                <button
                  disabled={loading || Boolean(error)}
                  onClick={() => setShowForm(true)}
                >
                  + Apply for Leave
                </button>
              </section>

              {renderLeaveTable()}
            </>
          )}

        {/* LEAVE BALANCE PAGE */}

        {activePage === "Leave Balance" && isEmployee && (
          <>
            <section className="welcome">
              <h1>Leave Balance</h1>
              <p>Track your annual leave entitlement.</p>
            </section>

            {loading ? (
              <p>Loading leave balance...</p>
            ) : error ? (
              <div>
                <p>{error}</p>
                <button onClick={fetchLeaves}>Retry</button>
              </div>
            ) : (
              <>
                <section className="stats">
                  <div className="stat-card">
                    <p>Total Annual Leave</p>
                    <h2>{annualLeaveAllowance} Days</h2>
                  </div>

                  <div className="stat-card">
                    <p>Used Annual Leave</p>
                    <h2>{usedAnnualLeave} Days</h2>
                  </div>

                  <div className="stat-card">
                    <p>Remaining Annual Leave</p>
                    <h2>{remainingLeave} Days</h2>
                  </div>
                </section>

                <section className="table-section">
                  <h2>Annual Leave Utilization</h2>

                  <div
                    style={{
                      background: "#e2e8f0",
                      borderRadius: "10px",
                      height: "25px",
                      overflow: "hidden",
                      margin: "25px 0",
                    }}
                  >
                    <div
                      style={{
                        background: "#2563eb",
                        height: "100%",
                        width: `${Math.min(
                          100,
                          (usedAnnualLeave /
                            annualLeaveAllowance) *
                            100
                        )}%`,
                      }}
                    />
                  </div>

                  <p>
                    {usedAnnualLeave} days used out of{" "}
                    {annualLeaveAllowance} days.
                  </p>

                  <p>
                    Only approved annual leave requests
                    are deducted from the balance.
                  </p>
                </section>
              </>
            )}
          </>
        )}

        {/* MANAGER APPROVALS PAGE */}

        {activePage === "Leave Approvals" && isManager && (
          <>
            <section className="welcome">
              <h1>Leave Approvals</h1>
              <p>
                Review, approve or reject employee requests.
              </p>
            </section>

            {renderLeaveTable()}
          </>
        )}

        {/* ADMIN RECORDS PAGE */}

        {activePage === "Leave Records" && isAdmin && (
          <>
            <section className="welcome">
              <h1>Leave Records</h1>
              <p>Monitor employee leave history.</p>
            </section>

            {renderLeaveTable()}
          </>
        )}

        {/* PROFILE PAGE */}

        {activePage === "Profile" && (
          <section className="table-section">
            <h2>My Profile</h2>

            <div
              style={{
                background: "#2563eb",
                color: "white",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "25px 0",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <table>
              <tbody>
                <tr>
                  <th>User ID</th>
                  <td>{user.id}</td>
                </tr>

                <tr>
                  <th>Full Name</th>
                  <td>{user.name}</td>
                </tr>

                <tr>
                  <th>Email Address</th>
                  <td>{user.email}</td>
                </tr>

                <tr>
                  <th>Account Role</th>
                  <td>{user.role}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* APPLY FOR LEAVE FORM */}

        {showForm && isEmployee && (
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

              {startDate &&
                endDate &&
                endDate >= startDate && (
                  <p>
                    Total Days:{" "}
                    {(new Date(endDate) -
                      new Date(startDate)) /
                      86400000 +
                      1}
                  </p>
                )}

              <button type="submit" disabled={submitting}>
                {submitting
                  ? "Submitting..."
                  : "Submit Request"}
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

function App() {
  const [user, setUser] = useState(() => {
    try {
      if (!sessionStorage.getItem("token")) {
        return null;
      }

      return JSON.parse(sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <div
        style={{
          background: "#0f172a",
          color: "white",
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          Welcome, {user.name} | {user.role}
        </span>

        <button
          onClick={logout}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <Dashboard key={user.id} user={user} />
    </>
  );
}

export default App;
