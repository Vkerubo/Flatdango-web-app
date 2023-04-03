// Add an event listener to the document object to make sure that the JavaScript code runs after the HTML content has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films'); // Get the HTML element where the movie list will be displayed
  
    // Fetch movie data from the server and display it on the page
    fetch('http://localhost:3000/films')
      .then(response => response.json()) // Parse the response as JSON data
      .then(data => {
        // For each movie in the response data, create a new list item and add it to the movie list
        data.forEach(movie => {
          const movieItem = document.createElement('li'); // Create a new list item element
          movieItem.classList.add('film', 'item'); // Add classes to the list item element
          // Set the content of the list item element using the movie data
          movieItem.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="film-details">
              <h3>${movie.title}</h3>
              <p>${movie.runtime}</p>
              <p>${movie.showtime}</p>
              <button class="buy-ticket" data-id="${movie._id}" data-showtime="${movie.showtime}">${movie.capacity} Tickets Available</button>
            </div>
          `;
          filmsList.appendChild(movieItem); // Add the list item element to the movie list
        });
      });
  });

// Add a new movie to the database when the "Add Movie" form is submitted
const addForm = document.getElementById('add-form');

addForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from submitting normally

  // Create a new movie object using the form data
  const formData = new FormData(addForm);
  const newMovie = {
    title: formData.get('title'),
    poster: formData.get('poster'),
    runtime: formData.get('runtime'),
    showtime: formData.get('showtime'),
    capacity: formData.get('capacity')
  };

  // Send a POST request to the server to add the new movie to the database
  fetch('http://localhost:3000/films', {
    method: 'POST', // Use the POST method
    headers: {
      'Content-Type': 'application/json' // Set the content type of the request body to JSON
    },
    body: JSON.stringify(newMovie) // Convert the movie object to JSON and set it as the request body
  })
  .then(response => response.json()) // Parse the response as JSON data
  .then(data => console.log(data)) // Log the response data to the console
  .catch(error => console.error(error)); // Log any errors to the console

  addForm.reset(); // Reset the form fields to their default values
});

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const filmsList = document.getElementById('films');


searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchTerm = searchInput.value;

  fetch(`http://localhost:3000/films/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      // Clear the current movie list
      filmsList.innerHTML = '';

      // Display the search results
      data.forEach(movie => {
        const movieItem = createMovieItem(movie);
        filmsList.appendChild(movieItem);
      });
    })
    .catch(error => console.error(error));

  searchInput.value = '';
});



// Add event listeners to the edit and delete buttons in each movie list item
filmsList.addEventListener('click', (event) => {
  const movieItem = event.target.closest('.film.item');
  const movieId = movieItem.dataset.id;

  if (event.target.classList.contains('edit')) {
    // Send a PUT request to the server with the updated movie data
    const updatedMovie = {
      // Get the updated movie data from the user input fields
      title: movieItem.querySelector('.title-input').value,
      runtime: movieItem.querySelector('.runtime-input').value,
      showtime: movieItem.querySelector('.showtime-input').value,
      poster: movieItem.querySelector('.poster-input').value
    };


    fetch(`http://localhost:3000/films/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedMovie)
    })
      .then(response => response.json())
      .then(data => {
        // Update the movie item with the new data
        movieItem.innerHTML = createMovieItem(data).innerHTML;
      })
      .catch(error => console.error(error));
  }

  if (event.target.classList.contains('delete')) {

    // Send a DELETE request to the server to delete the movie
    fetch(`http://localhost:3000/films/${movieId}`, {
      method: 'DELETE'
    })
      .then(response => {
        // Remove the movie item from the list
        filmsList.removeChild(movieItem);
      })
      .catch(error => console.error(error));
  }
});


// Add an event listener to the buy ticket button in each movie list item
filmsList.addEventListener('click', (event) => {
  if (event.target.classList.contains('buy-ticket')) {
    const movieId = event.target.dataset.id;
    const showtime = event.target.dataset.showtime;

    // Send a POST request to the server to buy a ticket for the movie and showtime
    fetch(`http://localhost:3000/films/${movieId}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ showtime: showtime })
    })
      .then(response => response.json())
      .then(data => {
        // Update the ticket availability on the button
        event.target.textContent = `${data.capacity} Tickets Available`;
        event.target.dataset.showtime = data.showtime;
      })
      .catch(error => console.error(error));
  }
});