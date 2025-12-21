// // import React from "react";
// // import { Typography } from "@mui/material";

// // import "./styles.css";
// // import {useParams, Link} from "react-router-dom";
// // import models from '../../modelData/models';


// // /**
// //  * Define UserPhotos, a React component of Project 4.
// //  */
// // function UserPhotos () {
// //   const { userId }  = useParams();
// //   const photos = models.photoOfUserModel(userId);

// //   if (!photos || photos.length == 0)
// //     return <div>No photos found</div>

// //   return (
// //     <div>
// //       <h2>User photos</h2>
// //       {
// //         photos.map((photo) => (
// //         <div key={photo._id}>
// //           <img 
// //             src={require(`../../images/${photo.file_name}`)}
// //             alt=""
// //             style={{ width: '300px' }}
// //           />
          
// //           <p>
// //             <b>Created:</b>{' '}
// //             {new Date(photo.date_time).toLocaleString()}
// //           </p>
          
// //           <h4>Comments</h4>
// //           <ul>
// //             {photo.comments && photo.comments.map((comment) => (
// //               <li key={comment._id}>
// //                 <p>
// //                   <b>
// //                     <Link to={`/users/${comment.user._id}`}>
// //                       {comment.user.first_name} {comment.user.last_name}
// //                     </Link>
// //                   </b>{' '}
// //                   {new Date(comment.date_time).toLocaleString()}
// //                 </p>
// //                 <p>
// //                   {comment.comment}
// //                 </p>
// //               </li>
// //             ))}
// //           </ul>
// //         </div>
// //         ))
// //       }
// //     </div>
// //   )
// // }

// // export default UserPhotos;

// import React, { useEffect, useState } from "react";
// import { Typography, Divider } from "@mui/material";
// import { Link, useParams } from "react-router-dom";
// import "./styles.css";
// import fetchModel from "../../lib/fetchModelData";

// function UserPhotos() {
//   const { userId } = useParams();
//   const [photos, setPhotos] = useState([]);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     fetchModel(`/photosOfUser/${userId}`)
//       .then((data) => {
//         setPhotos(data);
//         setErr("");
//       })
//       .catch((e) => setErr(e.message));
//   }, [userId]);

//   if (err) return <Typography color="error">{err}</Typography>;
//   if (!photos) return <Typography>Loading...</Typography>;

//   return (
//     <div>
//       <Typography variant="h6">Photos</Typography>

//       {photos.map((p) => (
//         <div key={p._id} style={{ marginTop: 16 }}>
//           <Typography variant="body2">{new Date(p.date_time).toLocaleString()}</Typography>
//           <img
//             src={`/images/${p.file_name}`}
//             alt={p.file_name}
//             style={{ width: "300px", height: "auto", display: "block" }}
//           />

//           <Typography variant="subtitle1" style={{ marginTop: 8 }}>
//             Comments
//           </Typography>

//           {(p.comments || []).map((c) => (
//             <div key={c._id} style={{ marginBottom: 8 }}>
//               <Typography variant="body2">
//                 {new Date(c.date_time).toLocaleString()} —{" "}
//                 <Link to={`/users/${c.user._id}`}>
//                   {c.user.first_name} {c.user.last_name}
//                 </Link>
//               </Typography>
//               <Typography variant="body1">{c.comment}</Typography>
//             </div>
//           ))}

//           <Divider style={{ marginTop: 16 }} />
//         </div>
//       ))}
//     </div>
//   );
// }

// export default UserPhotos;

import React, { useEffect, useState } from "react";
import { Typography, Divider, TextField, Button } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserPhotos({ loggedInUser }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [err, setErr] = useState("");

  // comment drafts per photo
  const [draft, setDraft] = useState({});

  const load = () => {
    fetchModel(`/photosOfUser/${userId}`)
      .then((data) => {
        setPhotos(data);
        setErr("");
      })
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const addComment = (photoId) => {
    const text = (draft[photoId] || "").trim();
    fetchModel(`/commentsOfPhoto/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    })
      .then(() => {
        setDraft((d) => ({ ...d, [photoId]: "" }));
        load();
      })
      .catch((e) => alert(e.message));
  };

  if (err) return <Typography color="error">{err}</Typography>;

  return (
    <div className="user-photos">
      <Typography variant="h6">Photos</Typography>

      {photos.map((p) => (
        <div key={p._id} style={{ marginTop: 16 }}>
          <Typography variant="body2">
            {new Date(p.date_time).toLocaleString()}
          </Typography>

          <img
            className="photo-img"
            src={`/images/${p.file_name}`}
            alt={p.file_name}
            style={{ maxWidth: "100%", height: "auto", display: "block", marginTop: 8 }}
          />

          <Typography variant="subtitle1" style={{ marginTop: 8 }}>
            Comments
          </Typography>

          {(p.comments || []).map((c) => (
            <div key={c._id} style={{ marginBottom: 8 }}>
              <Typography variant="body2">
                {new Date(c.date_time).toLocaleString()} —{" "}
                <Link to={`/users/${c.user._id}`}>
                  {c.user.first_name} {c.user.last_name}
                </Link>
              </Typography>
              <Typography variant="body1">{c.comment}</Typography>
            </div>
          ))}

          {/* Add comment UI */}
          {loggedInUser ? (
            <div style={{ marginTop: 8 }}>
              <TextField
                label="Add a comment"
                fullWidth
                value={draft[p._id] || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [p._id]: e.target.value }))
                }
              />
              <Button
                variant="contained"
                style={{ marginTop: 8 }}
                onClick={() => addComment(p._id)}
              >
                Submit
              </Button>
            </div>
          ) : null}

          <Divider style={{ marginTop: 16 }} />
        </div>
      ))}
    </div>
  );
}

export default UserPhotos;
