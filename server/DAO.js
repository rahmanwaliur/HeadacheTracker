/**
 * Created by Waliur on 4/9/2015.
 */

// ****************************************************************************
// Data Access Object for CRUD operations against the database.
//
// S. M. Waliur Rahman
// ****************************************************************************


// Imports.
var mongoose = require("mongoose");

var schemas = {

    user : mongoose.Schema({
        userID : "string",
        userPassword : "string"
    }),

    headache : mongoose.Schema({
        userID : "string",
        headacheID : "string",
        startTime : "string",
        startTimeAMPM : "string",
        startDate : "string",
        endTime : "string",
        endTimeAMPM : "string",
        endDate : "string",
        severity : [{recordTime : "string", recordTimeAMPM : "string", recordDate : "string", severityLevel : "number"}],
        disability : {recordDate : "string", disabilityLevel : "number"},
        painArea : {tmj : "boolean", sinus : "boolean", cluster : "boolean", tension : "boolean", migraine : "boolean", neck : "boolean"},
        painNature : "string",
        painSymptom : {noSymptom:"boolean", lightSensitivity : "boolean", soundSensitivity: "boolean", nasalCongestion : "boolean",
            nauseaCondition:"boolean", depressedMood:"boolean", smellSensitivity:"boolean", feelAnxious:"boolean", otherSymptom:"boolean"},
        userLocation : "string",
        painNote : "string",
        lastSaved : "string",
        confirmed : "boolean"

    }),

    food : mongoose.Schema({
        userID : "string",
        foodTrackDate : "string",
        foodTrackTime : "string",
        foodName : "string"
    }),

    drink : mongoose.Schema({
        userID : "string",
        drinkTrackDate : "string",
        drinkTrackTime : "string",
        drinkName : "string"

    }),

    exercise : mongoose.Schema({
        userID : "string",
        exerciseTrackDate : "string",
        exerciseTrackTime : "string",
        exerName : "string",
        exerStatus : "string"
    }),

    sleep : mongoose.Schema({
        userID : "string",
        sleepTrackDate : "string",
        sleepTrackTime : "string",
        sleepStatus : "string"
    }),

    stress : mongoose.Schema({
        userID : "string",
        stressTrackDate : "string",
        stressTrackTime : "string",
        stressLevel : "string"
    }),

    period : mongoose.Schema({
        userID : "string",
        periodTrackDate : "string",
        periodTrackTime : "string",
        periodStatus : "string"
    }),

    medication : mongoose.Schema({
        userID : "string",
        medicationTrackDate : "string",
        medicationTrackTime : "string",
        medicationType : "string",
        medicationName : "string",
        medicationQuantity: "string"
    }),

    weather : mongoose.Schema({
        DateTime : "string",
        Year : "number",
        Month : "number",
        Day : "number",
        Time : "string",
        Temp : "number",
        RelHum : "number",
        WindSpd : "number",
        StnPress : "number"

    }),

    timebucket : mongoose.Schema({
        userID : "string",
        month: "number",
        date: "string",
        time: "string",
        segment: "string",
        item: "string",
        environment: {temp: "string", hum: "string", wind : "string", press: "string"}
    })

};


// Define database models for all entities.
var models = {
    //appointment : mongoose.model("appointment", schemas.appointment),
    //contact : mongoose.model("contact", schemas.contact),
    //note : mongoose.model("note", schemas.note),
    //task : mongoose.model("task", schemas.task)
    headache : mongoose.model("headache", schemas.headache),
    user : mongoose.model("user", schemas.user),
    food : mongoose.model("food", schemas.food),
    drink : mongoose.model("drink", schemas.drink),
    exercise : mongoose.model("exercise", schemas.exercise),
    sleep : mongoose.model("sleep", schemas.sleep),
    stress : mongoose.model("stress", schemas.stress),
    period : mongoose.model("period", schemas.period),
    medication : mongoose.model("medication", schemas.medication),
    weather : mongoose.model("weather", schemas.weather),
    timebucket : mongoose.model("timebucket", schemas.timebucket)
}



// Connect to database.
mongoose.connect("localhost", "HeadacheTrackerDataStore");


/**
 * POST: (C)reate.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.
 */
function POST(opType, dataObj) {

    console.log(dataObj.id + ": DAO.POST() - CREATE : " + opType);
    var obj = new models[opType](dataObj.data);
    console.log(dataObj.id + ": obj: " + JSON.stringify(obj));

    if(opType != "user"){
        obj.save(function (inError, inObj) {
            if (inError) {
                throw "Error: " + JSON.stringify(inError);
            } else {
                console.log(dataObj.id + ": Success: " + inObj._id);
                if(opType !== "weather")
                    completeResponse(dataObj, 200, "text", "" + inObj._id);
            }
        });
    }
    else{

        var user = models.user;

        var query = user.findOne({'userID': dataObj.data.userID});
        query.select('userID userPassword');

        query.exec(function (err, user) {
           if(err)
               throw "Error: " + JSON.stringify(inError);
           else if(!user) {
               console.log(dataObj.id + ": User not found");
               completeResponse(dataObj, 404, "json", "");
           }
           else
           {
               console.log(dataObj.data.userPassword);
               console.log(user.userPassword);

               if(user.userPassword !== dataObj.data.userPassword)
               {
                   if(user.userPassword == null)
                   {
                       var updates = {$set: {userPassword: dataObj.data.userPassword}};
                       query.update({}, updates).exec();
                   }
                   else
                   {
                       console.log(dataObj.id + ": Password Mismatch");
                       completeResponse(dataObj, 404, "json", "");
                   }
               }
               else
               {
                   console.log(dataObj.id + ": Success: " + user._id);
                   completeResponse(dataObj, 200, "text", "" + user._id);
               }

           }
        });

    }

} // End POST().

/**
 * PUT: (U)pdate.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.
**/
 function PUT(opType, dataObj) {

    console.log(dataObj.id + ": DAO.PUT() UPDATE : " + opType);

    models[opType].findByIdAndUpdate(dataObj.ident, dataObj.data, { },
        function (inError, inObj) {
            if (inError) {
                throw "Error: " + JSON.stringify(inError);
            } else {
                console.log(dataObj.id + ": Success");
                completeResponse(dataObj, 200, "text", "" + inObj._id);
            }
        }
    );

} // End PUT().


/**
 * GET: (R)ead.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.

 **/
function GET(opType, dataObj) {

    console.log(dataObj.id + ": DAO.GET() READ : " + opType);

    models[opType].findById(dataObj.ident,
        function (inError, inObj) {
            if (inError) {
                throw "Error: " + JSON.stringify(inError);
            } else {
                if (inObj == null) {
                    console.log(dataObj.id + ": Object not found");
                    completeResponse(dataObj, 404, "json", "");
                } else {
                    console.log(dataObj.id + ": Success: " + JSON.stringify(inObj));
                    completeResponse(dataObj, 200, "json", JSON.stringify(inObj));
                }
            }
        }
    );

} // End GET().


/**
 * Called from GET when no ID is passed.  Returns all items.
 *
 * @param dataObj The data object built during the core server processing.
**/
function GET_ALL(opType, dataObj) {

    console.log(dataObj.id + ": DAO.POST(): " + opType);

    // Set up sorting of results.  This doesn't actually matter since we
    // effectively lose this order once it hits localStorage on the client, but
    // it's good to see how to do this none the less.
    var opts = { sort : { } };
    switch (opType) {
        case "headache":
            opts.sort.userID = 1;
            break;

    }

    if (dataObj.req.url.toLowerCase().indexOf("/weather") == -1) {
        var id = dataObj.req.url.substring(dataObj.req.url.length - 4);
        var query = models[opType].find({})
            .where('userID').equals(id)
            //.where('confirmed').ne(true)
            .exec(function (inError, inObjs) {
                if (inError) {
                    throw "Error: " + JSON.stringify(inError);
                } else {
                    console.log(dataObj.id + ": Success: " + JSON.stringify(inObjs));
                    completeResponse(dataObj, 200, "json", JSON.stringify(inObjs));
                }
            });
    }
    else {

        var month = parseInt(dataObj.req.url.slice(9,11));
        var date = parseInt(dataObj.req.url.slice(11,13));
        var time = dataObj.req.url.substring(13,15) + ":" + "00";
        if(time.slice(0,1) == "0")
            time = dataObj.req.url.substring(14,15) + ":" + "00";

        var query = models[opType].find({})
            .where('Month').equals(month)
            .where('Day').equals(date)
            .where('Time').equals(time)
            .exec(function (inError, inObjs) {
                if (inError) {
                    throw "Error: " + JSON.stringify(inError);
                } else {
                    console.log(dataObj.id + ": Success: " + JSON.stringify(inObjs));
                    completeResponse(dataObj, 200, "json", JSON.stringify(inObjs));
                }
            });


    }


} // End GET_ALL().


/**
 * PUT: (U)pdate.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.

function PUT(opType, dataObj) {

    console.log(dataObj.id + ": DAO.PUT() UPDATE : " + opType);

    models[opType].findByIdAndUpdate(dataObj.ident, dataObj.data, { },
        function (inError, inObj) {
            if (inError) {
                throw "Error: " + JSON.stringify(inError);
            } else {
                console.log(dataObj.id + ": Success");
                completeResponse(dataObj, 200, "text", "" + inObj._id);
            }
        }
    );

} // End PUT().


/**
 * DELETE: (D)elete.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.
**/
function DELETE(opType, dataObj) {

    console.log(dataObj.id + ": DAO.DELETE() DELETE: " + opType);

    models[opType].findByIdAndRemove(dataObj.ident,
        function (inError, inObj) {
            if (inError) {
                throw "Error: " + JSON.stringify(inError);
            } else {
                console.log(dataObj.id + ": Success");
                completeResponse(dataObj, 200, "text", "" + inObj._id);
            }
        }
    );

} // End DELETE().


/**
 * Clears ALL data from the database.
 *
 * @param dataObj The data object built during the core server processing.

function CLEAR_DATA(dataObj) {

    console.log(dataObj.id + ": DAO.CLEAR_DATA()");

    models.appointment.remove({}, function(inError) {
        if (inError) {
            throw "Error: " + JSON.stringify(inError);
        } else {
            models.contact.remove({}, function(inError) {
                if (inError) {
                    throw "Error: " + JSON.stringify(inError);
                } else {
                    models.note.remove({}, function(inError) {
                        if (inError) {
                            throw "Error: " + JSON.stringify(inError);
                        } else {
                            models.task.remove({}, function(inError) {
                                if (inError) {
                                    throw "Error: " + JSON.stringify(inError);
                                } else {
                                    console.log(dataObj.id + ": Success");
                                    completeResponse(dataObj, 200, "text", "");
                                }
                            });
                        }
                    });
                }
            });
        }
    });

} // End CLEAR_DATA().

*/
// Make functions available outside of this module.
exports.POST = POST;
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.GET_ALL = GET_ALL;
//exports.CLEAR_DATA = CLEAR_DATA;
