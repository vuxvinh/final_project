// import React from "react";
// import {dividerClasses, Typography} from "@mui/material";

// import "./styles.css";
// import {useParams, Link} from "react-router-dom";
// import models from "../../modelData/models";

// /**
//  * Define UserDetail, a React component of Project 4.
//  */
// function UserDetail() {
//     const { userId } = useParams();
//     const user = models.userModel(userId);
    
//     if (!user)
//       return <div>User not found</div>
    
//     return (
//       <div>
//         <h2>
//           {user.first_name} {user.last_name}
//         </h2>
//         <p><b>Location:</b> {user.location}</p>
//         <p><b>Occupation:</b> {user.occupation}</p>
//         <p><b>Description:</b> {user.description}</p>
//         <Link to={`/photos/${userId}`}>View Photos</Link>
//       </div>
//     )
// }

// export default UserDetail;

import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchModel(`/user/${userId}`)
      .then((data) => {
        setUser(data);
        setErr("");
      })
      .catch((e) => setErr(e.message));
  }, [userId]);

  if (err) return <Typography color="error">{err}</Typography>;
  if (!user) return <Typography>Loading...</Typography>;

  return (
    <div>
      <Typography variant="h6">{user.first_name} {user.last_name}</Typography>
      <Typography>Location: {user.location}</Typography>
      <Typography>Description: {user.description}</Typography>
      <Typography>Occupation: {user.occupation}</Typography>

      <Typography sx={{ marginTop: 2 }}>
        <Link to={`/photos/${user._id}`}>View photos</Link>
      </Typography>
    </div>
  );
}

export default UserDetail;
