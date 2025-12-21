import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function Register() {
  const [r, setR] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const register = () => {
    setErr("");
    setMsg("");

    if (r.password !== r.password2) {
      setErr("Passwords do not match");
      return;
    }

    fetchModel("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login_name: r.login_name,
        password: r.password,
        first_name: r.first_name,
        last_name: r.last_name,
      }),
    })
      .then(() => {
        setMsg("Register success. Please login.");
        setTimeout(() => navigate("/login"), 1000);
      })
      .catch((e) => setErr(e.message));
  };

  return (
    <Paper style={{ padding: 20, maxWidth: 420 }}>
      <Typography variant="h6">Register</Typography>

      <TextField
        label="Login name"
        fullWidth
        margin="normal"
        value={r.login_name}
        onChange={(e) => setR({ ...r, login_name: e.target.value })}
      />
      <TextField
        label="First name"
        fullWidth
        margin="normal"
        value={r.first_name}
        onChange={(e) => setR({ ...r, first_name: e.target.value })}
      />
      <TextField
        label="Last name"
        fullWidth
        margin="normal"
        value={r.last_name}
        onChange={(e) => setR({ ...r, last_name: e.target.value })}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={r.password}
        onChange={(e) => setR({ ...r, password: e.target.value })}
      />
      <TextField
        label="Confirm password"
        type="password"
        fullWidth
        margin="normal"
        value={r.password2}
        onChange={(e) => setR({ ...r, password2: e.target.value })}
      />

      {err && <Typography color="error">{err}</Typography>}
      {msg && <Typography color="primary">{msg}</Typography>}

      <Button fullWidth variant="contained" onClick={register}>
        Register Me
      </Button>

      <Typography variant="body2" style={{ marginTop: 12 }}>
        Already have an account?{" "}
        <Link component="button" onClick={() => navigate("/login")}>
          Login here
        </Link>
      </Typography>
    </Paper>
  );
}

export default Register;
