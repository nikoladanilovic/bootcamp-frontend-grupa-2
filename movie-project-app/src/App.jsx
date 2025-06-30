import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import MovieSearchForm from './components/MovieSearchForm'
import MovieCard from './components/MovieCard'
import MovieApiClients from './api_clients/MovieApiClients'
import PageNavigation from './components/PageNavigation'
import AddMovieInputArea from './components/AddMovieInputArea'

function App() {
  //Api client for movies
  const movieClient = new MovieApiClients();

  //Hardcoded page size for pagination
  const pageSize = 4;

  //State for movies that will be shown from database
  const [movieList, setMovieList] = useState([]);

  //State that tracks current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);

  //State of genre
  const [genre, setGenreState] = useState("nothing");

  //State of name of the movie
  const [nameOfMovie, setNameOfMovieState] = useState("nothing");

  //Function that sets current page number
  function changeCurrentPage(changePage, maxNumOfPages){
    if(Number.isInteger(changePage)){
      setCurrentPage(changePage);
    }
    if(changePage === "Previous"){
      if(currentPage - 1 >= 1)
        setCurrentPage(currentPage - 1);
    }
    if(changePage === "Next"){
      if(currentPage + 1 <= maxNumOfPages)
        setCurrentPage(currentPage + 1)
    }
  }

  //useEffect that sets movies that will be shown when starting website
  useEffect(() => {
        const fetchEvents = async () => {
          //Store filter variables in local storage
        localStorage.setItem("filterSetup", JSON.stringify({
          releasedYearFilter: 1900,
          ordering: "ASC",
          moviesPerPage: pageSize,
          page: currentPage,
          genre: "nothing",
          nameOfMovie: "nothing"
        }));

        let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
        
        //Get movie list from database using filter parameters on api client
        setMovieList(await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          pageFilteringSetup.nameOfMovie
        ));
      };

      fetchEvents();
  }, []);

  //Use effect that changes every time that page number is changed, does the same thing 
  // as previous use effect, just is triggerd when currentPage variable is changed
  useEffect(() => {
    const fetchEvents = async () => {
        localStorage.setItem("filterSetup", JSON.stringify({
          releasedYearFilter: 1900,
          ordering: "DESC",
          moviesPerPage: pageSize,
          page: currentPage,
          genre: "nothing",
          nameOfMovie: "nothing"
        }));
        console.log(currentPage);

        let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
        
        setMovieList(await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          pageFilteringSetup.nameOfMovie
        ));
      };

      fetchEvents();
  }, [currentPage]); 

  useEffect(() => {
    const fetchEvents = async () => {
        console.log(currentPage);

        let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
        
        setMovieList(await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          genre,
          pageFilteringSetup.nameOfMovie
        ));
      };

      fetchEvents();
  }, [genre]);

  useEffect(() => {
    const fetchEvents = async () => {
        console.log(currentPage);
        console.log(nameOfMovie);
        let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
        
        setMovieList(await movieClient.Get(
          pageFilteringSetup.releasedYearFilter,
          pageFilteringSetup.ordering,
          pageFilteringSetup.moviesPerPage,
          pageFilteringSetup.page,
          pageFilteringSetup.genre,
          nameOfMovie
        ));
      };

      fetchEvents();
  }, [nameOfMovie]);

  function setGenre(movieGenre){
    console.log(movieGenre);
    setGenreState(movieGenre);
  }

  function setNameOfMovie(movieName) {
    setNameOfMovieState(movieName);
  }



  return (
    <div className="containter">

      <Header />

      <MovieSearchForm setGenre={setGenre}
        setNameOfMovie={setNameOfMovie}
        nameOfMovie={nameOfMovie}
      />

      {movieList.map((movie, index) => (
        <MovieCard key={index} movie={movie}/>
      ))}
      
      <PageNavigation 
        movieClient={movieClient}
        changeCurrentPage={changeCurrentPage}
        pageSize={
          JSON.parse(localStorage.getItem("filterSetup"))?.moviesPerPage ?? pageSize
        }
        currentPage={currentPage}
        genre={genre}
        nameOfMovie={nameOfMovie}
      />

      <AddMovieInputArea />

    </div>
  )
}

export default App
