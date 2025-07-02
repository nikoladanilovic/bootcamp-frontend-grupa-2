import { useEffect, useState } from "react";
import axios from "axios";

export default function MovieDetailsModal({ movie, user, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [director, setDirector] = useState(null);
  const [genres, setGenres] = useState([]);
  const [actors, setActors] = useState([]);

  // Fetch all reviews for this movie
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await axios.get(
          `https://localhost:7181/api/review/get-review`
        );
        const movieReviews = res.data.filter(r => r.movieId === movie.id);
        setReviews(movieReviews);

        if (user) {
          const mine = movieReviews.find(r => r.userId === user.id);
          setMyReview(mine);
          if (mine) {
            setReviewText(mine.text);
            setRating(mine.rating);
          } else {
            setReviewText("");
            setRating(5);
          }
        }

        // Calculate average rating
        if (movieReviews.length > 0) {
          setAvgRating(
            (movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length).toFixed(2)
          );
        } else {
          setAvgRating(null);
        }
      } catch {
        setReviews([]);
      }
    }
    fetchReviews();
  }, [movie.id, user]);

  // Fetch movie details
  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const movieRes = await axios.get(`https://localhost:7181/api/movie/${movie.id}`);
        setDirector(movieRes.data.director || null);
        setGenres(movieRes.data.genres || []);
        setActors(movieRes.data.actors || []);
      } catch {
        setDirector(null);
        setGenres([]);
        setActors([]);
      }
    }
    fetchMovieDetails();
  }, [movie.id]);

  // Create or update review
  async function handleSaveReview() {
    if (!reviewText.trim()) return;
    if (myReview) {
      // Update
      await axios.put(
        `https://localhost:7181/api/review/update-review?id=${myReview.id}`,
        {
          ...myReview,
          comment: reviewText, // <-- koristi comment
          rating,
        }
      );
    } else {
      // Create
      await axios.post(
        `https://localhost:7181/api/review/create-review`,
        [
          {
            userId: user.userId || user.id, // koristi userId ako postoji, fallback na id
            movieId: movie.id,
            comment: reviewText, // <-- koristi comment
            rating,
          },
        ]
      );
    }
    setEditMode(false);
    // Refresh reviews
    const res = await axios.get(
      `https://localhost:7181/api/review/get-review`
    );
    const movieReviews = res.data.filter(r => r.movieId === movie.id);
    setReviews(movieReviews);
    const mine = movieReviews.find(r => r.userId === user.id);
    setMyReview(mine);
    setReviewText(mine ? mine.comment : ""); // <-- koristi comment
    setRating(mine ? mine.rating : 5);

    // Calculate average rating
    if (movieReviews.length > 0) {
      setAvgRating(
        (movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length).toFixed(2)
      );
    } else {
      setAvgRating(null);
    }
  }

  // Delete review
  async function handleDeleteReview() {
    if (!myReview) return;
    await axios.delete(
      `https://localhost:7181/api/review/delete-review/${myReview.id}`
    );
    setEditMode(false);
    setMyReview(null);
    setReviewText("");
    setRating(5);
    // Refresh reviews
    const res = await axios.get(
      `https://localhost:7181/api/review/get-review`
    );
    setReviews(res.data.filter(r => r.movieId === movie.id));
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{movie.title} ({movie.releaseYear})</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{movie.description}</p>
            <div className="mb-2">
              <b>Director:</b> {director ? director.name : "Unknown"}
            </div>
            <div className="mb-3">
              <b>Genres:</b> {genres.length > 0 ? genres.map(g => g.name).join(", ") : "Unknown"}
            </div>
            <div className="mb-3">
              <b>Actors:</b> {actors.length > 0 ? actors.map(a => a.name).join(", ") : "Unknown"}
            </div>
            <div className="mb-2">
              <b>Average rating:</b>{" "}
              {avgRating !== null ? <span>{avgRating} / 5</span> : <span>No ratings yet</span>}
            </div>
            <h6>Reviews:</h6>
            <ul className="list-group mb-3">
              {reviews.length === 0 && (
                <li className="list-group-item">No reviews for this movie.</li>
              )}
              {reviews.map(r => (
                <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <b>
                      {r.userId === user?.id
                        ? "You"
                        : r.username
                          ? r.username
                          : ""}
                    </b>
                    <span className="ms-2 badge bg-primary">Rating: {r.rating}</span>
                    <div className="mt-1">
                      <span className="fst-italic">{r.comment}</span>
                    </div>
                  </div>
                  {user && r.userId === user.id && (
                    <div>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => { setEditMode(true); setReviewText(r.comment); setRating(r.rating); }}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={handleDeleteReview}>Delete</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {user && (
              <div>
                <h6>
                  {myReview
                    ? (editMode ? "Edit your review" : "Your review")
                    : "Add a review"}
                </h6>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="form-control"
                  disabled={myReview && !editMode}
                  placeholder="Write your comment..."
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="form-control mt-2"
                  disabled={myReview && !editMode}
                />
                {(editMode || !myReview) && (
                  <button className="btn btn-success mt-2" onClick={handleSaveReview}>
                    {myReview ? "Save changes" : "Submit review"}
                  </button>
                )}
                {myReview && !editMode && (
                  <button className="btn btn-secondary mt-2 ms-2" onClick={() => setEditMode(true)}>
                    Edit review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}