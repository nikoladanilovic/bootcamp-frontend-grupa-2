import { useState, useEffect } from "react";
import MovieApiClients from "../api_clients/MovieApiClients";

export default function PageNavigation({movieClient, changeCurrentPage, pageSize, currentPage, genre, nameOfMovie}) {
    //State that gets total number of movies in database
    const [movieNumber, setMovieNumber] = useState(1);

    //State that shoes total number of pages
    const [numOfPages, setNumOfPages] = useState(0);

    //Getting total number of movies from database
    useEffect(() => {
        const fetchEvents = async () => {
            let pageFilteringSetup = JSON.parse(localStorage.getItem("filterSetup"));
        setMovieNumber(await movieClient.GetCountMovies(
            pageFilteringSetup.releasedYearFilter,
            genre,
            nameOfMovie
        ));
        };
        fetchEvents();
        
    }, [genre, nameOfMovie]);

    //Calculation of total number of pages by dividing total number of movies by hardcoded number of movies per page
    useEffect(() => {
        setNumOfPages(Number.isInteger(movieNumber / pageSize) ? Math.floor(movieNumber / pageSize): Math.floor(movieNumber / pageSize) + 1);
    }, [movieNumber]); // runs when movieNumber updates



    return(
        <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li class="page-item" onClick={() => changeCurrentPage("Previous", numOfPages)}><a class="page-link" href="#">Previous</a></li>
            {Array.from({ length: numOfPages }).map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`} onClick={() => changeCurrentPage(i+1, numOfPages)}><a class="page-link" href="#">{i+1}</a></li>
            ))}
            <li class="page-item" onClick={() => changeCurrentPage("Next", numOfPages)}><a class="page-link" href="#">Next</a></li>
        </ul>
        </nav>
    )
}