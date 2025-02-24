// JavaScript code for the Book Finder app
// Handles fetching books, searching, filtering, pagination, and displaying results

let currentPage = 0; // Tracks the current page of results
const resultsPerPage = 9; // Number of books displayed per page
let booksData = []; // Stores fetched book data
let lastGenre = ""; // Stores the last selected genre filter
let lastLanguage = ""; // Stores the last selected language filter

// Fetch recommended books (highest-rated) on page load
document.addEventListener("DOMContentLoaded", fetchHighestRatedBooks);

// Event listener for pressing "Enter" in the search box
document.getElementById("search-box").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchBooks();
    }
});

// Event listeners for genre and language filters
document.getElementById("genre-filter").addEventListener("change", checkFilters);
document.getElementById("language-filter").addEventListener("change", checkFilters);

// Fetches the highest-rated books as recommended books
function fetchHighestRatedBooks() {
    fetchBooks("bestseller", true);
}

// Checks if filters have changed and updates book results
function checkFilters() {
    const genre = document.getElementById("genre-filter").value;
    const language = document.getElementById("language-filter").value;
    
    if (genre !== lastGenre || language !== lastLanguage) {
        lastGenre = genre;
        lastLanguage = language;
        updateBooks();
    }
}

// Updates book results based on filters
function updateBooks() {
    let query = lastGenre || "bestseller";
    if (lastLanguage) {
        query += `&langRestrict=${lastLanguage}`;
    }
    fetchBooks(query, false);
}

// Fetches books from the Google Books API
function fetchBooks(query, isRecommended = false) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`;
    document.getElementById("results").innerHTML = "<p>Loading...</p>";
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                booksData = data.items;
                // Sort books by rating if fetching recommended books
                if (isRecommended) {
                    booksData.sort((a, b) => (b.volumeInfo.averageRating || 0) - (a.volumeInfo.averageRating || 0));
                }
                currentPage = 0;
                displayBooks();
            } else {
                booksData = [];
                document.getElementById("results").innerHTML = "<p>There is no book with this title.</p>";
                document.getElementById("next-btn").disabled = true;
            }
        })
        .catch(error => console.error("Error fetching books:", error));
}

// Handles user search
function searchBooks() {
    const query = document.getElementById("search-box").value.trim();
    
    if (!query) {
        fetchHighestRatedBooks(); // Show recommended books when search is cleared
        return;
    }
    
    if (/^\d+$/.test(query)) {
        alert("Please input a valid book title");
        return;
    }
    
    fetchBooks(query);
}

// Displays books on the page
function displayBooks() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    const start = currentPage * resultsPerPage;
    const end = start + resultsPerPage;
    const booksToShow = booksData.slice(start, end);

    booksToShow.forEach(book => {
        const volumeInfo = book.volumeInfo;
        const title = volumeInfo.title || "No Title Available";
        const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author";
        const thumbnail = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "https://via.placeholder.com/120x180";
        const infoLink = volumeInfo.infoLink || "#";
        const rating = volumeInfo.averageRating ? `${volumeInfo.averageRating} ⭐` : "No Rating";

        const bookElement = `
            <div class="book">
                <img src="${thumbnail}" alt="${title}">
                <div class="book-info">
                    <h3>${title}</h3>
                    <p><strong>Author:</strong> ${authors}</p>
                    <p><strong>Rating:</strong> ${rating}</p>
                    <a href="${infoLink}" target="_blank">More Info</a>
                </div>
            </div>
        `;
        resultsDiv.innerHTML += bookElement;
    });

    // Enable/disable pagination buttons
    document.getElementById("prev-btn").disabled = currentPage === 0;
    document.getElementById("next-btn").disabled = booksData.length === 0 || end >= booksData.length;
}

// Handles pagination to next page
function nextPage() {
    if ((currentPage + 1) * resultsPerPage < booksData.length) {
        currentPage++;
        displayBooks();
    }
}

// Handles pagination to previous page
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        displayBooks();
    }
}