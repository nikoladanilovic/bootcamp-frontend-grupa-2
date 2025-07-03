import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieApiClients from "../api_clients/MovieApiClients";

export default function AddMovieInputArea({ onMoviesChanged }){
  const movieClient = new MovieApiClients();
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);

  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [directors, setDirectors] = useState([]);
  const [directorSearch, setDirectorSearch] = useState('');
  const [directorPage, setDirectorPage] = useState(1);
  const [hasMoreDirectors, setHasMoreDirectors] = useState(true);
  const DIRECTORS_PAGE_SIZE = 4;

  const [useExistingDirector, setUseExistingDirector] = useState(true);
  const [directorId, setDirectorId] = useState('');
  const [newDirectorName, setNewDirectorName] = useState('');
  const [newDirectorBirthdate, setNewDirectorBirthdate] = useState('');
  const [newDirectorNationality, setNewDirectorNationality] = useState('');

  const [actors, setActors] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);

  const [showDirectorDropdown, setShowDirectorDropdown] = useState(false);
  const directorDropdownRef = React.useRef();

  const fetchDirectors = async (search = '', page = 1) => {
    try {
      const res = await axios.get(
        `https://localhost:7181/api/director?search=${encodeURIComponent(search)}&page=${page}&pageSize=${DIRECTORS_PAGE_SIZE}`
      );
      if (page === 1) {
        setDirectors(res.data);
      } else {
        setDirectors(prev => [...prev, ...res.data]);
      }
      setHasMoreDirectors(res.data.length === DIRECTORS_PAGE_SIZE);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDirectors(directorSearch, 1);
    setDirectorPage(1);
    setHasMoreDirectors(true);
  }, [directorSearch]);

  useEffect(() => {
    axios.get("https://localhost:7181/"+'api/genre/get-genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));

    axios.get("https://localhost:7181/api/actor")
      .then(res => setActors(res.data))
      .catch(err => console.error(err));

    // Fetch all movies for admin to manage
    async function fetchMovies() {
      const allMovies = await movieClient.Get(1900, "ASC", 1000, 1, "nothing", "nothing");
      setMovies(allMovies);
    }
    fetchMovies();
  }, []);

  const handleGenreChange = (genreId) => {
  setSelectedGenres(prev => {
    const exists = prev.some(g => g.id === genreId);
    if (exists) {
      return prev.filter(g => g.id !== genreId);
    } else {
      const genreToAdd = genres.find(g => g.id === genreId);
      return genreToAdd ? [...prev, genreToAdd] : prev;
    }
  });
};

  const handleSelectMovie = (movieId) => {
    setSelectedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleDeleteSelected = async () => {
    for (const movieId of selectedMovies) {
      await movieClient.DeleteClickedMovie(
        movieId,
        1900,
        "ASC",
        1000,
        1,
        "nothing",
        "nothing"
      );
    }
    const allMovies = await movieClient.Get(1900, "ASC", 1000, 1, "nothing", "nothing");
    setMovies(allMovies);
    setSelectedMovies([]);
    if (onMoviesChanged) onMoviesChanged();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalDirectorId = directorId;

    if (!useExistingDirector) {
      try {
        const directorResponse = await axios.post("https://localhost:7181/"+'api/director', {
          name: newDirectorName,
          birthdate: newDirectorBirthdate || null,
          nationality: newDirectorNationality || null
        });
        finalDirectorId = directorResponse.data.id;
      } catch (error) {
        console.error('Error creating director:', error);
        return;
      }
    }

    try {
      await axios.post("https://localhost:7181/"+'api/movie/with-genres', {
        title,
        releaseYear: parseInt(releaseYear),
        durationMinutes: parseInt(duration),
        directorId: finalDirectorId,
        description,
        genres: selectedGenres,
        actors: selectedActors.map(id => ({ id }))
      });

      alert('Movie added!');
      // Reset form
      setTitle('');
      setReleaseYear('');
      setDuration('');
      setDescription('');
      setSelectedGenres([]);
      setDirectorId('');
      setNewDirectorName('');
      setNewDirectorBirthdate('');
      setNewDirectorNationality('');
      setSelectedActors([]);

      if (onMoviesChanged) onMoviesChanged();
    } catch (error) {
      console.error('Error creating movie:', error);
      alert('Failed to create movie');
    }
  };

  const handleDirectorScroll = (e) => {
    const bottom = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 5;
    if (bottom && hasMoreDirectors) {
      const nextPage = directorPage + 1;
      fetchDirectors(directorSearch, nextPage);
      setDirectorPage(nextPage);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (directorDropdownRef.current && !directorDropdownRef.current.contains(event.target)) {
        setShowDirectorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDirectorSelect = (id) => {
    setDirectorId(id);
    setShowDirectorDropdown(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded shadow max-w-md mx-auto">
        <h2 className="text-xl font-bold">Add New Movie</h2>

        <input type="text" placeholder="Title" value={title}
          onChange={e => setTitle(e.target.value)} required className="m-4 w-full p-2 border rounded" />
        <input type="number" placeholder="Release Year" value={releaseYear}
          onChange={e => setReleaseYear(e.target.value)} required className="m-4 w-full p-2 border rounded" />
        <input type="number" placeholder="Duration (minutes)" value={duration}
          onChange={e => setDuration(e.target.value)} required className="m-4 w-full p-2 border rounded" />
        <input type="text" placeholder="Description" value={description}
          onChange={e => setDescription(e.target.value)} className="m-4 w-full p-2 border rounded" />


        <div className="m-4 flex space-x-2">
          <label><input className='m-2' type="radio" checked={useExistingDirector}
            onChange={() => setUseExistingDirector(true)} /> Existing Director</label>
          <label><input className='m-2' type="radio" checked={!useExistingDirector}
            onChange={() => setUseExistingDirector(false)} /> New Director</label>
        </div>

        {useExistingDirector ? (
          <div className="m-4 w-full" ref={directorDropdownRef}>
            <div
              className="w-full p-2 border rounded mb-2 cursor-pointer"
              style={{
                background: '#2d2d2d',
                color: '#fff',          
                border: '1px solid #444'
              }}
              onClick={() => setShowDirectorDropdown((prev) => !prev)}
              tabIndex={0}
            >
              {directors.find(d => d.id === directorId)?.name || "Select Director"}
            </div>
            {showDirectorDropdown && (
              <div
                style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  background: '#2d2d2d',
                  color: '#fff',
                  border: '1px solid #444', 
                }}
                className="rounded shadow"
                onScroll={handleDirectorScroll}
              >
                <input
                  type="text"
                  placeholder="Search director..."
                  value={directorSearch}
                  onChange={e => {
                    setDirectorSearch(e.target.value);
                    setDirectorPage(1);
                    fetchDirectors(e.target.value, 1);
                  }}
                  className="w-full p-2 border-b"
                  autoFocus
                  style={{ background: '#2d2d2d', color: '#fff', border: 'none' }}
                />
                {directors.length === 0 && (
                  <div className="p-2 text-gray-300">No directors found.</div>
                )}
                {directors.map(d => (
                  <div
                    key={d.id}
                    className={`p-2 hover:bg-gray-600 cursor-pointer ${directorId === d.id ? "bg-gray-700" : ""}`}
                    style={{ color: '#fff' }}
                    onClick={() => handleDirectorSelect(d.id)}
                  >
                    {d.name}
                  </div>
                ))}
                {hasMoreDirectors && (
                  <div className="p-2 text-center text-gray-300">Scroll for more...</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <input type="text" placeholder="New Director Name" value={newDirectorName}
              onChange={e => setNewDirectorName(e.target.value)} required className="m-4 w-full p-2 border rounded" />
            <input type="date" value={newDirectorBirthdate}
              onChange={e => setNewDirectorBirthdate(e.target.value)} className="m-4 w-full p-2 border rounded" />
            <input type="text" placeholder="Nationality" value={newDirectorNationality}
              onChange={e => setNewDirectorNationality(e.target.value)} className="m-4 w-full p-2 border rounded" />
          </>
        )}

        
        <div>
          <label className="block m-4 font-semibold mb-1">Genres:</label>
          {genres.map(g => (
              <label key={g.id} className="block">
              <input
                  type="checkbox"
                  checked={selectedGenres.some(selected => selected.id === g.id)}
                  onChange={() => handleGenreChange(g.id)}
                  className="m-2"
              />
              {g.name}
              </label>
          ))}
          </div>

          <div>
          <label className="block m-4 font-semibold mb-1">Actors:</label>
          <div className="m-4">
            {actors.map(a => (
              <label key={a.id} className="block">
                <input
                  type="checkbox"
                  checked={selectedActors.includes(a.id)}
                  onChange={() => {
                    setSelectedActors(prev =>
                      prev.includes(a.id)
                        ? prev.filter(id => id !== a.id)
                        : [...prev, a.id]
                    );
                  }}
                  className="m-2"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="m-4 bg-blue-600 text-white px-4 py-2 rounded">
          Add Movie
        </button>
      </form>

      <h3 className="text-xl font-bold mt-8">Manage Movies</h3>
      <button
        className="m-4 bg-red-600 text-white px-4 py-2 rounded"
        disabled={selectedMovies.length === 0}
        onClick={handleDeleteSelected}
      >
        Delete Selected Movies
      </button>
      <ul className="list-disc list-inside">
        {movies.map(movie => (
          <li key={movie.id} className="flex items-center">
            <input type="checkbox" className="mr-2"
              checked={selectedMovies.includes(movie.id)}
              onChange={() => handleSelectMovie(movie.id)} />
            {movie.title} ({movie.releaseYear})
          </li>
        ))}
      </ul>
    </div>
  );
}