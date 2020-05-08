import React, { Component } from 'react';
import './Movies.css';
import axios from 'axios';

export default class Movies extends Component{

    constructor(props){
        super(props);
        this.state = {
            movies: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.getMovies = this.getMovies.bind(this);
    }


    handleChange(e){
        var input = e.target.value;
        console.log(input);
        this.getMovies(input);
    }

    getMovies(searchText){
        let master = this;
        axios.get('https://www.omdbapi.com?apikey=3fe96115&s=' + searchText)
        .then((
            function(res){
                console.log(master.state);
                if(res.data.Response === 'False'){
                    master.setState({movies: []});
                }else{
                    master.setState({movies: res.data.Search});
                }
            })
        )
        .catch(
            function(err){
                console.log(err);
            }
        )
    }

    render(){
        const movies = this.state.movies;
        let cards = "";

        if(movies === []){
            cards = <h2 className = 'card'>No Results</h2>;
        }else{
            /*
            for(var m in movies){
                console.log(m);
                let posterLink = "";
                if(movies[m].Poster === "N/A" || movies[m].Poster === undefined){
                    posterLink = "";
                }else{
                    posterLink = movies[m].Poster;
                }
                cards = <div className = 'card'><img src={posterLink} alt=""/></div>;
            }
            */
           cards = movies.map((m) => <div className = 'card'><img src={m.Poster} alt = {m.Title}/></div>);
        }

        return(
        <div className = 'App-body'>
            <input className = 'App-searchbar' onChange={this.handleChange}></input>
            <div className = 'App-movieContainer'>{cards}</div>
        </div>
        )
    }
}
