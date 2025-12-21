// // import React from "react";
// // import {
// //   Divider,
// //   List,
// //   ListItem,
// //   ListItemText,
// //   Typography,
// // } from "@mui/material";

// // import "./styles.css";
// // import models from "../../modelData/models";

// // import { Link } from 'react-router-dom';

// // /**
// //  * Define UserList, a React component of Project 4.
// //  */

// // function UserList () {
// //     const users = models.userListModel();
// //     return (
// //       <div>
// //         <h3>Users</h3>
// //         <ul>
// //           {users.map((user) => (
// //             <li key={user._id}>
// //               <Link to={`/users/${user._id}`}>{user.first_name} {user.last_name}</Link>
// //             </li>
// //           ))}
// //         </ul>
// //       </div>
// //     );
// // }

// // export default UserList;

// import React, { useEffect, useState } from "react";
// import { Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
// import { Link } from "react-router-dom";
// import "./styles.css";
// import fetchModel from "../../lib/fetchModelData";

// function UserList() {
//   const [users, setUsers] = useState([]);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     fetchModel("/user/list")
//       .then((data) => {
//         setUsers(data);
//         setErr("");
//       })
//       .catch((e) => setErr(e.message));
//   }, []);

//   return (
//     <div>
//       <Typography variant="body1">Users</Typography>
//       {err ? <Typography color="error">{err}</Typography> : null}

//       <List component="nav">
//         {users.map((u) => (
//           <React.Fragment key={u._id}>
//             <ListItem button component={Link} to={`/users/${u._id}`}>
//               <ListItemText primary={`${u.last_name}`} />
//             </ListItem>
//             <Divider />
//           </React.Fragment>
//         ))}
//       </List>
//     </div>
//   );
// }

// export default UserList;

import React, { useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserList({ loggedInUser }) {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!loggedInUser) {
      setUsers([]);
      setErr("");
      return;
    }

    fetchModel("/user/list")
      .then((data) => {
        setUsers(data);
        setErr("");
      })
      .catch((e) => {
        // 401 -> clear list silently
        if (e.status === 401) setUsers([]);
        else setErr(e.message);
      });
  }, [loggedInUser]);

  return (
    <div>
      <Typography variant="body1">Users</Typography>
      {err ? <Typography color="error">{err}</Typography> : null}
      <List component="nav">
        {users.map((u) => (
          <React.Fragment key={u._id}>
            <ListItem component={Link} to={`/users/${u._id}`}>
              <ListItemText primary={`${u.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
