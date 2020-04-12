import React from 'react';
import './Movies.css';

export default function Movies(){

    const axios = require('axios').default;

    function handleChange(e){
        var input = e.target.value;
        console.log(input);
        getMovies(input);
    }

    function getMovies(searchText){
        var movies;
        axios.get('http://www.omdbapi.com?apikey=3fe96115&s=' + searchText)
        .then((
            function(res){
                console.log(res.data.Response);
                if(res.data.Response === 'False'){
                    movies = [];
                    console.log("Search word is too broud!");
                }else{
                    movies = res.data.Search;
                    console.log(movies);
                    displayMovies(movies);
                }
            })
        )
        .catch(
            function(err){
                console.log(err);
            }
        )
    }

    function displayMovies(movieList){
        
    }

    return(
        <div className = 'App-body'>
            <input className = 'App-searchbar' id="MovieInput" onChange={handleChange}></input>
        </div>
    )
}
