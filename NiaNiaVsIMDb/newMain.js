/**
 * Created by tomas on 10.04.2017.
 */

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var events = require('events');


webUrl = 'http://www.imdb.com';
templateForActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';

function predicateBy(prop){
    return function(a,b){
        if( a[prop] < b[prop]){
            return 1;
        }else if( a[prop] > b[prop] ){
            return -1;
        }
        return 0;
    }
}

function getLinkToActor(webUrl, actor, callback){

    request(webUrl, function (error, response, html)
    {
        urlToActor = 'http://www.imdb.com';
        if(!error){
            var $ = cheerio.load(html);

            $('.findList .result_text a[href^="/name/"]').filter(function () {
                var data = $(this);

                if(data.text() === actor){
                    urlToActor += data.attr('href');
                    callback(urlToActor);
                }
            });
        }
    });
}

function getLinksToMovies(urlToActor, responseToClient){

    var i = 0;
    var links = [];
    var credits = 1000;

    request(urlToActor, function (error, response, html) {
        if(!error){

            var $ = cheerio.load(html);

            $('#filmo-head-actor').filter(function () {
                var data = $(this);
                credits = (parseInt(data.contents()[6].data.match(/\d/g).join("")));
            });

            $('#filmo-head-actress').filter(function () {
                var data = $(this);
                credits = (parseInt(data.contents()[6].data.match(/\d/g).join("")));
            });

            $('.filmo-category-section [id^=actor] :not(.filmo-episodes) a[href^="/title/"]').filter(function () {
                var data = $(this);
                links.push(data.attr('href'));
                ++i;

                if(i == credits){
                    DownloadEvent.emit("endDownloandingLinks", links, responseToClient);
                }
            });

            $('.filmo-category-section [id^=actress] a[href^="/title/"]:not(.filmo-episodes)').filter(function () {
                var data = $(this);
                links.push(data.attr('href'));
                ++i;

                if(i == credits){
                    DownloadEvent.emit("endDownloandingLinks", links, responseToClient);
                }
            });

        }else{
            console.log(error);
        }
    });
}

function getInformationAboutFilm(key, films, credits, responseToClient) {

    request(webUrl + key, function(error, response, html) {

        if (!error) {
            var $ = cheerio.load(html);

            var title, release, rating;
            var json = {title: "", release: "", rating: ""};

            $('.title_wrapper h1 a').filter(function () {
                var data = $(this);
                json.release = data.text();
            });

            $('.ratingValue [itemprop=ratingValue]').filter(function () {
                var data = $(this);
                json.rating = data.text();
            });

            $('.title_wrapper>h1').filter(function () {
                var data = $(this);
                title = data.contents()[0].data;
                json.title = title.trim();
            });

            films.push(json);
            if(films.length === credits){
                DownloadEvent.emit("sortAndSend", films, responseToClient);
            }
        }
    });
}

function collectInformation(links, response) {
    films = [];

    for(var i = 0; i < links.length; ++i){
        getInformationAboutFilm(links[i], films, links.length, response);
    }
}

function sortAndSend(films, response) {
    answer = {};
    top3films = [];
    answer["Credits"] = films.length;

    films.sort(predicateBy("rating"));

    for(var j = 0; j < 3; ++j)
        top3films.push(films[j]);

    answer["Top 3"] = top3films;

    response.write(JSON.stringify(answer));
    response.end();
}

function getLinksToFilms(webUrl, movies, ct, responseToClient){
    var credits = 1000;

    request(webUrl, function (error, response, html) {
        if(!error){
            var $ = cheerio.load(html);

            $('#filmo-head-actor').filter(function () {
                var data = $(this);
                credits = (parseInt(data.contents()[6].data.match(/\d/g).join("")));
            });

            $('#filmo-head-actress').filter(function () {
                var data = $(this);
                credits = (parseInt(data.contents()[6].data.match(/\d/g).join("")));
            });

            $('.filmo-category-section [id^=actor] :not(.filmo-episodes) a[href^="/title/"]').filter(function () {
                var data = $(this);
                movies[ct]["links"].push(data.attr('href'));

                if(ct == 1 && movies[ct]["links"] === credits){
                    DownloadEvent.emit("cmpFilms", movies, responseToClient);
                }
            });

            $('.filmo-category-section [id^=actress] a[href^="/title/"]:not(.filmo-episodes)').filter(function () {
                var data = $(this);
                movies[ct]["links"].push(data.attr('href'));

                if(ct == 1 && movies[ct]["links"] === credits){
                    DownloadEvent.emit("cmpFilms", movies, responseToClient);
                }
            });

        }else{
            console.log(error);
        }
    })
}

function cmpFilms(movies, response) {

    for(var i = 0; i < movies[0]['links'].length; i++){
        for(var j = 0; j < movies[1]['links'].length; j++){
            if(movies[0]['links'][i] === movies[1]['links'][j]){
                ++commonFilms;
            }
        }
    }

    response.write(JSON.stringify({'common films': commonFilmes}));
    response.end();
}

function compareActorsMovies(list, response){

    var urlForFindActor;
    var actorName;
    var ct = 0;
    var movies = [];

    for(var j = 0; j < 2; ++j){
        actorName = list[j]["Imie"] + " " +  list[j]["Nazwisko"];

        urlForFindActor = templateForActor;
        urlForFindActor = urlForFindActor.replace("Imie", list[j]["Imie"]).replace("Nazwisko", list[j]["Nazwisko"]);

        getLinkToActor(urlForFindActor, actorName, function (url) {
            movies.push({links: []});

            console.log(url);
            getLinksToFilms(url, movies, ct, response);
            ++ct;
        });
    }
}


var DownloadEvent = new events.EventEmitter();
DownloadEvent.addListener("endDownloandingLinks", collectInformation);
DownloadEvent.addListener("sortAndSend", sortAndSend);
DownloadEvent.addListener("cmpFilms", cmpFilms);





function getInfromationFromUrl(key, responseToClient) {

    request(webUrl + key, function(error, response, html) {

        if (!error) {
            var $ = cheerio.load(html);

            var title, release, rating;
            var json = {title: "", release: "", rating: ""};

            $('.title_wrapper h1 a').filter(function () {
                var data = $(this);
                json.release = data.text();
            });

            $('.ratingValue [itemprop=ratingValue]').filter(function () {
                var data = $(this);
                json.rating = data.text();
            });

            $('.title_wrapper>h1').filter(function () {
                var data = $(this);
                title = data.contents()[0].data;
                json.title = title.trim();
            });
        }

        responseToClient.write(JSON.stringify(json));
        responseToClient.end();
    });
}


function UrlHandler(request, response) {
    movie_url = request.url.match('/title/.*')[0];

    request.on('data', function (data) {
        getInfromationFromUrl(movie_url, response);
    });
}


function NameHandler(request, response) {

    full_name_actor = request.url.replace('/actor=', '');
    actor_name = full_name_actor.split('_')[0];
    actor_surname = full_name_actor.split('_')[1];

    urlForFindActor = templateForActor;
    urlForFindActor = urlForFindActor.replace("Imie", actor_name).replace("Nazwisko", actor_surname);

    result = {"name":full_name_actor, 'films': '', 'top 3': ''};

    request.on('data', function (data) {
        getLinkToActor(urlForFindActor, actor_name + " " + actor_surname, function (urlToActor) {
            getLinksToMovies(urlToActor, response);
        });
    });
}

function CompareHandler (request, response) {
    full_name_actor = request.url.replace('/compare=', '');
    name1 = full_name_actor.split('_')[0];
    surname1 = full_name_actor.split('_')[1];
    name2 = full_name_actor.split('_')[2];
    surname2 = full_name_actor.split('_')[3];

    actors = [];
    wspolneFilmy = 0;

    actors.push({Imie: name1, Nazwisko: surname1});
    actors.push({Imie: name2, Nazwisko: surname2});

    console.log(actors);

    compareActorsMovies(actors, response);
}

function handleRequest(request, response){

    address = request.url.split('=');

    switch(address[0]){
        case '/url':
            UrlHandler(request, response);
            break;
        case '/actor':
            NameHandler(request, response);
            break;
        case '/compare':
            CompareHandler(request, response)
            break;
    }
}
function runServer() {

    var server = http.createServer(handleRequest);

    server.listen(3000, function () {
        console.log("Slucham....");
    });
}

runServer();

