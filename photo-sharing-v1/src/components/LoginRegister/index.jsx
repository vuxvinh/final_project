// import React, { useState } from "react";
// import { Button, TextField, Typography, Paper } from "@mui/material";
// import fetchModel from "../../lib/fetchModelData";

// function LoginRegister({ onLoginSuccess }) {
//   const [loginName, setLoginName] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState("");

//   const handleLogin = () => {
//     setErr("");
//     fetchModel("/admin/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ login_name: loginName, password }),
//     })
//       .then((data) => {
//         onLoginSuccess(data); // expects {_id, first_name}
//       })
//       .catch((e) => setErr(e.message));
//   };

//   return (
//     <Paper style={{ padding: 16 }}>
//       <Typography variant="h6">Login</Typography>

//       <TextField
//         label="Login name"
//         value={loginName}
//         onChange={(e) => setLoginName(e.target.value)}
//         fullWidth
//         margin="normal"
//       />

//       <TextField
//         label="Password"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         fullWidth
//         margin="normal"
//       />

//       {err ? <Typography color="error">{err}</Typography> : null}

//       <Button variant="contained" onClick={handleLogin} style={{ marginTop: 12 }}>
//         Login
//       </Button>

//       <Typography variant="body2" style={{ marginTop: 12 }}>
//         Registration added in Problem 4.
//       </Typography>
//     </Paper>
//   );
// }

// export default LoginRegister;

import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Link,
} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

function LoginRegister({ onLoginSuccess }) {
  /* ---------- LOGIN ---------- */
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  /* ---------- REGISTER ---------- */
  const [showRegister, setShowRegister] = useState(false);
  const [r, setR] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [regErr, setRegErr] = useState("");
  const [regMsg, setRegMsg] = useState("");

  const login = () => {
    setLoginErr("");
    fetchModel("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login_name: loginName,
        password,
      }),
    })
      .then((u) => onLoginSuccess(u))
      .catch((e) => setLoginErr(e.message));
  };

  const register = () => {
    setRegErr("");
    setRegMsg("");

    if (r.password !== r.password2) {
      setRegErr("Passwords do not match");
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
        setRegMsg("Register success. You can login now.");
        setShowRegister(false);
        setR({
          login_name: "",
          password: "",
          password2: "",
          first_name: "",
          last_name: "",
        });
      })
      .catch((e) => setRegErr(e.message));
  };

  return (
    <Paper style={{ padding: 20, maxWidth: 420 }}>
      {/* ================= LOGIN ================= */}
      <Typography variant="h6">Login</Typography>

      <TextField
        label="Login name"
        fullWidth
        margin="normal"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {loginErr && <Typography color="error">{loginErr}</Typography>}

      <Button fullWidth variant="contained" onClick={login}>
        Login
      </Button>

      {/* LINK REGISTER */}
      <Typography variant="body2" style={{ marginTop: 12 }}>
        Don’t have an account?{" "}
        <Link
          component="button"
          onClick={() => setShowRegister(true)}
        >
          Register here
        </Link>
      </Typography>

      {/* ================= REGISTER (HIDDEN BY DEFAULT) ================= */}
      {showRegister && (
        <>
          <Divider style={{ margin: "20px 0" }} />

          <Typography variant="h6">Register</Typography>

          <TextField
            label="Login name"
            fullWidth
            margin="normal"
            value={r.login_name}
            onChange={(e) =>
              setR({ ...r, login_name: e.target.value })
            }
          />
          <TextField
            label="First name"
            fullWidth
            margin="normal"
            value={r.first_name}
            onChange={(e) =>
              setR({ ...r, first_name: e.target.value })
            }
          />
          <TextField
            label="Last name"
            fullWidth
            margin="normal"
            value={r.last_name}
            onChange={(e) =>
              setR({ ...r, last_name: e.target.value })
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={r.password}
            onChange={(e) =>
              setR({ ...r, password: e.target.value })
            }
          />
          <TextField
            label="Confirm password"
            type="password"
            fullWidth
            margin="normal"
            value={r.password2}
            onChange={(e) =>
              setR({ ...r, password2: e.target.value })
            }
          />

          {regErr && <Typography color="error">{regErr}</Typography>}
          {regMsg && <Typography color="primary">{regMsg}</Typography>}

          <Button
            fullWidth
            variant="outlined"
            onClick={register}
          >
            Register Me
          </Button>
        </>
      )}
    </Paper>
  );
}

export default LoginRegister;

