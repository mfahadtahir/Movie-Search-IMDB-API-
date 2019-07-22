// Jquery for activting the detail modal using bootstrap 
$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})
// event for enter key
var searchinput = document.getElementById('query');
searchinput.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        searchThisMovie()
    }
});
 
function searchThisMovie() {
    var apikey = "f4e09aec";
    //DOM elements 
    var query = document.querySelector("#query").value;
    var result = document.querySelector("#result");
    var pagelist = document.getElementById('pagelist');
    //when the function is called second time(searched for another movie) this clear the previous record 
    result.innerHTML = '';
    pagelist.innerHTML = '';
    // First API call using name which return only a few properties like, imdb ID and date
    //fetch is a 'promise' it gives returns the value in .then() if succeded and .catch() if any error occur
    
    // here it fetch return firstSearch which was itself another promise so converting it into json(normal javascript object)
    //we have to call .then() again to get our data out
    fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apikey}`)
        .then(firstSearch => {
            firstSearch.json()
                .then((res) => {
                    //then we got our server response and in response we found our Search objects in an array form 
                    var movies = res.Search;
                    console.log(movies.length, movies);
                    // a loop to make packets of 6 movies per packet, to make pagination
                    var pages = 1, counter = 0, pageMovies = [];
                    for (var i = 0; i < movies.length; i++) {
                        pageMovies.push(movies[i]);
                        counter++;
                        //we use localStorage to packets data
                        localStorage.setItem(pages, JSON.stringify(pageMovies));
                        // after making a packet of 6 movies we change the page(make a new packet) and clear out our box to make a new packet
                        if (counter % 6 == 0) {
                            pages++;
                            counter = 0;
                            pageMovies.pop();
                            pageMovies.pop();
                            pageMovies.pop();
                            pageMovies.pop();
                            pageMovies.pop();
                            pageMovies.pop();
                        }
                    }
                    // making pageination button
                    for (var pagebutton = 0; pagebutton < pages; pagebutton++) {
                        pagelist.innerHTML +=
                            `
                        <li onclick = 'pageChange(${pagebutton + 1})' class="page-item"><a class="page-link" href="#">${pagebutton + 1}</a></li>
                        `
                    }
                    //when the page load the function show the packets associated with page one
                    pageChange(1);
                });
        })
        // incase of any error
        .catch((err) => {
            alert(err);
        })
};


// this function is called when you click on a button to change page
const pageChange = (pages) => {
    // to retrive page from local storage
    var movies = JSON.parse(localStorage.getItem(pages));
    console.log(pages);
    // when the function is called second time i erase he data from the first time
    result.innerHTML = '';
    for (var i = 0; i < movies.length; i++) {
        // to make loaders and behind sent a request for a every movie using  imdb id saved perviously 
        // here we use that imdb id to retieve all the related data 
        result.innerHTML +=
            `
        <div class='col-sm-12 col-md-6 col-lg-4 d-flex justify-content-center' id='${movies[i].imdbID}-loader'>
            <div class="d-flex justify-content-center mb-5">
                <div class="card" style="width: 18rem;">
                    <div class="spinner-border d-flex justify-content-center" role="status">
                        <span class="sr-only m5">Loading...</span>
                    </div>
                </div>    
            </div>
        </div>
        `;
        //setting an invoke function as a closure function to save value of 'i' for every request
        (function forSavingI(i) {
            fetch(`https://www.omdbapi.com/?i=${movies[i].imdbID}&apikey=f4e09aec`)
            .then(initialObj => {
                initialObj.json()
                .then(movie => {
                    console.log(movie);
                    //sending requests  for all the movies and setting a timeout soo that UI show after all the data is already here
                            setTimeout(() => {
                                let removeLoading = document.getElementById(`${movie.imdbID}-loader`);
                                // creating all posters and their respective modals(divs for the details)
                                removeLoading.innerHTML =
                                    `
                                    <div class=" mb-2 mt-2 d-flex justify-content-center">
                                        <div class="card" style="width: 18rem;">
                                            <img src=${movie.Poster} style='height: 300px' class="card-img-top" alt="..." />
                                            <div class="card-body">
                                                <h5 class="card-title ">${movie.Title}</h5>
                                                <button type="button" data-toggle="modal" data-target="#${movie.imdbID}-modal" class=" btn btn-secondary btn-lg btn-block">Details</button>
                                            </div>
                                        </div>
                                    </div>



                                    <div class="modal fade" id="${movie.imdbID}-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="exampleModalLabel">${movie.Title}</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <img src=${movie.Poster} class="card-img-top" alt="..." />
                                                    <ul class="list-group list-group-flush">
                                                      <li class="list-group-item">Actore: ${movie.Actors}</li>
                                                      <li class="list-group-item">Awards: ${movie.Awards}</li>
                                                      <li class="list-group-item">Country: ${movie.Country}</li>
                                                      <li class="list-group-item">Genre: ${movie.Genre}</li>
                                                      <li class="list-group-item">Language: ${movie.Language}</li>
                                                      <li class="list-group-item">Rated: ${movie.Rated}</li>
                                                      <li class="list-group-item">Released: ${movie.Released}</li>
                                                      <li class="list-group-item">Runtime: ${movie.Runtime}</li>
                                                      <li class="list-group-item">Writer: ${movie.Writer}</li>
                                                      <li class="list-group-item">Year: ${movie.Year}</li>
                                                      <li class="list-group-item">IMDB ID: ${movie.imdbID}</li>
                                                      <li class="list-group-item">IMDB Rating: ${movie.imdbRating}</li>
                                                      <li class="list-group-item">Plot: ${movie.Plot}</li>

                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        `;
                    }, 2000)
                })
            })

        })(i)

    }
}
