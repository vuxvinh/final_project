import React, { useState } from "react";
import { Button, TextField, Typography, Paper, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function Login({ onLoginSuccess }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const login = () => {
    setErr("");

    if (!loginName.trim() || !password.trim()) {
      setErr("Login name and password are required");
      return;
    }

    fetchModel("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name: loginName.trim(), password }),
    })
      .then((u) => onLoginSuccess(u))
      .catch((e) => setErr(e.message));
  };

  return (
    <Paper style={{ padding: 20, maxWidth: 420 }}>
      <Typography variant="h6">Login</Typography>

      <TextField
        label="Login name *"
        fullWidth
        margin="normal"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
      />

      <TextField
        label="Password *"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {err && <Typography color="error">{err}</Typography>}

      <Button fullWidth variant="contained" onClick={login}>
        Login
      </Button>

      <Typography variant="body2" style={{ marginTop: 12 }}>
        Don’t have an account?{" "}
        <Link component="button" onClick={() => navigate("/register")}>
          Register here
        </Link>
      </Typography>
    </Paper>
  );
}

export default Login;
