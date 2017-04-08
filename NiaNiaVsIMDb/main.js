var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

url = 'http://www.imdb.com/title/tt1229340/';
urlForFindActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';
urlToActor = 'http://www.imdb.com';
webUrl = 'http://www.imdb.com';
films = [];

function findActor(actorName, actorSurname) {

    urlForFindActor = urlForFindActor.replace("Imie", actorName);
    urlForFindActor = urlForFindActor.replace("Nazwisko", actorSurname);

    var actor = actorName + " " + actorSurname;

    request(urlForFindActor, function (error, response, html)   {
        if(!error){
            var $ = cheerio.load(html);

            $('.findList .result_text a[href^="/name/"]').filter(function () {
                var data = $(this);

                if(data.text() === actor){
                    urlToActor += data.attr('href');
                    takeMuwis();
                }
            });
        }
    });
}

function predicateBy(prop){
    return function(a,b){
        if( a[prop] > b[prop]){
            return 1;
        }else if( a[prop] < b[prop] ){
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

              console.log(data.contents()[6].data);
            });

            $('.filmo-category-section [id^=actor] a[href^="/title/"]').filter(function () {
                var data = $(this);
                //console.log(data.);
                getInformationAboutFilm(data.attr('href'));
            });

            films.sort(predicateBy('raiting'));

            console.log(films);

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

            $('.ratingValue :nth-child(1) span').filter(function () {
                var data = $(this);
                json.rating = data.text();

                if(json.rating = "")
                    json.raiting = 0;
            });

            $('.title_wrapper>h1').filter(function () {
                var data = $(this);
                title = data.contents()[0].data;
                json.title = title;
            });

            films.push(json);

            console.log(films);
        }
    });
}

findActor("Tom", "Hanks");
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