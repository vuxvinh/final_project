import React, { useEffect, useState } from "react";
import { Typography, Button, TextField, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserDetail({ loggedInUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");

  // friend state
  const [isFriend, setIsFriend] = useState(false);

  // edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const isMe = loggedInUser && String(loggedInUser._id) === String(userId);

  const loadUser = () => {
    setErr("");
    fetchModel(`/user/${userId}`)
      .then((u) => {
        setUser(u);
        setForm({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          location: u.location || "",
          description: u.description || "",
          occupation: u.occupation || "",
        });
      })
      .catch((e) => setErr(e.message));
  };

  const loadFriend = () => {
    if (!loggedInUser) return;
    if (isMe) return;
    fetchModel(`/friend/${userId}`)
      .then((r) => setIsFriend(!!r.isFriend))
      .catch(() => setIsFriend(false));
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    loadFriend();
    // eslint-disable-next-line
  }, [userId, loggedInUser]);

  const addFriend = () => {
    fetchModel(`/friend/${userId}`, { method: "POST" })
      .then(() => setIsFriend(true))
      .catch((e) => alert(e.message));
  };

  const removeFriend = () => {
    fetchModel(`/friend/${userId}`, { method: "DELETE" })
      .then(() => setIsFriend(false))
      .catch((e) => alert(e.message));
  };

  const saveProfile = () => {
    // required fields
    if (!form.first_name.trim() || !form.last_name.trim()) {
      alert("First name and last name are required");
      return;
    }

    fetchModel(`/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((u) => {
        setUser(u);
        setIsEditing(false);
      })
      .catch((e) => alert(e.message));
  };

  if (err) return <Typography color="error">{err}</Typography>;
  if (!user) return null;

  return (
    <div className="user-detail">
      <Typography variant="h5" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>

      {!isEditing ? (
        <>
          <Typography variant="body1">
            <b>Location:</b> {user.location || ""}
          </Typography>
          <Typography variant="body1">
            <b>Description:</b> {user.description || ""}
          </Typography>
          <Typography variant="body1">
            <b>Occupation:</b> {user.occupation || ""}
          </Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => navigate(`/photos/${userId}`)}>
              See Photos
            </Button>

            {isMe && (
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}

            {!isMe && loggedInUser && (
              <Button
                variant={isFriend ? "outlined" : "contained"}
                color={isFriend ? "error" : "primary"}
                onClick={isFriend ? removeFriend : addFriend}
              >
                {isFriend ? "Unfriend" : "Add Friend"}
              </Button>
            )}
          </Box>
        </>
      ) : (
        <>
          <TextField
            label="First name *"
            fullWidth
            sx={{ mt: 1 }}
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          />
          <TextField
            label="Last name *"
            fullWidth
            sx={{ mt: 1 }}
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
          <TextField
            label="Location"
            fullWidth
            sx={{ mt: 1 }}
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            sx={{ mt: 1 }}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <TextField
            label="Occupation"
            fullWidth
            sx={{ mt: 1 }}
            value={form.occupation}
            onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
          />

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={saveProfile}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Box>
        </>
      )}
    </div>
  );
}

export default UserDetail;