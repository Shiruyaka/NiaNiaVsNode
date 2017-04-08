var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

url = 'http://www.imdb.com/title/tt1229340/';
urlForFindActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';
urlToActor = 'http://www.imdb.com';
webUrl = 'http://www.imdb.com';
films = [];
i = 0;
credits = 0;

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
                        console.log(films[j]['title']);
                    }



            }
        }
    });
}



findActor("Ana", "de Armas");
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