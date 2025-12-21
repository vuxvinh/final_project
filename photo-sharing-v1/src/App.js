// import './App.css';

// import React from "react";
// import { Grid, Typography, Paper } from "@mui/material";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import TopBar from "./components/TopBar";
// import UserDetail from "./components/UserDetail";
// import UserList from "./components/UserList";
// import UserPhotos from "./components/UserPhotos";

// const App = (props) => {
//   return (
//       <Router>
//         <div>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <TopBar />
//             </Grid>
//             <div className="main-topbar-buffer" />
//             <Grid item sm={3}>
//               <Paper className="main-grid-item">
//                 <UserList />
//               </Paper>
//             </Grid>
//             <Grid item sm={9}>
//               <Paper className="main-grid-item">
//                 <Routes>
//                   <Route
//                       path="/users/:userId"
//                       element = {<UserDetail />}
//                   />
//                   <Route
//                       path="/photos/:userId"
//                       element = {<UserPhotos />}
//                   />
//                   <Route path="/users" element={<UserList />} />
//                 </Routes>
//               </Paper>
//             </Grid>
//           </Grid>
//         </div>
//       </Router>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserPhotos from "./components/UserPhotos";
import Login from "./components/Login";
import Register from "./components/Register";
import fetchModel from "./lib/fetchModelData";

import "./App.css";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // restore session nếu refresh
  useEffect(() => {
    fetchModel("/admin/session")
      .then((u) => setLoggedInUser(u))
      .catch(() => {
        setLoggedInUser(null);
        navigate("/login", { replace: true });
      });
    // eslint-disable-next-line
  }, []);

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    navigate(`/users/${user._id}`);
  };

  const handleLogout = () => {
    fetchModel("/admin/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        setLoggedInUser(null);
        navigate("/login");
      });
  };

  const handleUploadPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  fetchModel("/photos/new", {
    method: "POST",
    body: formData,
  })
    .then(() => {
      if (loggedInUser?._id) navigate(`/photos/${loggedInUser._id}`);
    })
    .catch((err) => console.error(err));
  };


  const RequireAuth = ({ children }) => {
    if (!loggedInUser) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <div>
      <TopBar
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onUploadPhoto={handleUploadPhoto}
      />

      <div className="main-topbar-buffer" />

      <Grid container spacing={2}>
        <Grid item xs={3}>
          {loggedInUser ? <UserList loggedInUser={loggedInUser} /> : null}
        </Grid>

        <Grid item xs={9} className="main-content">
          <Routes>
            {/* LOGIN */}
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />

            {/* REGISTER */}
            <Route path="/register" element={<Register />} />

            {/* USER DETAIL */}
            <Route
              path="/users/:userId"
              element={
                <RequireAuth>
                  <UserDetail />
                </RequireAuth>
              }
            />

            {/* USER PHOTOS */}
            <Route
              path="/photos/:userId"
              element={
                <RequireAuth>
                  <UserPhotos loggedInUser={loggedInUser} />
                </RequireAuth>
              }
            />

            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
