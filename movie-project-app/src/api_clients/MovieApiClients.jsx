import axios from 'axios';

export default class MovieApiClients{
    constructor(){
        this.accessString = "https://localhost:7181/";
    }

    async Get(releasedYearFilter, ordering, moviesPerPage, page, genre, nameOfMovie){
        try {
            const res = await axios.get(this.accessString + "api/movie/with-directors-and-genres?releasedYearFilter=" + releasedYearFilter + "&ordering=" + ordering + "&moviesPerPage=" + moviesPerPage + "&page=" + page + "&genre=" + genre + "&nameOfMovie=" + nameOfMovie);

            const simplified = res.data.map(item => ({
                id: item.id,
                title: item.title,
                releaseYear: item.releaseYear,
                duration: item.durationMinutes,
                description: item.description
            }));

            return simplified;
        } catch (err) {
            return "nesto nece";
        }
    }

    async GetCountMovies(releasedYearFilter, genre, nameOfMovie){
        try {
            const res = await axios.get(this.accessString + "api/movie/count?releasedYearFilter=" + releasedYearFilter + "&genre=" + genre + "&nameOfMovie=" + nameOfMovie);

            const count = res.data;

            return count;
        } catch (err) {
            return "nesto nece";
        }
    }

    async GetCurated(releasedYearFilter, ordering, moviesPerPage, page){
        try {
            const res = await axios.get(this.accessString + "api/movie/curated?releasedYearFilter=" + releasedYearFilter + "&ordering=" + ordering + "&moviesPerPage=" + moviesPerPage + "&page=" + page);

            const simplified = res.data.map(item => ({
                id: item.id,
                title: item.title,
                releaseYear: item.releaseYear,
                duration: item.duration,
                description: item.description
            }));

            return simplified;
        } catch (err) {
            return "nesto nece";
        }
    }

    async DeleteClickedMovie(movieId, releasedYearFilter, ordering, moviesPerPage, page, genre, nameOfMovie){
        try{
            await axios.delete(this.accessString + "api/movie/" + movieId);
            const res = await axios.get(this.accessString + "api/movie/with-directors-and-genres?releasedYearFilter=" + releasedYearFilter + "&ordering=" + ordering + "&moviesPerPage=" + moviesPerPage + "&page=" + page + "&genre=" + genre + "&nameOfMovie=" + nameOfMovie);


            const simplified = res.data.map(item => ({
                id: item.id,
                title: item.title,
                releaseYear: item.releaseYear,
                duration: item.duration,
                description: item.description
            }));

            return simplified;
        }catch(err){
            return "nesto nece";
        }
    }

    async GetGenres(){
        try{
            const res = await axios.get(this.accessString +'api/genre/get-genres');
            return res.data;
        }
        catch(err){
            console.log("nesto nece");
            return "nesto nece";
        }
    }
}