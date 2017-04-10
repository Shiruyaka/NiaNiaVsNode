var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var events = require('events');

templateForActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';
urlToActor = 'http://www.imdb.com';
webUrl = 'http://www.imdb.com';
films = [];
top3films = {};
i = 0;
credits = 0;
wspólneFilmy = 0;

function findActor(actorName, actorSurname) {
    var urlForFindActor = templateForActor;
        urlForFindActor = urlForFindActor.replace("Imie", actorName);
        urlForFindActor = urlForFindActor.replace("Nazwisko", actorSurname);

    var actor = actorName + " " + actorSurname;


    request(urlForFindActor, function (error, response, html)   {
        urlToActor = 'http://www.imdb.com';
        console.log(urlForFindActor);
        if(!error){
            var $ = cheerio.load(html);

            $('.findList .result_text a[href^="/name/"]').filter(function () {
                var data = $(this);

                if(data.text() === actor){
                    urlToActor += data.attr('href');
                    console.log(urlToActor);
                    takeMuwis();
                }
            });
        }
    });
}

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

function takeMuwis(){
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
                getInformationAboutFilm(data.attr('href'));
            });

            $('.filmo-category-section [id^=actress] a[href^="/title/"]:not(.filmo-episodes)').filter(function () {
                var data = $(this);
                getInformationAboutFilm(data.attr('href'));
            });

        }else{
            console.log(error);
        }
    });
}


function getInformationAboutFilm(key) {
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
                json.title = title;
            });

            films.push(json);

            ++i;

            if(i === credits){

                films.sort(predicateBy("rating"));
                    for(var j = 0; j < 3; ++j){
                        //console.log(films[j]['title']);
                        top3films[j + 1] = films[j];
                    }
                i= 0;

            }
        }
    });
}


actors = [];

actors.push({Imie:"Kunal", Nazwisko:"Nayyar"});
actors.push({Imie:"Johnny", Nazwisko:"Galecki"});

movies = [];

function getLinkToActor(webUrl, actor, callback){

    console.log(actor);
    request(webUrl, function (error, response, html)
    {
        urlToActor = 'http://www.imdb.com';
        if(!error){
            var $ = cheerio.load(html);

            $('.findList .result_text a[href^="/name/"]').filter(function () {
                var data = $(this);

                if(data.text() === actor){
                    console.log("Tutej");
                    urlToActor += data.attr('href');
                    callback(urlToActor);
                }
            });
        }
    });
}




function getLinksToFilms(webUrl, movies, ct){

    request(webUrl, function (error, response, html) {
        if(!error){
            var $ = cheerio.load(html);

            $('.filmo-category-section [id^=actor] :not(.filmo-episodes) a[href^="/title/"]').filter(function () {
                var data = $(this);
                movies[ct]["links"].push(data.attr('href'));
            });

            $('.filmo-category-section [id^=actress] a[href^="/title/"]:not(.filmo-episodes)').filter(function () {
                var data = $(this);
                movies[ct]["links"].push(data.attr('href'));
            });

        }else{
            console.log(error);
        }
    })
}


function compareActorsMuvis(list, callback){

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
            getLinksToFilms(url, movies, ct);
            ++ct;
        });
    }

    setTimeout(function () {

//        console.log(movies);

        var commonFilms = 0;
        for(var i = 0; i < movies[0]['links'].length; i++){
            for(var j = 0; j < movies[1]['links'].length; j++){
                if(movies[0]['links'][i] === movies[1]['links'][j]){
                    ++commonFilms;
                }
            }
        }
        callback(commonFilms);
    }, 100000);


}


function UrlHandler(request, response) {
    movie_url = request.url.match('/title/.*')[0];

    request.on('data', function (data) {

        getInformationAboutFilm(movie_url);

        setTimeout(function () {

            console.log(films);
            response.write(JSON.stringify(films));
            response.end();

        }, 10000);

    });
}


function getLinksToMovies(evList){
    console.log('Tabletka');
    credits = 1000;
    links = [];
    ct = 0;

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
                ++ct;

                if(ct === credits)
                    callback(credits, links);
                //getInformationAboutFilm(data.attr('href'));
            });

            $('.filmo-category-section [id^=actress] a[href^="/title/"]:not(.filmo-episodes)').filter(function () {
                var data = $(this);
                links.push(data.attr('href'));
                ++ct;

                if(ct === credits)
                    evList.emit('endDownloadingLinks', credits, links);
                    callback(credits, links);
                //getInformationAboutFilm(data.attr('href'));
            });
        }else{
            console.log(error);
        }
    });
}

function CollectInformation

function NameHandler(request, response) {


    full_name_actor = request.url.replace('/actor=', '');
    actor_name = full_name_actor.split('_')[0];
    actor_surname = full_name_actor.split('_')[1];

    urlForFindActor = templateForActor;
    urlForFindActor = urlForFindActor.replace("Imie", actor_name).replace("Nazwisko", actor_surname);

    result = {"name":full_name_actor, 'films': '', 'top 3': ''};

    films = [];
    top3films = {};

    request.on('data', function (data) {

        getLinkToActor(urlForFindActor, actor_name + " " + actor_surname, function (urlToActor) {
            getLinksToMovies(urlToActor, function (credits, links) {

            });
        });

        setTimeout(function () {
            result['films'] = films;
            console.log(top3films);
            result['top 3'] = top3films;
            response.write(JSON.stringify(result));
            response.end();

        }, 20000);

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

    compareActorsMuvis(actors, function (commonFilmes) {
        response.write(JSON.stringify({'common films': commonFilmes}));
        response.end();
    });

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



// ZEROWANIE FILMS ! DONE
// resetowanie actors ! DONE
// resetowanie ilości wspólnych filmów DONE
// nie działa mi compare dla Emmy Watson i Toma Hanksa -> wypisuje 23 filmy :v