// src/front/js/pages/AccountSettingsPage.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const AccountSettingsPage = () => {
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [cardInfo, setCardInfo] = useState("");

  useEffect(() => {
    const loadUserInfo = async () => {
      const res = await fetch(process.env.BACKEND_URL + "/api/account-info", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) setEmail(data.email);
    };
    loadUserInfo();
  }, []);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    const res = await fetch(process.env.BACKEND_URL + "/api/update-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ email }),
    });
    setMessage(res.ok ? "✅ Email updated" : "❌ Failed to update email");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }
    const res = await fetch(process.env.BACKEND_URL + "/api/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ current_password: password, new_password: newPassword }),
    });
    setMessage(res.ok ? "✅ Password updated" : "❌ Failed to update password");
  };

  const handleCardSave = (e) => {
    e.preventDefault();
    // Placeholder — integrate with Stripe later
    setMessage("💳 Card info saved (placeholder)");
  };

  return (
    <div className="container mt-4">
      <h2>Account Settings</h2>

      <form onSubmit={handleEmailChange} className="mb-4">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control mb-2"
        />
        <button className="btn btn-primary">Update Email</button>
      </form>

      <form onSubmit={handlePasswordChange} className="mb-4">
        <label>Current Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control mb-2"
        />
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="form-control mb-2"
        />
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-control mb-2"
        />
        <button className="btn btn-warning">Update Password</button>
      </form>

      <form onSubmit={handleCardSave} className="mb-4">
        <label>Card Info (placeholder):</label>
        <input
          type="text"
          value={cardInfo}
          onChange={(e) => setCardInfo(e.target.value)}
          className="form-control mb-2"
          placeholder="Card number or payment method"
        />
        <button className="btn btn-info">Save Card Info</button>
      </form>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default AccountSettingsPage;