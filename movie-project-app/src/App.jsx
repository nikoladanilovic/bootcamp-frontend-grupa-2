import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import MovieSearchForm from './components/MovieSearchForm';
import MovieCard from './components/MovieCard';
import MovieApiClients from './api_clients/MovieApiClients';
import PageNavigation from './components/PageNavigation';
import AddMovieInputArea from './components/AddMovieInputArea';
import UserAuthForm from './components/UserAuthForm';

function App() {
  const movieClient = new MovieApiClients();
  const pageSize = 4;
  const [movieList, setMovieList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [genre, setGenreState] = useState('nothing');
  const [nameOfMovie, setNameOfMovieState] = useState('nothing');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Hardcoded admin user ID (replace with your admin user's UUID)
  const ADMIN_ID = '7e51a570-254d-4d05-a20f-246e57e42e2d'; 

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    alert('Logged out successfully!');
  };

  function changeCurrentPage(changePage, maxNumOfPages) {
    if (Number.isInteger(changePage)) {
      setCurrentPage(changePage);
    }
    if (changePage === 'Previous') {
      if (currentPage - 1 >= 1) setCurrentPage(currentPage - 1);
    }
    if (changePage === 'Next') {
      if (currentPage + 1 <= maxNumOfPages) setCurrentPage(currentPage + 1);
    }
  }

  useEffect(() => {
    const fetchEvents = async () => {
      localStorage.setItem(
        'filterSetup',
        JSON.stringify({
          releasedYearFilter: 1900,
          ordering: 'ASC',
          moviesPerPage: pageSize,
          page: currentPage,
          genre: 'nothing',
          nameOfMovie: 'nothing',
        })
      );

      let pageFilteringSetup = JSON.parse(localStorage.getItem('filterSetup'));

      setMovieList(
        await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          pageFilteringSetup.nameOfMovie
        )
      );
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      localStorage.setItem(
        'filterSetup',
        JSON.stringify({
          releasedYearFilter: 1900,
          ordering: 'DESC',
          moviesPerPage: pageSize,
          page: currentPage,
          genre: 'nothing',
          nameOfMovie: 'nothing',
        })
      );

      let pageFilteringSetup = JSON.parse(localStorage.getItem('filterSetup'));

      setMovieList(
        await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          pageFilteringSetup.nameOfMovie
        )
      );
    };

    fetchEvents();
  }, [currentPage]);

  useEffect(() => {
    const fetchEvents = async () => {
      let pageFilteringSetup = JSON.parse(localStorage.getItem('filterSetup'));

      setMovieList(
        await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          genre,
          pageFilteringSetup.nameOfMovie
        )
      );
    };

    fetchEvents();
  }, [genre]);

  useEffect(() => {
    const fetchEvents = async () => {
      let pageFilteringSetup = JSON.parse(localStorage.getItem('filterSetup'));

      setMovieList(
        await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          nameOfMovie
        )
      );
    };

    fetchEvents();
  }, [nameOfMovie]);

  function setGenre(movieGenre) {
    setGenreState(movieGenre);
  }

  function setNameOfMovie(movieName) {
    setNameOfMovieState(movieName);
  }

  async function deleteMovie(movieId){
    if (user?.id !== ADMIN_ID) {
      alert("Only admin can delete movies.");
      return;
    }
    let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
    setMovieList(await movieClient.DeleteClickedMovie(
      movieId,
      pageFilteringSetup.releasedYearFilter,
      pageFilteringSetup.ordering,
      pageFilteringSetup.moviesPerPage,
      pageFilteringSetup.page,
      pageFilteringSetup.genre,
      pageFilteringSetup.nameOfMovie
    ));
  }

  return (
    <div className="container">
      <Header />
      {user ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3>Welcome, {user.username} {user.id === ADMIN_ID ? '(Admin)' : ''}!</h3>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          <MovieSearchForm
            setGenre={setGenre}
            setNameOfMovie={setNameOfMovie}
            movieClient={movieClient}
          />
          {movieList.map((movie, index) => (
            <MovieCard
              key={index}
              movie={movie}
              deleteMovie={deleteMovie}
              isAdmin={user.id === ADMIN_ID}
            />
          ))}
          <PageNavigation
            movieClient={movieClient}
            changeCurrentPage={changeCurrentPage}
            pageSize={
              JSON.parse(localStorage.getItem('filterSetup'))?.moviesPerPage ?? pageSize
            }
            currentPage={currentPage}
            genre={genre}
            nameOfMovie={nameOfMovie}
          />
          {user.id === ADMIN_ID ? (
            <AddMovieInputArea />
          ) : (
            <p className="text-center mt-4">Only admins can add movies.</p>
          )}
        </div>
      ) : (
        <UserAuthForm setUser={setUser} setError={setError} />
      )}
      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </div>
  );
}

export default App;