var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

url = 'http://www.imdb.com/title/tt1229340/';
urlForFindActor = 'http://www.imdb.com/find?ref_=nv_sr_fn&q=Imie+Nazwisko&s=all';
webUrl = 'http://www.imdb.com';

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
                    console.log(data.attr('href'));
                    // http://prntscr.com/est0ou
                }
                // TO DO co gdy nie ma osoby
            });
        }
    })
};

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