/**
 * Created by Ola on 2017-03-28.
 */
var http = require('http');



var recvId = {id:[]};

console.log( );
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
            recvId["id"].push(JSON.parse(data.toString()));
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write(date);

    req.end();
}


function makeGetRequest(key, value) {
    var options = {
        port: 3000,
        hostname: 'localhost',
        path: '/person/' + key + '/' + value,
        method: 'GET',
        headers:{
            'Content-Length' : Buffer.byteLength("123")
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

function makePutRequest(key, value, data) {
    var options = {
        port: 3000,
        hostname: 'localhost',
        path: '/person/' + key + '/' + value,
        method: 'PUT',
        headers:{
            'Content-Length' : Buffer.byteLength(data)
        }
    };


    var req = http.request(options, function(res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write(data);
    req.end();
}

function makeDeleteRequest(key, value) {
    var options = {
        port:3000,
        hostname: 'localhost',
        path: '/person/' + key + '/' + value,
        method: 'DELETE',
        headers:{
            'Content-Length' : Buffer.byteLength("123")
        }
    };

    var req = http.request(options, function (res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write('123');
    req.end();
}

function makePatchRequest(key, value, data) {
    var options = {
        port:3000,
        hostname: 'localhost',
        path: '/person/' + key + '/' + value,
        method: 'PATCH',
        headers:{
            'Content-Length' : Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);

        });
    });

    req.write(data);
    req.end();
}


makePostRequest(JSON.stringify({'name' : 'Olcia'}));
makePostRequest(JSON.stringify({'name' : 'Adaś'}));

setTimeout(function () {
    console.log(recvId['id'][1]['id']);

    makeGetRequest('id', recvId['id'][1]['id']);
    makePutRequest('name', 'Olcia', JSON.stringify({'id':recvId['id'][0]['id'], 'name' : 'Oleńka'}));
    makePutRequest('id', '0061269e94cf1b4436725434e06e8a8d4d8f156c9073a8c30c42f7dad93ad63f',
        JSON.stringify({'id':'0061269e94cf1b4436725434e06e8a8d4d8f156c9073a8c30c42f7dad93ad63f',
                        'name' : 'Agatka'}));
    makeDeleteRequest('id', '0061269e94cf1b4436725434e06e8a8d4d8f156c9073a8c30c42f7dad93ad63f');
    makeDeleteRequest('id', 35);
    console.log(recvId);
    makePatchRequest('id', recvId['id'][0]['id'],
        JSON.stringify({age:21, puppy:"Nia Nia"}));

    makePatchRequest('id', '0061269e94cf1b4436725434e06e8a8d4d8f156c9073a8c30c42f7dad93ad63f',
        JSON.stringify({'id':'0061269e94cf1b4436725434e06e8a8d4d8f156c9073a8c30c42f7dad93ad63f',
            'name' : 'Agatka',
            'puppy': 'Weeee'
        })

    )

    }, 1000);


makeGetRequest('name', 'Olcia');
makeGetRequest('age', 35);


/*var cos = {
    a: [
        {id: 1, name: 'a'},
        {id: 2, name: 'b'},
        {id: 3, name: 'c'}
       ]
};

wut = cos['a'][0]
for(var x in cos['a'][0]){
    console.log(wut[x]);
}*/