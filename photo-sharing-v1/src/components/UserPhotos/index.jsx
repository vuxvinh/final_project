import React, { useEffect, useMemo, useState } from "react";
import { Typography, Divider, TextField, Button } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserPhotos({ loggedInUser, advanced }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [err, setErr] = useState("");

  // add comment draft: photoId -> text
  const [draft, setDraft] = useState({});

  // edit comment draft: commentId -> text
  const [editing, setEditing] = useState({});

  // hide comments toggle: photoId -> boolean (true = hidden)
  const [hideComments, setHideComments] = useState({});

  const loadPhotos = () => {
    setErr("");
    fetchModel(`/photosOfUser/${userId}`)
      .then((data) => setPhotos(data || []))
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line
  }, [userId]);

  // ---- Advanced: if advanced true and route includes :photoId, show 1 photo + Next/Prev
  useEffect(() => {
    if (!advanced) return;
    if (!photos || photos.length === 0) return;

    // if advanced but no photoId in URL -> jump to first photo
    if (!photoId) {
      navigate(`/photos/${userId}/${photos[0]._id}`, { replace: true });
    }
  }, [advanced, photos, photoId, userId, navigate]);

  const activeIndex = useMemo(() => {
    if (!advanced) return -1;
    if (!photoId) return -1;
    return photos.findIndex((p) => String(p._id) === String(photoId));
  }, [advanced, photos, photoId]);

  const activePhoto = advanced && activeIndex >= 0 ? photos[activeIndex] : null;

  const goPrev = () => {
    if (!advanced) return;
    if (activeIndex <= 0) return;
    navigate(`/photos/${userId}/${photos[activeIndex - 1]._id}`);
  };

  const goNext = () => {
    if (!advanced) return;
    if (activeIndex < 0 || activeIndex >= photos.length - 1) return;
    navigate(`/photos/${userId}/${photos[activeIndex + 1]._id}`);
  };

  // ---- Photo delete (owner only)
  const handleDeletePhoto = (pId) => {
    if (!window.confirm("Delete this photo?")) return;

    fetchModel(`/photos/${pId}`, { method: "DELETE" })
      .then(() => {
        // if advanced and deleted current photo -> go to a safe photo
        if (advanced) {
          const remaining = photos.filter((x) => String(x._id) !== String(pId));
          if (remaining.length > 0) {
            const next = remaining[Math.min(activeIndex, remaining.length - 1)];
            navigate(`/photos/${userId}/${next._id}`, { replace: true });
          } else {
            navigate(`/users/${userId}`, { replace: true });
          }
        }
        loadPhotos();
      })
      .catch((e) => alert(e.message));
  };

  // ---- LIKE/UNLIKE (Button version)
  const toggleLike = (p) => {
    if (!loggedInUser) return;

    const me = String(loggedInUser._id);
    const likes = (p.likes || []).map((x) => String(x));
    const liked = likes.includes(me);

    const method = liked ? "DELETE" : "POST";
    fetchModel(`/photos/${p._id}/like`, { method })
      .then(() => loadPhotos())
      .catch((e) => alert(e.message));
  };

  // ---- Comments
  const toggleComments = (pId) => {
    setHideComments((h) => ({ ...h, [pId]: !h[pId] }));
  };

  const submitComment = (pId) => {
    const text = (draft[pId] || "").trim();
    if (!text) return alert("Comment is required");

    fetchModel(`/commentsOfPhoto/${pId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    })
      .then(() => {
        setDraft((d) => ({ ...d, [pId]: "" }));
        loadPhotos();
      })
      .catch((e) => alert(e.message));
  };

  const startEdit = (cId, oldText) => {
    setEditing((e) => ({ ...e, [cId]: oldText }));
  };

  const cancelEdit = (cId) => {
    setEditing((e) => {
      const copy = { ...e };
      delete copy[cId];
      return copy;
    });
  };

  const saveEdit = (pId, cId) => {
    const text = (editing[cId] || "").trim();
    if (!text) return alert("Comment is required");

    fetchModel(`/commentsOfPhoto/${pId}/${cId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    })
      .then(() => {
        cancelEdit(cId);
        loadPhotos();
      })
      .catch((e) => alert(e.message));
  };

  const deleteComment = (pId, cId) => {
    if (!window.confirm("Delete this comment?")) return;

    fetchModel(`/commentsOfPhoto/${pId}/${cId}`, { method: "DELETE" })
      .then(() => loadPhotos())
      .catch((e) => alert(e.message));
  };

  // ---- render one photo block
  const renderOnePhoto = (p) => {
    const isPhotoOwner =
      loggedInUser && String(loggedInUser._id) === String(p.user_id);

    const commentsHidden = !!hideComments[p._id];

    // comment counts
    const totalComments = (p.comments || []).length;
    const myComments = loggedInUser
      ? (p.comments || []).filter((c) => {
          const cid = c.user_id
            ? String(c.user_id)
            : c.user?._id
            ? String(c.user._id)
            : "";
          return cid && String(loggedInUser._id) === cid;
        }).length
      : 0;

    // like state
    const me = loggedInUser ? String(loggedInUser._id) : "";
    const likes = (p.likes || []).map((x) => String(x));
    const liked = me ? likes.includes(me) : false;
    const likeCount = likes.length;

    return (
      <div key={p._id} className="photo-card">
        <Typography variant="body2" style={{ marginBottom: 6 }}>
          {p.date_time ? new Date(p.date_time).toLocaleString() : ""}
        </Typography>

        <img
          className="photo-img"
          src={`/images/${p.file_name}`}
          alt={p.file_name}
        />

        {/* ✅ Like row (Button) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            variant={liked ? "contained" : "outlined"}
            color={liked ? "error" : "primary"}
            onClick={() => toggleLike(p)}
            disabled={!loggedInUser}
          >
            {liked ? "UNLIKE" : "LIKE"}
          </Button>

          <Typography variant="body2" style={{ marginTop: 2 }}>
            {likeCount} like
          </Typography>
        </div>

        {/* Delete photo (only owner) */}
        {isPhotoOwner && (
          <Button
            color="error"
            size="small"
            onClick={() => handleDeletePhoto(p._id)}
            style={{ marginTop: 8 }}
          >
            Delete Photo
          </Button>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2">
            Comments{" "}
            <span style={{ fontWeight: 400 }}>
              (Total: {totalComments}
              {loggedInUser ? `, Mine: ${myComments}` : ""})
            </span>
          </Typography>

          <Button
            size="small"
            variant="outlined"
            onClick={() => toggleComments(p._id)}
          >
            {commentsHidden ? "Show comments" : "Hide comments"}
          </Button>
        </div>

        {!commentsHidden && (
          <>
            {(p.comments || []).length > 0 ? (
              (p.comments || []).map((c) => {
                const isOwner =
                  loggedInUser &&
                  (String(c.user_id) === String(loggedInUser._id) ||
                    (c.user && String(c.user._id) === String(loggedInUser._id)));

                const isEditing = editing[c._id] !== undefined;

                return (
                  <div key={c._id} className="comment-item">
                    <Typography variant="body2">
                      {c.date_time ? new Date(c.date_time).toLocaleString() : ""}{" "}
                      —{" "}
                      {c.user?._id ? (
                        <Link to={`/users/${c.user._id}`}>
                          {c.user.first_name} {c.user.last_name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </Typography>

                    {!isEditing ? (
                      <Typography variant="body1">{c.comment}</Typography>
                    ) : (
                      <TextField
                        fullWidth
                        value={editing[c._id]}
                        onChange={(e) =>
                          setEditing((ed) => ({
                            ...ed,
                            [c._id]: e.target.value,
                          }))
                        }
                      />
                    )}

                    {isOwner && !isEditing && (
                      <div style={{ marginTop: 4 }}>
                        <Button
                          size="small"
                          onClick={() => startEdit(c._id, c.comment)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteComment(p._id, c._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}

                    {isOwner && isEditing && (
                      <div style={{ marginTop: 4 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => saveEdit(p._id, c._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => cancelEdit(c._id)}
                          style={{ marginLeft: 8 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments
              </Typography>
            )}

            {/* Add comment */}
            {loggedInUser && (
              <div className="add-comment">
                <TextField
                  label="Add a comment *"
                  fullWidth
                  value={draft[p._id] || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [p._id]: e.target.value }))
                  }
                />
                <Button
                  variant="contained"
                  onClick={() => submitComment(p._id)}
                  style={{ marginTop: 8 }}
                >
                  Submit
                </Button>
              </div>
            )}
          </>
        )}

        <Divider style={{ marginTop: 16 }} />
      </div>
    );
  };

  if (err) return <Typography color="error">{err}</Typography>;

  return (
    <div className="user-photos">
      <Typography variant="h6" style={{ marginBottom: 12 }}>
        Photos
      </Typography>

      {advanced ? (
        <>
          <div style={{ marginBottom: 12, display: "flex", gap: 10 }}>
            <Button
              variant="outlined"
              onClick={goPrev}
              disabled={activeIndex <= 0}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              onClick={goNext}
              disabled={activeIndex < 0 || activeIndex >= photos.length - 1}
            >
              Next
            </Button>
          </div>

          {activePhoto ? renderOnePhoto(activePhoto) : null}
        </>
      ) : (
        <>{photos.map((p) => renderOnePhoto(p))}</>
      )}
    </div>
  );
}

export default UserPhotos;