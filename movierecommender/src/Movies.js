import React, { Component } from 'react';
import './Movies.css';
import axios from 'axios';
import data from './userhistory.json';
import { Line } from "react-chartjs-2";

export default class Movies extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allUser: data,
            currentUser: Object.keys(data)[0],
            movies: [],
            recommendation: {
                recommended:{},
                chart:{}
            }
        };
        this.handle_search = this.handle_search.bind(this);
        this.get_movies = this.get_movies.bind(this);
        this.handle_recommendations = this.handle_recommendations.bind(this);
        console.log(data);
    }

    handle_search(e) {
        var input = e.target.value;
        console.log(input);
        this.get_movies(input);
    }

    get_movies(searchText) {
        let master = this;
        axios.get('https://www.omdbapi.com?apikey=3fe96115&s=' + searchText)
            .then((
                function (res) {
                    if (res.data.Response === 'False') {
                        master.setState({ movies: [] });
                    } else {
                        master.setState({ movies: res.data.Search });
                    }
                    console.log(master.state);
                })
            )
            .catch(
                function (err) {
                    console.log(err);
                }
            )
    }

    get_movie_by_id = async (id) => {
    }

    handle_toggle() {
        let toggle_target = document.getElementById("App-dashboard");
        let toggle_btn = document.getElementById("toggle");
        //0x8801 = &equiv;, 0x215 = &timesl;
        if (toggle_btn.innerHTML.charCodeAt(0) === 215) {
            toggle_btn.innerHTML = '&equiv;'
            toggle_target.classList.remove('open');
        } else {
            toggle_btn.innerHTML = '&times;'
            toggle_target.classList.add('open');
        }
    }

    rate_movie(e) {
        let temp_data = this.state.allUser;
        let temp_user = this.state.currentUser;
        temp_data[temp_user][e.target.parentElement.id] = parseInt(e.target.innerHTML);
        console.log(this.state.currentUser + " just rated " + e.target.parentElement.id + " :  " + e.target.innerHTML);
        console.log(temp_data[this.state.currentUser]);
    }

    handle_select_user(e) {
        this.handle_recommendations();
        var btns = document.getElementById('user-list').children;
        console.log(e.target);
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove('current');
        }
        e.target.classList.add('current');
        this.setState({
            currentUser: e.target.id
        });
    }

    get_Common(userA, userB) {
        let moviesA = Object.keys(data[userA]);
        let moviesB = Object.keys(data[userB]);
        return moviesA.filter(Set.prototype.has, new Set(moviesB));
    }

    get_Avg(userName, userMovies) {
        var sum = 0;
        for (var i = 0; i < userMovies.length; i++) {
            sum = sum + data[userName][userMovies[i]];
        }
        return (sum / Object.keys(data[userName]).length).toFixed(2);
    }

    get_Index(people) {
        let m = {};
        for (var i = 0; i < people.length; i++) {
            for (var history in data[people[i]]) {
                if (m[history] === undefined) {
                    m[history] = [];
                }
                var temp = '{"' + people[i] + '": ' + data[people[i]][history] + '}';
                m[history].push(JSON.parse(temp));
            }
        }
        return m;
    }

    handle_recommendations() {
        //calculate my avg
        var currentUser = this.state.currentUser;
        var similarities = {};
        //compare with others rating
        for (var newUser in data) {
            var commonMovies = this.get_Common(currentUser, newUser);
            if (newUser !== currentUser && commonMovies.length !== 0) {
                var currentAvg = this.get_Avg(currentUser, commonMovies);
                var newAvg = this.get_Avg(newUser, commonMovies);
                var simTop = 0;
                var simBot = 0;
                var currentSum = 0;
                var newSum = 0;
                for (var i = 0; i < commonMovies.length; i++) {
                    simTop += ((data[newUser][commonMovies[i]] - newAvg) * (data[currentUser][commonMovies[i]] - currentAvg));
                    currentSum += Math.pow(data[currentUser][commonMovies[i]] - currentAvg, 2);
                    newSum += Math.pow(data[newUser][commonMovies[i]] - newAvg, 2);
                }
                simBot = Math.sqrt(currentSum * newSum);
                if (simBot !== 0 && simTop / simBot > 0) {
                    similarities[newUser] = (simTop / simBot).toFixed(4);
                }
            }
        }
        //
        console.log({ 'similarities': similarities });
        var recommendations = {};
        var relevantIndex = this.get_Index(Object.keys(similarities));
        console.log({ 'relevant index': relevantIndex });
        for (var m in relevantIndex) {
            if (data[currentUser][m] === undefined) {
                let mTop = 0.0, mBot = 0.0;
                //calculate recommendation
                for (var p in similarities) {
                    if (data[p][m] !== undefined) {
                        mTop = mTop + parseFloat(similarities[p]);
                        mBot = mBot + (parseFloat(similarities[p]) * parseFloat(data[p][m]));
                    }
                }
                var result = mTop * mBot;
                if (parseFloat(result) > 0) {
                    recommendations[m] = (1 / result).toFixed(4);
                }
            }
        }
        console.log({ 'recommendations': recommendations });
        //
        const display_data = {
            recommended: {
                friends: this.object_to_array(similarities),
                movies: this.object_to_array(recommendations)
            },
            chart: {
                labels: Object.keys(similarities),
                datasets: [
                    {
                        label: 'Movie Interest Similarity',
                        data: Object.values(similarities),
                        fill: true,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        borderColor: "#a07956"
                    }
                ]
            }
        };
        console.log(display_data);
        //
        this.setState({recommendation: display_data});
    }

    object_to_array(data) {
        var sorted_data = [];
        for (var k in data) {
            sorted_data.push([k, data[k]]);
        }

        sorted_data.sort(function (a, b) {
            return b[1] - a[1];
        });
        return sorted_data;
    }

    fetch_posters = async(data) => {
        var posters = [];
        Promise.all(data.map(async(movie) => {
            try{
                await axios.get('https://www.omdbapi.com?apikey=3fe96115&i=' + movie[0]).then(res => {
                    posters.push(res.data);
                });
            }catch(err){console.log(err);}
        }));
        console.log(posters);
        return posters;
    }

    render() {
        const movies = this.state.movies;
        let movie_search = "";
        if (movies === []) {
            movie_search = <h2>No Results</h2>;
        } else {
            movie_search = movies.map((m) =>
                <div className='card' key={m.imdbID}>
                    <img src={m.Poster} alt={m.Title} />
                    <div id={m.imdbID} className="rating_buttons">
                        <section onClick={this.rate_movie.bind(this)}>0</section>
                        <section onClick={this.rate_movie.bind(this)}>1</section>
                        <section onClick={this.rate_movie.bind(this)}>2</section>
                        <section onClick={this.rate_movie.bind(this)}>3</section>
                        <section onClick={this.rate_movie.bind(this)}>5</section>
                    </div>
                    <p>{m.Title}</p>
                </div>
            );
        }

        return (
            <div className='App-body'>
                <div className='App-search'>
                    <h1 id='title'>Do you have similar taste in movie?<br />Let's find out.</h1>
                    <h2 id='prompt'>The ultimate movie recommender and similarity calculator.</h2>
                    <input id='searchbar' onChange={this.handle_search} placeholder="Search movie name"></input>
                    <button id='btn'>Calculate between friends</button>
                </div>
                <div className='App-movieContainer'>{movie_search}</div>
                <div className='toggle' id='toggle' onClick={this.handle_toggle}>&equiv;</div>
                <div className='App-dashboard' id="App-dashboard">
                    <div className='translucent-glass'></div>
                    <div className='user-list'><ul id='user-list'>
                        {
                            Object.keys(this.state.allUser).map((key, i) => {
                                return <li
                                onClick={this.handle_select_user.bind(this)}
                                id={key}
                                key={key}>
                                    {key}
                                </li>
                            })
                        }
                    </ul></div>
                    <div className='dashboard'>
                        <div id='recommendations'>
                            <h2>Recommended</h2>
                            {this.state.recommendation.recommended.movies && (
                                <RecMovies data={this.state.recommendation.recommended.movies} asyncFn={this.fetch_posters}/>
                            )}
                        </div>
                        <div id='chart'>
                            <h2>Analytics</h2>
                            <Line data={this.state.recommendation.chart} options={{ maintainAspectRatio: false }} />
                        </div>
                        <div id='top-friends'>
                            <h2>Friends</h2>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



const RecMovies = (props) => {
    return (
    <div onLoad={async() => {props.movie_data = await props.asyncFn(props.data)}} id='posters'>
        {
            props.movie_data.map((movie) => {
            return <img src={movie.Poster} alt={movie.Title} key={movie.imdbID}/>
        })
        }
    </div>
    );
};