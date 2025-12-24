import React, { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

import TopBar from "./components/TopBar";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserPhotos from "./components/UserPhotos";
import Login from "./components/Login";
import Register from "./components/Register";
import fetchModel from "./lib/fetchModelData";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [advanced, setAdvanced] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // restore session
  useEffect(() => {
    fetchModel("/admin/session")
      .then((u) => setLoggedInUser(u))
      .catch(() => setLoggedInUser(null));
  }, []);

  const handleLoginSuccess = (u) => {
    setLoggedInUser(u);
    navigate(`/users/${u._id}`);
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
    if (!loggedInUser) return;

    const form = new FormData();
    form.append("photo", file);

    fetchModel("/photos/new", { method: "POST", body: form })
      .then(() => navigate(`/photos/${loggedInUser._id}`))
      .catch((e) => console.error(e));
  };

  const RequireAuth = ({ children }) => {
    if (!loggedInUser) return <Navigate to="/login" replace />;
    return children;
  };

  // detect auth pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div>
      <TopBar
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onUploadPhoto={handleUploadPhoto}
        advanced={advanced}
        onAdvancedChange={setAdvanced}
      />

      <div className="main-topbar-buffer" />

      {/* AUTH PAGES */}
      {isAuthPage ? (
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
          }}
        >
          <Routes>
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      ) : (
        /* APP PAGES */
        <Grid container spacing={2}>
          <Grid item xs={3} className="user-list-panel">
            <UserList loggedInUser={loggedInUser} />
          </Grid>

          <Grid item xs={9} className="main-content">
            <Routes>
              <Route
                path="/users/:userId"
                element={
                  <RequireAuth>
                    {/* truyền advanced để UserDetail có thể dùng nếu bạn muốn */}
                    <UserDetail loggedInUser={loggedInUser} advanced={advanced} />
                  </RequireAuth>
                }
              />

              {/* Normal */}
              <Route
                path="/photos/:userId"
                element={
                  <RequireAuth>
                    <UserPhotos loggedInUser={loggedInUser} advanced={advanced} />
                  </RequireAuth>
                }
              />

              {/* Advanced route: 1 ảnh cụ thể + next/prev */}
              <Route
                path="/photos/:userId/:photoId"
                element={
                  <RequireAuth>
                    <UserPhotos loggedInUser={loggedInUser} advanced={advanced} />
                  </RequireAuth>
                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to={loggedInUser ? `/users/${loggedInUser._id}` : "/login"}
                    replace
                  />
                }
              />
            </Routes>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default App;