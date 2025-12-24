import React, { useEffect, useState } from "react";
import { Typography, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserComments() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    fetchModel(`/commentsOfUser/${userId}`)
      .then((data) => setItems(data))
      .catch((e) => setErr(e.message));
  }, [userId]);

  if (err) return <Typography color="error">{err}</Typography>;

  return (
    <div className="user-comments">
      <Typography variant="h6">Comments by user</Typography>

      {items.map((it) => (
        <div key={it.comment_id} className="comment-row">
          <img
            className="thumb"
            src={`/images/${it.photo_file_name}`}
            alt="thumb"
            onClick={() => navigate(`/photos/${it.photo_owner_id}/${it.photo_id}`)}
          />
          <div className="comment-text">
            <Typography variant="body2">
              {it.date_time ? new Date(it.date_time).toLocaleString() : ""}
            </Typography>
            <Typography
              variant="body1"
              className="clickable"
              onClick={() => navigate(`/photos/${it.photo_owner_id}/${it.photo_id}`)}
            >
              {it.comment}
            </Typography>
          </div>
          <Divider style={{ marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export default UserComments;