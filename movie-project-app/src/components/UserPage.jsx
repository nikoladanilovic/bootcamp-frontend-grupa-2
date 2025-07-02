import { useEffect, useState } from "react";
import axios from "axios";

export default function UserPage({ user }) {
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    async function fetchUserReviews() {
      if (!user) return;
      const res = await axios.get(`https://localhost:7181/api/review/get-user-review${user.id}`);
      setReviews(res.data);
      if (res.data.length > 0) {
        setAvg(
          (res.data.reduce((acc, r) => acc + r.rating, 0) / res.data.length).toFixed(2)
        );
      } else {
        setAvg(null);
      }
    }
    fetchUserReviews();
  }, [user]);

  if (!user) return <div className="container mt-5">You must be logged in to view your profile.</div>;

  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      <div className="mb-3">
        <b>Username:</b> {user.username}
      </div>
      <div className="mb-3">
        <b>Average rating given:</b> {avg !== null ? `${avg} / 5` : "No reviews yet"}
      </div>
      <div className="mb-3">
        <b>Total reviews:</b> {reviews.length}
      </div>
      <h4>Your reviews:</h4>
      <ul className="list-group">
        {reviews.length === 0 && <li className="list-group-item">You have not written any reviews yet.</li>}
        {reviews.map(r => (
          <li key={r.id} className="list-group-item">
            <b>Movie:</b> {r.movieTitle || r.movieId} <br />
            <b>Rating:</b> {r.rating} <br />
            <b>Comment:</b> {r.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}