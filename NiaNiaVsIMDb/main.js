var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

url = 'http://www.imdb.com/title/tt1229340/';
templateForActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';
urlToActor = 'http://www.imdb.com';
webUrl = 'http://www.imdb.com';
films = [];
top3films = {};
//i = 0;
credits = 0;

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
    })
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
                    console.log(top3films);
                i= 0;

            }
        }
    });
}


actors = [];

actors.push({Imie:"Kunal", Nazwisko:"Nayyar"});
actors.push({Imie:"Michalina", Nazwisko:"Labacz"});

movies = [];

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




function getLinksToFilms(webUrl, movies, ct){

    console.log(ct);
    console.log(webUrl);
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


function compareActorsMuvis(list){

    var urlForFindActor;
    var actorName;
    var ct = 0;
    var movies = [];

    for(var j = 0; j < 2; ++j){
        actorName = list[j]["Imie"] + " " +  list[j]["Nazwisko"];

        urlForFindActor = templateForActor;
        urlForFindActor = urlForFindActor.replace("Imie", list[j]["Imie"]).replace("Nazwisko", list[j]["Nazwisko"]);

        getLinkToActor(urlForFindActor, actorName, function (url) {
            console.log(url);
            movies.push({links: []});
            console.log(movies[0]['links']);
            getLinksToFilms(url, movies, ct);
            ++ct;
        });
    }

    setTimeout(function () {

        console.log(movies);

        var commonFilms = 0;
        for(var i = 0; i < movies[0]['links'].length; i++){
            for(var j = 0; j < movies[1]['links'].length; j++){
                if(movies[0]['links'][i] === movies[1]['links'][j]){
                    ++commonFilms;
                }
            }
        }
        console.log(commonFilms);
    }, 10000);
}


// zerowanie films po każdej funkcji i, films, top3films ?
// urlToFindActor potem nie zawiera imie, nazwisko i nie może wyszukiwać kolejny osob, ale i tak asynchronicznie :<

//findActor("Ana", "de Armas");
compareActorsMuvis(actors);
//getInformationAboutFilm('/title/tt0243585/?ref_=nm_flmg_act_30');
/*request(url, function(error, response, html){
 if(!error){
 var $ = cheerio.load(html);

 var title, release, rating;
 var json = { title : "", release : "", rating : ""};

 $('.title_wrapper h1 a').filter(function(){
 var data = $(this);
 json.release = data.text();
 });

 $('.ratingValue :nth-child(1) span').filter(function () {
 var data = $(this);
 json.rating = data.text();
 });

 $('.title_wrapper>h1').filter(function () {
 var data = $(this);

 console.log(data.contents());
 title = data.contents()[0].data;
 json.title = title;
 });

 console.log(json);
 }
 });*/