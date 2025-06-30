import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddMovieInputArea(){
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [directors, setDirectors] = useState([]);
  const [useExistingDirector, setUseExistingDirector] = useState(true);
  const [directorId, setDirectorId] = useState('');
  const [newDirectorName, setNewDirectorName] = useState('');
  const [newDirectorBirthdate, setNewDirectorBirthdate] = useState('');
  const [newDirectorNationality, setNewDirectorNationality] = useState('');

  useEffect(() => {
    axios.get("https://localhost:7181/"+'api/director')
      .then(res => setDirectors(res.data))
      .catch(err => console.error(err));

    axios.get("https://localhost:7181/"+'api/genre/get-genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));
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
        genres: selectedGenres
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
    } catch (error) {
      console.error('Error creating movie:', error);
      alert('Failed to create movie');
    }
  };

  return (
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
        <select value={directorId} onChange={e => setDirectorId(e.target.value)}
          required className="m-4 w-full p-2 border rounded">
          <option value="">Select Director</option>
          {directors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
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

      <button type="submit" className="m-4 bg-blue-600 text-white px-4 py-2 rounded">
        Add Movie
      </button>
    </form>
  );
}