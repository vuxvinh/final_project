import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  TextField,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function Bubble({ value, color }) {
  return (
    <Box
      sx={{
        minWidth: 22,
        height: 22,
        borderRadius: "50%",
        backgroundColor: color,
        color: "white",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ml: 1,
      }}
    >
      {value}
    </Box>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const { userId } = useParams();

  useEffect(() => {
    fetchModel("/user/list")
      .then((data) => {
        setUsers(data || []);
        setErr("");
      })
      .catch((e) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      const login = String(u.login_name || "").toLowerCase();
      return name.includes(s) || login.includes(s);
    });
  }, [users, q]);

  return (
    <div className="user-list">
      <Typography variant="body1" className="user-list-title">
        Users
      </Typography>

      <TextField
        size="small"
        placeholder="Search users..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
      />

      {err && <Typography color="error">{err}</Typography>}

      <List component="nav">
        {filtered.map((u) => (
          <React.Fragment key={u._id}>
            <ListItem
              button
              component={Link}
              to={`/users/${u._id}`}
              selected={String(u._id) === String(userId)}
              sx={{ pl: 1 }}
            >
              <ListItemText
                primary={`${u.first_name} ${u.last_name}`}
                primaryTypographyProps={{ color: "primary" }}
              />

              <Bubble value={u.photo_count || 0} color="#2e7d32" />
              <Bubble value={u.comment_count || 0} color="#c62828" />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;