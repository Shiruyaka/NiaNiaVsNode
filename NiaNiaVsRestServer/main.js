/**
 * Created by Ola on 2017-03-28.
 */
var http = require('http');


function makePostRequest(date) {

    var options = {
        port: 3000,
        hostname: 'localhost',
        path: '/persons',
        method: 'POST',
        headers:{
            'Content-Length' : Buffer.byteLength(date)
        }
    };

    var req = http.request(options, function(res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write(date);

    req.end();
}

function makeGetRequest() {
    var options = {
        port: 3000,
        hostname: 'localhost',
        path: '/person/name/Olcia',
        method: 'GET',
        headers:{
            'Content-Length' : Buffer.byteLength(100)
        }
    };

    var req = http.request(options, function(res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write("123");
    req.end();
}



makePostRequest(JSON.stringify({'name' : 'Olcia'}));
makePostRequest(JSON.stringify({'name' : 'Adaś'}));
makeGetRequest();