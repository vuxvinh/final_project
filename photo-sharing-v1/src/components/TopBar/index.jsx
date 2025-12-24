import React, { useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

function TopBar({
  loggedInUser,
  onLogout,
  onUploadPhoto,
  advanced,
  onAdvancedChange,
}) {
  const fileInputRef = useRef(null);

  const handleChooseFile = () => {
    if (!loggedInUser) return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    onUploadPhoto && onUploadPhoto(file);
    e.target.value = "";
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 100, // ✅ luôn nằm trên content
      }}
    >
      <Toolbar sx={{ pointerEvents: "auto" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {loggedInUser ? `Hi ${loggedInUser.first_name}` : "Please Login"}
        </Typography>

        {/* ✅ clickable area */}
        <FormControlLabel
          sx={{
            mr: 2,
            color: "white",
            userSelect: "none",
            pointerEvents: "auto",
            "& .MuiFormControlLabel-label": { cursor: "pointer" },
          }}
          control={
            <Checkbox
              checked={!!advanced}
              onChange={(e) =>
                onAdvancedChange && onAdvancedChange(e.target.checked)
              }
              sx={{
                color: "white",
                "&.Mui-checked": { color: "white" },
                cursor: "pointer",
              }}
            />
          }
          label="Enable Advanced Features"
        />

        {loggedInUser ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={handleChooseFile}>
              ADD PHOTO
            </Button>
            <Button color="inherit" onClick={onLogout}>
              LOGOUT
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
