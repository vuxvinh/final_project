// import React from "react";
// import { AppBar, Toolbar, Typography } from "@mui/material";

// import {Link, useLocation, useParams} from 'react-router-dom'
// import models from '../../modelData/models'

// import "./styles.css";

// /**
//  * Define TopBar, a React component of Project 4.
//  */
// function TopBar () {
//   const location = useLocation();
//   const path = location.pathname;

//   let rightText = '';

//   if (path.startsWith('/users/')) {
//     const userId = path.split('/')[2];
//     const user = models.userModel(userId);
//     if (user) {
//       rightText = `${user.first_name} ${user.last_name}`;
//     }
//   }

//   if (path.startsWith('/photos/')) {
//     const userId = path.split('/')[2];
//     const user = models.userModel(userId);
//     if (user) {
//       rightText = `Photos of ${user.first_name} ${user.last_name}`;
//     }
//   }
  
//   return (
//     <AppBar position="static">
//       <Toolbar style={{ display: 'flex', justifyContent: 'space-between'}}>
//         <Typography variant="h6">
//           Vu Quang Vinh
//         </Typography>

//         <Typography variant="h6">
//           {rightText}
//         </Typography>
//       </Toolbar>
//     </AppBar>
//   );
// }

// export default TopBar;

import React, { useRef } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

function TopBar({ loggedInUser, onLogout, onUploadPhoto }) {
  const fileInputRef = useRef(null);

  const handlePick = () => fileInputRef.current?.click();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f && typeof onUploadPhoto === "function") {
      onUploadPhoto(f);
    }
    e.target.value = "";
  };

  return (
    <AppBar position="absolute">
      <Toolbar>
        <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
          {loggedInUser ? `Hi ${loggedInUser.first_name}` : "Please Login"}
        </Typography>

        {loggedInUser ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />

            <Button color="inherit" onClick={handlePick}>
              Add Photo
            </Button>

            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

