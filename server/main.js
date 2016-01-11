/**
 * Created by Waliur on 4/9/2015.
 */

var $ = require("jquery");
var http = require("http");
var DAO = require("./DAO");
//var jquery = require('jquery');



// A variable that gets incremented with each request so we get a unique ID
// for every request to be able to track log messages better.
var reqID = 1;

/**
 * Define the core server.
 *
 * @param req  The HTTP request object.
 * @param resp The HTTP response object.
 */
function serverCore(req, resp) {


    try {

        reqID = reqID + 1;

        // This object will contain all information pertaining to this request and
        // will be passed around as needed to process the request.
        // req .... request object
        // resp ... response object
        // data ... an object constructed from the body for POST and PUT requests
        // ident .. identifier (final /xxxx on url)
        var dataObj = {
            id : new Date().getTime() + reqID, req : req, resp : resp,
            data : null, ident : null
        };

        console.log(dataObj.id + ": " + req.method + " " + req.url);

        // If the incoming request is an OPTIONS request then that almost certainly
        // means the caller is developing on a desktop in Firefox.  In this case,
        // we need to send back a specific set of headers and no response to tell
        // the browser it can go ahead and re-send the POST or PUT it was originally
        // intending to send.
        if (req.method == "OPTIONS") {
            resp.writeHead(
                200, {
                    "Content-Type" : "text/plain",
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Max-Age" : "1000",
                    "Access-Control-Allow-Headers" :
                        "origin,x-csrftoken,content-type,accept"
                }
            );
            resp.end("");
            return;
        }

        // Read (GET), Update (PUT) and Delete (DELETE) requests all require the
        // ID of the object to operate on be passed as the final part of the URL,
        // so for any method other than POST we'll get that value now.
        if (req.method != "POST") {
            dataObj.ident = req.url.substr(req.url.lastIndexOf("/") + 1);
        }

        // At this point, ident should be either an operation type (meaning
        // "appointment", "contact", "note" or "task") or it's a valid ID of an
        // item.  We need to ensure that the value is either null or is a valid ID.
        // Null is acceptable in the case of a "get all" request, but it's that
        // case where we'd have an operation type at this point (or in the case of
        // an invalid request of course).  So, we'll do a regex against it to
        // validate as a 24-digit hexadecimal number, which is the form a valid ID
        // takes.  Bottom line: ident will either be a valid ID or null after this.
        if (dataObj.ident != null) {
            dataObj.ident = dataObj.ident.match(/^[a-f0-9]{24}$/i);
        }

        // If it's a GET or DELETE request then we're done here, simply call
        // serverCorePart2() to continue the process.
        if (req.method == "GET" || req.method == "DELETE") {

            serverCorePart2(dataObj);

            // If it's a POST or PUT request then we have to get the body content.
        } else if (req.method == "POST" || req.method == "PUT") {

            // This is done asynchronously.
            var body = "";
            req.on("data", function (inData) {
                body += inData;
            });

            // When complete, convert the body to an object (it's a string of JSON
            // at this point) and continue processing in serverCorePart2().
            req.on("end", function() {
                if (body == null) {
                    body = "";
                }
                dataObj.data = JSON.parse(body);
                //console.log("I am here");
                serverCorePart2(dataObj);
            });

            // Not a supported HTTP method.
        } else {

            console.log(dataObj.id + ": Unsupported method: " + req.method);
            completeResponse(
                dataObj, 405, "text", "Unsupported method: " + req.method
            );

        }

        // Handle any exceptions that occur.
    } catch (e) {
        console.log(dataObj.id + ": Exception processing request (part 1): " + e);
        completeResponse(dataObj, 500, "text", "Exception: " + e);
    }

}; // End serverCore().


/**
 * The second half of our core server processing.
 *
 * @param dataObj The dataObj object created in serverCore().
 */
function serverCorePart2(dataObj) {

    try {


        // Log input data.
        console.log(dataObj.id + ": ident: " + dataObj.ident + " ServerCorePart2");
        console.log(dataObj.id + ": data: " + JSON.stringify(dataObj.data));

        // See if we have a supported operation.  If not, return an error.
        var opType = "";
        if (dataObj.req.url.toLowerCase().indexOf("/headache") != -1) {
            opType = "headache";
        } else if (dataObj.req.url.toLowerCase().indexOf("/user") != -1) {
            opType = "user";
        } else if (dataObj.req.url.toLowerCase().indexOf("/food") != -1) {
            opType = "food";
        } else if (dataObj.req.url.toLowerCase().indexOf("/drink") != -1) {
            opType = "drink";
        } else if (dataObj.req.url.toLowerCase().indexOf("/exercise") != -1) {
            opType = "exercise";
        } else if (dataObj.req.url.toLowerCase().indexOf("/sleep") != -1) {
            opType = "sleep";
        } else if (dataObj.req.url.toLowerCase().indexOf("/stress") != -1) {
            opType = "stress";
        } else if (dataObj.req.url.toLowerCase().indexOf("/period") != -1) {
            opType = "period";
        } else if (dataObj.req.url.toLowerCase().indexOf("/medication") != -1) {
            opType = "medication";
        } else if (dataObj.req.url.toLowerCase().indexOf("/weather") != -1) {
            opType = "weather";
        } else if (dataObj.req.url.toLowerCase().indexOf("/timebucket") != -1) {
            opType = "timebucket";
        }else {
            console.log(dataObj.id + ": Unsupported operation: " + dataObj.req.url);
            completeResponse(
                dataObj, 403, "text", "Unsupported operation: " + dataObj.req.url
            );
            return;
        }

        // Ok, it's a supported operation, so now see if it's the "special" case
        // of "get all" and call the DAO as appropriate.
        if (opType == "clear") {
            DAO.CLEAR_DATA(dataObj);
        } else if (dataObj.ident == null && dataObj.req.method == "GET") {
            DAO.GET_ALL(opType, dataObj);
        } else {
            DAO[dataObj.req.method](opType, dataObj);

        }

        // Handle any exceptions that occur.
    } catch (e) {
        console.log(dataObj.id + ": Exception processing request (part 2): " + e);
        completeResponse(dataObj, 500, "text", "Exception: " + e);
    }

} // End serverCorePart2().


/**
 * Called to complete a response.  This function is in global scope so
 * the DAO can get at it too (the other methods here are local to this module).
 *
 * @param dataObj     The dataObj object created in serverCore().
 * @param statusCode  HTTP status code to set.
 * @param contentType Content type of the response, either 'text' or 'json'.
 * @param content     The content to return.
 */
completeResponse = function(dataObj, statusCode, contentType, content) {

    // Access-Control-Allow-Origin header is needed to allow
    // cross-domain requests.
    var ct = "text/plain";
    if (contentType == "json") {
        ct = "application/json";
    }
    dataObj.resp.writeHead(
        statusCode, { "Content-Type" : ct, "Access-Control-Allow-Origin" : "*" }
    );
    dataObj.resp.end(content);

} // End completeResponse().


/**
 * This part will call weather api periodically and will save the data in the database
**/
/*


    var optionsget = {
        host: 'api.openweathermap.org',
        port: 80,
        path: '/data/2.5/weather?q=Calgary,ca&units=metric&APPID=c3c205452976c9964ce346428d1802cb',
        method: 'GET'
    };

    var weatherData = {
        date : null,
        time : null,
        overall : null,
        pressure : null,
        temperature : null,
        humidity : null,
        wind : null
    };
    var reqGet = http.request(optionsget, function (res) {
        //console.log("Status Code: ", res.statusCode);

        res.on('data', function (d) {
            //console.info('GET Result:\n');
            //process.stdout.write(d);

            var newDate = new Date();
            var data = JSON.parse(d);
            weatherData.date = (newDate.getMonth()+1) + "/" + newDate.getDate() + "/" + newDate.getFullYear();
            weatherData.time = newDate.getHours() + ":" + (newDate.getMinutes() < 10 ? ("0" + newDate.getMinutes()) : newDate.getMinutes());
            weatherData.overall = data.weather[0].description;
            console.log(weatherData.overall);
            weatherData.pressure = data.main.pressure;
            weatherData.temperature = data.main.temp;
            weatherData.humidity = data.main.humidity;
            weatherData.wind = data.wind.speed;
        });

        res.on('end', function(){
            try{
                reqID = reqID + 1;

                var dataObj = {
                    id : new Date().getTime() + reqID, req : null, resp : null,
                    data : null, ident : null
                };

                dataObj.data = weatherData;

                DAO["POST"]("weather", dataObj);
                //setInterval(function(){getWeather();}, 21600000);
            }
            catch (e)
            {
                console.error(e + " Error");
            }


        });

    });


    reqGet.end();

    reqGet.on('error', function (e) {
        console.error(e);
    });


function getWeather()
{
    var optionsget = {
        host: 'api.openweathermap.org',
        port: 80,
        path: '/data/2.5/weather?q=Calgary,ca&units=metric&APPID=c3c205452976c9964ce346428d1802cb',
        method: 'GET'
    };

    var reqGet = http.request(optionsget, function (res) {

        res.on('data', function (d) {
            var newDate = new Date();
            var data = JSON.parse(d);
            weatherData.date = (newDate.getMonth()+1) + "/" + newDate.getDate() + "/" + newDate.getFullYear();
            weatherData.time = newDate.getHours() + ":" + (newDate.getMinutes() < 10 ? ("0" + newDate.getMinutes()) : newDate.getMinutes());
            weatherData.overall = data.weather[0].description;
            console.log(weatherData.overall);
            weatherData.pressure = data.main.pressure;
            weatherData.temperature = data.main.temp;
            weatherData.humidity = data.main.humidity;
            weatherData.wind = data.wind.speed;
        });

        res.on('end', function(){
            try{
                reqID = reqID + 1;

                var dataObj = {
                    id : new Date().getTime() + reqID, req : null, resp : null,
                    data : null, ident : null
                };

                dataObj.data = weatherData;
                DAO["POST"]("weather", dataObj);

            }
            catch (e)
            {
                console.error(e + " Error");
            }


        });
    });

    reqGet.end();

    reqGet.on('error', function (e) {
        console.error(e);
    });
}
*/

// ----------------------------------------------------------------------------


// Define and start the server.
var server = http.createServer(serverCore);
server.listen("80", "127.0.0.1");
console.log("\nApp available at http://127.0.0.1:80\n");