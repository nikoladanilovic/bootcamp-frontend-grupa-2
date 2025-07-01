import MovieApiClients from "../api_clients/MovieApiClients";

import { useEffect, useState } from "react";

export default function MovieSearchForm({setGenre, setNameOfMovie, movieClient}) {
    const [nameMovie, setNameMovie] = useState("");
    const [genresForSearch, setGenresForSearch] = useState([]);

    useEffect(() => {
      const fetchEvents = async () => {
        setGenresForSearch(await movieClient.GetGenres());
      }
      fetchEvents();
    }, []);


    return(
        <form onSubmit={(e) => {
          e.preventDefault();
          setNameOfMovie(nameMovie);
        }}>
        <div className='container m-5 search-form'>

          <div class="input-group input-group-sm mb-3">
            <span class="input-group-text" id="inputGroup-sizing-sm">Search For Movie</span>
            <input onChange={(e) => setNameMovie(e.target.value)} value={nameMovie} placeholder="Name of the movie" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"/>
          </div>

          <div class="dropdown mb-3">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Or Pick Genre
            </button>
            <ul class="dropdown-menu">
              {genresForSearch.map((genre, index) => (
                <li key={index}><a class="dropdown-item" href="#" onClick={(e) => setGenre(e.target.innerHTML)}>{genre.name}</a></li>
              ))}
            </ul>
          </div>

          <button type="button mb-3 submit" class="btn btn-primary">Search</button>
          
        </div>
      </form>
    )
}