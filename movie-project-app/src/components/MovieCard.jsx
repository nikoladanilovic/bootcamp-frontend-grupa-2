export default function MovieCard( {movie, deleteMovie} ) {


    return(
        <div className="row card mb-3 point-to-click card-hover-pop">
        <div className="col card-body">
          <h5 className="card-title">{movie.title}</h5>
          <h6 className="card-subtitle mb-2 text-body-secondary">{movie.releaseYear}</h6>
          <h6 className="card-subtitle mb-2 text-body-secondary">{movie.duration} minutes</h6>
          <p className="card-text">{movie.description}</p>
          
        </div>
        <div className="col text-end">
          <button className="delete-btn btn btn-primary" onClick={() => deleteMovie(movie.id)}>Delete</button>
        </div>
        
      </div>
    )
}