/**
 * Created by Waliur on 2/6/2015.
 */

/**
 * Flags that tell us when each entity page has been visited.*/

var ajaxURLPrefix = null;

/**
 * The ID of the item being updated, or null when doing an add.
 */
var updateID = null;

/**
 * Flag: is network connectivity available?
 */
var networkAvailable = true;

var userValidation = false;

var plotTriggers = null;

var headacheObject = {
    "userID" : null,
    "userPass": null,
    "headacheID" : null,
    "headacheDateTime": null,
    "headacheStartTime" : null,
    "headacheStartTimeAMPM" : null,
    "headacheStartDate" : null,
    "headacheEndTime" : null,
    "headacheEndTimeAMPM" : null,
    "headacheEndDate" : null,
    "ongoingHeadache" : false,
    "painSeverity" : [
        {severityTime : null, severityTimeAMPM : null, severityDate : null, severityValue : 0},
        {severityTime : null, severityTimeAMPM : null, severityDate : null, severityValue : 0},
        {severityTime : null, severityTimeAMPM : null, severityDate : null, severityValue : 0}
    ],
    "painDisability" : {"disabilityValue":null, "disabilityDate":null},
    "painLocation" : {"tmjHeadache":false, "sinusHeadache":false, "clusterHeadache":false, "tensionHeadache":false, "migraineHeadache":false, "neckHeadache":false},
    "painNature" : null,
    "painSymptoms" : {"noSymptom":false, "lightSensitivity":false, "soundSensitivity":false, "nasalCongestion":false, "nauseaCondition":false, "depressedMood":false, "smellSensitivity":false, "feelAnxious":false, "otherSymptom":false},
    "userLocation" : null,
    "userNote" : null,
    "lastSavedPage" : null,
    "nextPage" : null,
    "confirmedData": false

}

var activityObject = {
    "userID" : null,
    "trackTime": null,
    "trackDate" : null,
    "activeActivityPage" : null,
    "foodTracking" : null,
    "drinkTracking" : null,
    "exerciseTracking" : {"exerciseName": null, "exerciseStatus": null},
    "sleepTracking": null,
    "stressTracking": null,
    "periodTracking": null,
    "medicineTracking":{"medType": null, "medName": null, "medQuantity": null}
}

var weatherObject = {
    "datetime" : null,
    "year" : null,
    "month" : null,
    "date" : null,
    "time" : null,
    "temperature" : null,
    "humidity" : null,
    "wind" : null,
    "pressure" : null
}

var pageVisited = {

    starttime : false,
    endtime : false,
    painseverity : false,
    painlocation : false,
    painnature : false,
    painsymptom : false,
    paindisability : false,
    activitylist : false,
    userlocation : false,
    painnote: false,
    summarydata : false

};

$(document).on("mobileinit", function() {

    // Set JQM defaults.
    $.mobile.defaultPageTransition  = "none";
    $.mobile.defaultDialogTransition  = "none";
    $.mobile.phonegapNavigationEnabled = true;
    $.mobile.loader.prototype.options.text = "...Please Wait...";
    $.mobile.loader.prototype.options.textVisible = true;


    // Determine AJAX URL prefix.
    if (document.location.protocol.toLowerCase().indexOf("file") != -1) {
        ajaxURLPrefix = "http://localhost:80";
        //ajaxURLPrefix = "http://localhost:63342/HeadacheTracker/client/index.html";
    } else {
        ajaxURLPrefix = "http://localhost:80";
        //ajaxURLPrefix = "http://162.246.156.29:80";
        //ajaxURLPrefix = "http://localhost:63342/HeadacheTracker/client/index.html";
    }


});

$(document).on("ready", function() {
    // If we're running inside PhoneGap then we can determine if we have
    // connectivity up-front without trying the fetches.
    if (navigator && navigator.connection && navigator.connection.type == Connection.NONE) {
        showConnectivityMsg();
    }
    else {

        //downloadServerData();
        //$("#popupLogin").attr({"data-rel":"popup", "data-position-to":"window", "data-transition":"pop"});
        var user = window.sessionStorage.getItem("currentUser");
        var pass = window.sessionStorage.getItem("currentPass");
        if(user) {
            headacheObject.userID = user;
            headacheObject.userPass = pass;
            downloadServerData();

        }
        else {

            if(preAuth())
                downloadServerData();
            else
                popupLogin();
        }


    }

    /*
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(105,105,100,0,2*Math.PI);
    ctx.font = "30px Helvetica";
    ctx.fillText("6 Hours", 52.5, 105);
    ctx.stroke(); */

});

function popupLogin(){
    $("#ongoing p").hide();
    $("#unfinished p").hide();
    $("#login-welcome p").hide();

    $("#popupLogin").popup('open');

}

function preAuth() {


    var TTL = 259200000;
    var time = Date.now();

    if (window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
        headacheObject.userID = window.localStorage["username"];
        headacheObject.userPass = window.localStorage["password"];

        if((time - window.localStorage["time"]) > TTL) {
            window.localStorage.removeItem("username");
            window.localStorage.removeItem("password");
            window.localStorage.removeItem("time");
            return false;
        }
        return true;
    }
    else
        return false;
}
function validateUser(objectType){


    $("#popupLogin").popup('close');
    $("#ongoing p").hide();
    $("#unfinished p").hide();
    $("#login-welcome p").hide();

    headacheObject.userID = $("#um").val();
    headacheObject.userPass = $("#pw").val();

    var newUserObj = {
        "userID" : headacheObject.userID,
        "userPassword" : headacheObject.userPass
    }

    var httpMethod = "post";
    var uid = "";

    var newUserObject = JSON.stringify(newUserObj);


    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newUserObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            //newUserObject = newUserObject.slice(0, newUserObject.length - 1);
            //newUserObject = newUserObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            //window.localStorage.setItem(objectType + "_" + inResponse, newUserObject);
            $.mobile.loading("hide");
            //updateID = inResponse;
            $("#ongoing p").hide();
            $("#unfinished p").hide();
            $("#login-welcome p").hide();
            $.mobile.changePage("index.html");
            userValidation = true;



        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");
            headacheObject.userID = null;
            headacheObject.userPass = null;
            $("#um").setVal = null;
            $("#pw").setVal = null;
            if(inStatus == "error") {

                //window.location.href = "index.html";
                setTimeout(function(){document.location.href = "index.html"},50);

            }

        })
        .always(function(){
            if(userValidation == true) {
                downloadServerData();
            }
        });

}

function downloadServerData() {

    $("#ongoing p").hide();
    $("#unfinished p").hide();
    $.mobile.loading("show");
    var unconfirmedFlag = 0;
    //getCurrentHeadacheFromLocalStorage('headache');
    /**
     * Structure used during loading.
     */
    var fetching = {
        loaded_headache : false, loaded_food : false, loaded_drink : false, loaded_exercise : false, loaded_sleep : false, loaded_stress : false, loaded_period : false, loaded_medication : false, loaded_timebucket : false,
        data_headache : null, data_food : null, data_drink : null, data_exercise : null, data_sleep : null, data_stress : null, data_period : null, data_medication : null, data_timebucket : null
    };

    // Function executed when each of the four AJAX requests returns, regardless
    // of whether they succeeded or not.  Passed to this is the type of entity
    // completed and the response from the server, or null if the call failed.
    var completeLoad = function(inType, inResponse) {

        // Record that this entity type was loaded and the server's response.
        fetching["loaded_" + inType] = true;
        fetching["data_" + inType] = inResponse;

        // When all four have completed then it's time to get to work.
        if (fetching.loaded_headache && fetching.loaded_food && fetching.loaded_drink && fetching.loaded_exercise && fetching.loaded_sleep && fetching.loaded_stress && fetching.loaded_period && fetching.loaded_medication && fetching.loaded_timebucket) {

            // If we got back data for all four entity types then we're good to go.
            if (fetching.data_headache && fetching.data_food && fetching.data_drink && fetching.data_exercise && fetching.data_sleep && fetching.data_stress && fetching.data_period && fetching.data_medication && fetching.data_timebucket) {

                // Clear localStorage and then populate it with the fresh data.

                window.localStorage.clear();

                // Store User Info for Automatic login next time
                window.localStorage["username"] = headacheObject.userID;
                window.localStorage["password"] = headacheObject.userPass;
                var currentTime = Date.now();
                window.localStorage["time"] = currentTime;

                var types = [ "headache", "food", "drink", "exercise", "sleep", "stress", "period", "medication", "timebucket" ];
                for (var i = 0; i < types.length; i++) {
                    var typ = types[i];
                    var dat = fetching["data_" + typ];
                    var len = dat.length;

                    var lst = window.localStorage;
                    for (var j = 0; j < len; j++) {
                        var obj = dat[j];
                        lst.setItem(typ + "_" + obj._id, JSON.stringify(obj));
                        if (typ == "headache" && obj.confirmed !== true) {
                            loadIntoMemory(obj);
                            unconfirmedFlag = 1;
                        }
                        //alert(typ + "_" + obj._id, JSON.stringify(obj));
                    }

                    if (unconfirmedFlag === 0) {
                        //alert("No Data in Database");
                        $("#ongoing p").text("No Headache Ongoing. Tap \"Headaches\" button for new Headache entry.").show();
                    }
                }
            }
            else{

                // One or more entities were not fetched, which we take to mean there's
                // a connectivity problem, so let the user know what's up.  Whatever
                // data is in localStorage will be used for this run.
                showConnectivityMsg();
            }
            // To conserve memory, erase the temporary load structure.
            fetching = null;

            // Unmask screen and we're done here.
            $.mobile.loading("hide");
        }

    };

    var httpMethod = "get";
    //alert(headacheObject.userID);
    // Get all headaches.
    $.ajax({ url : ajaxURLPrefix + "/headache/" + headacheObject.userID,  type: httpMethod})
        .done(function(inResponse) { completeLoad("headache", inResponse);})
        .fail(function(inXHR, inStatus) { completeLoad("headache", null);});

    // Get all foods.
    $.ajax({ url : ajaxURLPrefix + "/food/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("food", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("food", null); });

    // Get all drinks.
    $.ajax({ url : ajaxURLPrefix + "/drink/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("drink", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("drink", null); });

    // Get all exercises.
    $.ajax({ url : ajaxURLPrefix + "/exercise/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("exercise", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("exercise", null); });

    // Get all sleep.
    $.ajax({ url : ajaxURLPrefix + "/sleep/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("sleep", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("sleep", null); });

    // Get all stress.
    $.ajax({ url : ajaxURLPrefix + "/stress/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("stress", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("stress", null); });

    // Get all period.
    $.ajax({ url : ajaxURLPrefix + "/period/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("period", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("period", null); });

    // Get all medication.
    $.ajax({ url : ajaxURLPrefix + "/medication/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("medication", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("medication", null); });

    $.ajax({ url : ajaxURLPrefix + "/timebucket/" + headacheObject.userID, type: httpMethod })
        .done(function(inResponse) { completeLoad("timebucket", inResponse); })
        .fail(function(inXHR, inStatus) { completeLoad("timebucket", null); });



} // End downloadServerData();

function loadIntoMemory(object){
    var j = 0;
    for(var i = 0; i <= object.severity.length-1; i++)
    {
        if(object.severity[i].recordDate == processDate()) {
            headacheObject.painSeverity[j].severityTime = object.severity[i].recordTime;
            headacheObject.painSeverity[j].severityTimeAMPM = object.severity[i].recordTimeAMPM;
            headacheObject.painSeverity[j].severityDate = object.severity[i].recordDate;
            headacheObject.painSeverity[j].severityValue = object.severity[i].severityLevel;
            j++;
        }
    }

    for(var i = 0; i <= object.disability.length-1; i++)
    {
        //alert(obj.disability[i].recordDate);
        if(object.disability[i].recordDate == processDate())
        {
            headacheObject.painDisability.disabilityDate = object.disability[i].recordDate;
            headacheObject.painDisability.disabilityValue = object.disability[i].disabilityLevel;
        }
    }

    if (object.userID != null)
        headacheObject.userID = object.userID;
    if (object.headacheID != null)
        headacheObject.headacheID = object._id;
    if (object.startTime != null)
        headacheObject.headacheStartTime = object.startTime;
    if (object.startTimeAMPM != null)
        headacheObject.headacheStartTimeAMPM = object.startTimeAMPM;
    if (object.startDate != null)
        headacheObject.headacheStartDate = object.startDate;
    if (object.endTime != null)
        headacheObject.headacheEndTime = object.endTime;
    if (object.endTimeAMPM != null)
        headacheObject.headacheEndTimeAMPM = object.endTimeAMPM;
    if (object.endDate != null)
        headacheObject.headacheEndDate = object.endDate;
    if (object.disability.disabilityLevel != null)
        headacheObject.painDisability.disabilityValue = object.disability.disabilityLevel;
    if (object.disability.recordDate != null)
        headacheObject.painDisability.disabilityDate = object.disability.recordDate;
    if(object.disability.recordDate != null)
        headacheObject.painDisability.disabilityDate = object.disability.recordDate;
    if(object.disability.disabilityLevel != null)
        headacheObject.painDisability.disabilityValue = object.disability.disabilityLevel;
    if(object.painArea.tmj != false)
        headacheObject.painLocation.tmjHeadache = object.painArea.tmj;
    if(object.painArea.sinus != false)
        headacheObject.painLocation.sinusHeadache = object.painArea.sinus;
    if(object.painArea.cluster != false)
        headacheObject.painLocation.clusterHeadache = object.painArea.cluster;
    if(object.painArea.migraine != false)
        headacheObject.painLocation.migraineHeadache = object.painArea.migraine;
    if(object.painArea.tension != false)
        headacheObject.painLocation.tensionHeadache = object.painArea.tension;
    if(object.painArea.neck != false)
        headacheObject.painLocation.neckHeadache = object.painArea.neck;
    if(object.painNature != null)
        headacheObject.painNature = object.painNature;
    if(object.painSymptom.noSymptom != false)
        headacheObject.painSymptoms.noSymptom = object.painSymptom.noSymptom;
    if(object.painSymptom.depressedMood != false)
        headacheObject.painSymptoms.depressedMood = object.painSymptom.depressedMood;
    if(object.painSymptom.feelAnxious != false)
        headacheObject.painSymptoms.feelAnxious = object.painSymptom.feelAnxious;
    if(object.painSymptom.lightSensitivity != false)
        headacheObject.painSymptoms.lightSensitivity = object.painSymptom.lightSensitivity;
    if(object.painSymptom.nasalCongestion != false)
        headacheObject.painSymptoms.nasalCongestion = object.painSymptom.nasalCongestion;
    if(object.painSymptom.nauseaCondition != false)
        headacheObject.painSymptoms.nauseaCondition = object.painSymptom.nauseaCondition;
    if(object.painSymptom.otherSymptom != false)
        headacheObject.painSymptoms.otherSymptom = object.painSymptom.otherSymptom;
    if(object.painSymptom.smellSensitivity != false)
        headacheObject.painSymptoms.smellSensitivity = object.painSymptom.smellSensitivity;
    if(object.painSymptom.soundSensitivity != false)
        headacheObject.painSymptoms.soundSensitivity = object.painSymptom.soundSensitivity;
    if(object.userLocation != null)
        headacheObject.userLocation = object.userLocation;
    if(object.painNote != null)
        headacheObject.userNote = object.painNote;
    if(object.lastSaved != null)
        headacheObject.lastSavedPage = object.lastSaved;
    if(object.confirmed != false)
        headacheObject.confirmedData = object.confirmed;

    if(object.endTime == null || object.endTime == "Still") {
        $("#ongoing p").text("Headache Ongoing. Tap \"Headaches\" button to update data.").show();
        $("#unfinished p").hide();
        $("#index-start-btn").prop({"href": object.lastSaved, "onclick": ""});
        updateID = object._id;
    }
    else if (object.lastSaved != "painNote.html" && (object.endTime != null && object.endTime != "Still")) {
        $("#unfinished p").text("You have an unfinished entry. Tap \"Headaches\" button to finish.").show();
        $("#ongoing p").hide();
        $("#index-start-btn").prop({"href": object.lastSaved, "onclick": ""});
        updateID = object._id;
    }
    else if (object.lastSaved == "painNote.html" && (object.endTime != null && object.endTime != "Still")) {
        $("#unfinished p").text("You have an unconfirmed entry. Tap \"Headaches\" button to confirm.").show();
        $("#ongoing p").hide();
        $("#index-start-btn").prop({"href": object.lastSaved, "onclick": ""});
        updateID = object._id;
    }
    else{
        updateID = null;
    }
}

function populateStartTimeData (time, ampm, date)
{
    $("#start-show-time p").text(time + " " + ampm);
    $("#start-show-date p").text(date);

    $("#start-tenMinutes").removeClass("ui-btn-active");
    $("#start-twentyMinutes").removeClass("ui-btn-active");
    $("#start-thirtyMinutes").removeClass("ui-btn-active");
    $("#start-justStarted").removeClass("ui-btn-active");
    $("#start-userMinutes").addClass("ui-btn-active");
    $("#start-user-minutes-text").css("font-weight", "bold");
    $("#start-just-started-text").css("font-weight", "normal");
    $("#start-ten-minutes-text").css("font-weight", "normal");
    $("#start-twenty-minutes-text").css("font-weight", "normal");
    $("#start-thirty-minutes-text").css("font-weight", "normal");


}

function downloadUserData(){

    $("#no-data-text p").hide();
    $.mobile.loading("show");

    //getCurrentHeadacheFromLocalStorage('headache');
    /**
     * Structure used during loading.
     */
    var fetching = {
        loaded_headache : false,
        data_headache : null
    };

    // Function executed when each of the four AJAX requests returns, regardless
    // of whether they succeeded or not.  Passed to this is the type of entity
    // completed and the response from the server, or null if the call failed.
    var completeLoad = function(inType, inResponse) {

        // Record that this entity type was loaded and the server's response.
        fetching["loaded_" + inType] = true;
        fetching["data_" + inType] = inResponse;

        //alert(JSON.stringify(inResponse));
        // When all four have completed then it's time to get to work.
        if (fetching.loaded_headache) {

            // If we got back data for all four entity types then we're good to go.
            if (fetching.data_headache) {

                var types = [ "headache" ];
                for (var i = 0; i < types.length; i++) {
                    var typ = types[i];
                    var dat = fetching["data_" + typ];
                    var len = dat.length;
                    var lst = window.localStorage;
                    for (var j = 0; j < len; j++) {
                        var obj = dat[j];
                        lst.setItem(typ + "_" + obj._id, JSON.stringify(obj));
                        //alert(typ + "_" + obj._id, JSON.stringify(obj));
                    }

                    if (JSON.stringify(obj) == undefined) {
                        $("#no-data-text p").show();
                    }
                    else
                    {


                    }
                }
            }
        }
        else{

            // One or more entities were not fetched, which we take to mean there's
            // a connectivity problem, so let the user know what's up.  Whatever
            // data is in localStorage will be used for this run.
            showConnectivityMsg();
        }

        // To conserve memory, erase the temporary load structure.
        fetching = null;

        // Unmask screen and we're done here.
        $.mobile.loading("hide");
    }

    var httpMethod = "get";
    //alert(headacheObject.userID);
    // Get all appointments.
    $.ajax({ url : ajaxURLPrefix + "/headache/" + headacheObject.userID,  type: httpMethod})
        .done(function(inResponse) { completeLoad("headache", inResponse);})
        .fail(function(inXHR, inStatus) { completeLoad("headache", null);});

    //checkForOngoingHeadache('headache');

    // Get all contacts.
    //  $.ajax({ url : ajaxURLPrefix + "/contact" })
    //      .done(function(inResponse) { completeLoad("contact", inResponse); })
    //    .fail(function(inXHR, inStatus) { completeLoad("contact", null); });
//
    // Get all notes.
    //   $.ajax({ url : ajaxURLPrefix + "/note" })
    //     .done(function(inResponse) { completeLoad("note", inResponse); })
    //      .fail(function(inXHR, inStatus) { completeLoad("note", null); });

    // Get all tasks.
    //  $.ajax({ url : ajaxURLPrefix + "/task" })
    //      .done(function(inResponse) { completeLoad("task", inResponse); })
    //     .fail(function(inXHR, inStatus) { completeLoad("task", null); });

}

function populateEndTimeData (time, ampm, date)
{
    if(time == "Still") {
        time = "Still Going On";
        $("#end-show-time p").text(time);
        $("#end-show-date p").text(date);
    }
    else {
        $("#end-show-time p").text(time + " " + ampm);
        $("#end-show-date p").text(date);
        $("#end-tenMinutes").removeClass("ui-btn-active");
        $("#end-twentyMinutes").removeClass("ui-btn-active");
        $("#end-thirtyMinutes").removeClass("ui-btn-active");
        $("#end-justStarted").removeClass("ui-btn-active");
        $("#end-userMinutes").addClass("ui-btn-active");
        $("#end-user-minutes-text").css("font-weight", "bold");
        $("#end-just-started-text").css("font-weight", "normal");
        $("#end-ten-minutes-text").css("font-weight", "normal");
        $("#end-twenty-minutes-text").css("font-weight", "normal");
        $("#end-thirty-minutes-text").css("font-weight", "normal");

    }

}

function populateSeverity1Data()
{

    $("#severity-one-time").val(headacheObject.painSeverity[0].severityTime + " " + headacheObject.painSeverity[0].severityTimeAMPM);
    $("#severity-one-time").prop("readonly","readonly");
    $("#severity-one").val(headacheObject.painSeverity[0].severityValue).slider("refresh");

    $("#severity-second").show();
    $("#severity-third").hide();
}

function populateSeverity2Data()
{
    $("#severity-two-time").val(headacheObject.painSeverity[1].severityTime + " " + headacheObject.painSeverity[1].severityTimeAMPM);
    $("#severity-two-time").prop("readonly","readonly");
    $("#severity-two").val(headacheObject.painSeverity[1].severityValue).slider("refresh");

    $("#severity-second").show();
    $("#severity-third").show();
}

function populateSeverity3Data()
{
    $("#severity-three-time").val(headacheObject.painSeverity[2].severityTime + " " + headacheObject.painSeverity[2].severityTimeAMPM);
    $("#severity-three-time").prop("readonly", "readonly");
    $("#severity-three").val(headacheObject.painSeverity[2].severityValue).slider("refresh");

    $("#time-text").hide();
    $("#severity-text").hide();
}


function checkForOngoingHeadache(inType) {

    var items = [ ];

    // First, get the data of the appropriate type from localStorage.
    var lst = window.localStorage;
    for (var itemKey in lst) {
        if (itemKey.indexOf(inType) == 0) {
            var sObj = lst.getItem(itemKey);
            items.push(JSON.parse(sObj));
        }
    }

    if(items[items.length - 1].endTime === null || items[items.length - 1].endTime === "Still"){
        $("#ongoing p").text("Headache Ongoing. Tap \"Headaches\" button to update data.").show();
        $("#index-start-btn").prop({"href": items[items.length-1].lastSaved, "onclick": ""});

        updateID = items[items.length - 1]._id;
    }
    else if (items[items.length - 1].lastSaved != "painNote.html" && (items[items.length - 1].endTime !== null && items[items.length - 1].endTime != "Still")){
        $("#unfinished p").text("You have an unfinished entry. Tap \"Headaches\" button to finish.").show();
        $("#ongoing p").hide();
        $("#index-start-btn").prop({"href": items[items.length-1].lastSaved, "onclick": ""});

        //alert(items[items.length-1].lastSaved);
        updateID = items[items.length - 1]._id;

    }
    else if (items[items.length - 1].lastSaved == "painNote.html" && (items[items.length - 1].endTime !== null && items[items.length - 1].endTime != "Still")){
        $("#unfinished p").text("You have an unconfirmed entry. Tap \"Headaches\" button to confirm.").show();
        $("#ongoing p").hide();
        $("#index-start-btn").prop({"href": items[items.length-1].lastSaved, "onclick": ""});

        //alert(items[items.length-1].lastSaved);
        updateID = items[items.length - 1]._id;

    }
    else {

        updateID = null;

        alert("No headache going on. Create new headache object");
        //$("#index-start-btn").prop("href", "startTime.html");
    }
    //if(items[items.lengh - 1].endTime == null)
      //  alert(items[i]._id);


    //alert(JSON.stringify(lst));

    // Second, sort the resultant array, since the order we get it from
    // localStorage is indeterminate.
    //items.sort(function(a, b) {
    //   switch (inType) {
    //       case "contact":
    //          return a.lastName > b.lastName;
    //         break;
    //    case "appointment": case "note": case "task":
    //   return a.title > b.title;
    //   break;
    // }
    //});

    return items;

} // End getAllFromLocalStorage().



function pageShowHandler(inType) {

    if (!pageVisited[inType]) {

        $.mobile.loading("show");

        // Populate the list.
        //populateList(inType);

        // If network connectivity is found to be unavailable at any
        // point then disable new and save capabilities.  Note that this is
        // done here rather than the more reasonable downloadServerData() when
        // the message is shown because we can't guarantee this page has been
        // loaded at that point.
        //if (!networkAvailable) {
        //$("#" + inType + "NewLink").remove();
        //    $("#" + inType + "SaveButton").button("disable");
        //}
        pageVisited[inType] = true;
        $.mobile.loading("hide");

        if(inType == "starttime")
        {
            if(headacheObject.headacheStartTime != null){
                populateStartTimeData(headacheObject.headacheStartTime, headacheObject.headacheStartTimeAMPM, headacheObject.headacheStartDate);
                showStartDateTimeOnUserSelection();
                setStartDateTime();
            }
            else {
                showStartDateTime();
                showStartDateTimeOnUserSelection();
                setStartDateTime();
            }
            pageVisited[inType] = false;
        }
        else if (inType == "endtime")
        {
            if(headacheObject.headacheEndDate != null) {
                populateEndTimeData(headacheObject.headacheEndTime, headacheObject.headacheEndTimeAMPM, headacheObject.headacheEndDate);
            }
            else {
                showEndDateTime();
            }
            showEndDateTimeOnUserSelection();
            setEndDateTime();

            //validateStartVsEndDate();
            //updateEndTimeData();
            pageVisited[inType] = false;
        }
        else if(inType == "painseverity")
        {

            if(headacheObject.painSeverity[0].severityTime == null) {
                setSeverity1RecordTime();
            }
            else {
                populateSeverity1Data();
            }

            if(headacheObject.painSeverity[1].severityTime == null)
                setSeverity2RecordTime();
            else {
                populateSeverity2Data();
            }

            if(headacheObject.painSeverity[2].severityTime == null)
                setSeverity3RecordTime();
            else
                populateSeverity3Data();

            pageVisited[inType] = false;
        }
        else if(inType == "paindisability")
        {
            if(headacheObject.painDisability.disabilityValue != null)
            {
                populateDisabilityData();
            }
            else
            {
                showDisabilityMessage();
            }
            pageVisited[inType] = false;
        }
        else if(inType == "painlocation")
        {
            var painLocationFlag = 0;
            for(var key in headacheObject.painLocation) {
                var value = headacheObject.painLocation[key];
                if( value != false)
                {
                    painLocationFlag = 1;
                }
            }

            if(painLocationFlag == 1)
                populatePainLocationData();

            painLocationSelected();
            showNext();
            pageVisited[inType] = false;
        }
        else if(inType == "painnature")
        {
            if(headacheObject.painNature != null)
                populatePainNatureData();
            showNext();
            pageVisited[inType] = false;
        }
        else if(inType == "painsymptom")
        {
            populatePainSymptomData();
            showNext();
            pageVisited[inType] = false;
        }
        else if(inType == "userlocation")
        {

            if(headacheObject.userLocation != null)
                populateUserLocationData();

            physicalLocationSelected();
            showNext();
            pageVisited[inType] = false;
        }
        else if (inType == "painnote")
        {
            if(headacheObject.userNote != null)
                populateUserNoteData();
            showNext();
            pageVisited[inType] = false;
        }
        else if(inType == "summarydata")
        {

            showSummary();
            validateConfirmation();
            pageVisited[inType] = false;
        }
        else if(inType == "trackactivity")
        {

            resetActivitySelection();
            showActivitySelection();
            pageVisited[inType] = false;
        }
        else if(inType == "trackfood")
        {
            //populateLastFoodTracking();
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "trackdrink")
        {
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "trackexercise")
        {
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "tracksleep")
        {
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "trackstress")
        {
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "trackperiod")
        {
            showActivityDateTime();
            setActivityDateTime();
            pageVisited[inType] = false;
        }
        else if(inType == "trackmedications")
        {
            showActivityDateTime();
            setActivityDateTime();
            popupMedQuantity();
            pageVisited[inType] = false;
        }
        else if(inType == "analyzeheadache")
        {
            showDataSummary();
            swipeAction();
            pageVisited[inType] = false;
        }
        else if(inType == "reviewdata")
        {
            showReviewCharts();
            pageVisited[inType] = false;
        }
        else if(inType == "comparedata")
        {
            //hideAllComparisons();
            showInitialTriggerComparison();
            getUserSelectionToCompare();
            //showCompareDate();
            //setCompareDate();
            pageVisited[inType] = false;
        }
        else if(inType == "exploredata")
        {
            showCalendar();
            //showExploreCharts();
            //pageVisited[inType] = false;
        }
        else
        {
            alert("What's up?")
        }


    }

} // pageShowHandler().



function defaultDate(){


    var currentDate = (new Date()).getDate();
    return currentDate;
}

function defaultMonth(){
    var currentMonth = (new Date()).getMonth() + 1;
    return currentMonth;
}

function defaultYear(){
    var currentYear = (new Date()).getFullYear();
    return currentYear;
}

function processDate(){

    var dd = defaultDate();
    var dm = defaultMonth();
    var dy = defaultYear();

    dm = (dm <= 9 ? ("0" + dm) : dm);
    dd = (dd <= 9) ? ("0" + dd) : dd;

    var dateMonthYear = dm + "/" + dd + "/" + dy;

    return dateMonthYear;

}

function defaultHours(){
    var currentHour = (new Date()).getHours();
    return currentHour;
}

function defaultMinutes(){
    var currentMinute = (new Date()).getMinutes();
    return currentMinute;
}

function processTime(){

    var dh = defaultHours();
    var dm = defaultMinutes();
    dm = (dm <= 9 ? ("0" + dm) : dm);
    dh = (dh == 0) ? (dh + 12) : dh;

    if(dh > 12)
    {
        dh=dh-12;
    }

    dh = (dh <= 9) ? ("0" + dh) : dh;

    var hourMinutes = (dh  + ":" + dm + (((new Date()).getHours() <= 11) ? ' AM' : ' PM'));

    return hourMinutes;

}

function processUserSelectionStartTime(umins){

    var dmins = defaultMinutes();
    var dhrs = defaultHours();
    var ddate = defaultDate();
    var dmonth = defaultMonth();
    var dyear = defaultYear();
    var umin = 0;
    var uhrs = 0;
    var ampm = '';

    if((dmins - umins) >= 0 )
    {
        umin = dmins - umins;
        uhrs = dhrs;
        ampm = ((new Date()).getHours() <= 11) ? ' AM' : ' PM';
    }
    else
    {
        umin = 60 - (umins - dmins);
        if(dhrs > 0 && dhrs <= 11)
        {
            uhrs = dhrs - 1;
            ampm = ' AM';
        }
        else if(dhrs == 0)
        {
            uhrs = 23;
            ddate = defaultDate() - 1;
            ampm = ' PM';
        }
        else if(dhrs == 12)
        {
            uhrs = dhrs - 1;
            ampm = ' AM';
        }
        else
        {
            uhrs = dhrs - 1;
            ampm = ' PM';
        }

        //(dhrs > 12 && dhrs <= 23)
    }

    umin = (umin <= 9 ? ("0" + umin) : umin);
    uhrs = (uhrs == 0) ? (uhrs + 12) : uhrs;

    if(uhrs > 12)
    {
        uhrs = uhrs-12;
    }

    uhrs = (uhrs <= 9) ? ("0" + uhrs) : uhrs;
    //var hm = (uhrs  + ":" + umin + (((new Date()).getHours() <= 11) ? ' AM' : ' PM'));
    var hm = (uhrs  + ":" + umin + ampm);

    dmonth = (dmonth <= 9 ? ("0" + dmonth) : dmonth);
    ddate = (ddate <= 9) ? ("0" + ddate) : ddate;

    var dateMonthYear = dmonth + "/" + ddate + "/" + dyear;

    $("#start-show-time p").text(hm);
    $("#start-show-date p").text(dateMonthYear);

}

function processUserSelectionEndTime(umins){

    var dmins = defaultMinutes();
    var dhrs = defaultHours();
    var ddate = defaultDate();
    var dmonth = defaultMonth();
    var dyear = defaultYear();
    var umin = 0;
    var uhrs = 0;
    var ampm = '';

    if((dmins - umins) > 0 )
    {
        umin = dmins - umins;
        uhrs = dhrs;
        ampm = ((new Date()).getHours() <= 11) ? ' AM' : ' PM';
    }
    else
    {
        umin = 60 - (umins - dmins);
        if(dhrs > 0 && dhrs <= 11)
        {
            uhrs = dhrs - 1;
            ampm = ' AM';
        }
        else if(dhrs == 0)
        {
            uhrs = 23;
            ddate = defaultDate() - 1;
            ampm = ' PM';
        }
        else if(dhrs == 12)
        {
            uhrs = dhrs - 1;
            ampm = ' AM';
        }
        else
        {
            uhrs = dhrs - 1;
            ampm = ' PM';
        }

        //(dhrs > 12 && dhrs <= 23)
    }

    umin = (umin <= 9 ? ("0" + umin) : umin);
    uhrs = (uhrs == 0) ? (uhrs + 12) : uhrs;

    if(uhrs > 12)
    {
        uhrs = uhrs-12;
    }

    uhrs = (uhrs <= 9) ? ("0" + uhrs) : uhrs;
    //var hm = (uhrs  + ":" + umin + (((new Date()).getHours() <= 11) ? ' AM' : ' PM'));
    var hm = (uhrs  + ":" + umin + ampm);

    dmonth = (dmonth <= 9 ? ("0" + dmonth) : dmonth);
    ddate = (ddate <= 9) ? ("0" + ddate) : ddate;

    var dateMonthYear = dmonth + "/" + ddate + "/" + dyear;

    if(umins == 0 )
    {
        //$("#end-show-time p").text("hh:mm am/pm");
        //$("#end-show-date p").text("mm/dd/yyyy");

        $("#end-show-time p").text("Still Going On");
        $("#end-show-date p").text("--");
    }
    else
    {
        $("#end-show-time p").text(hm);
        $("#end-show-date p").text(dateMonthYear);
    }
}

function showStartDateTime() {
    var d = processDate();
    var t = processTime();

    $("#start-show-time p").text(t);
    $("#start-show-date p").text(d);
}

function showStartDateTimeOnUserSelection (){
    $("#start-justStarted").on("click", function(){
        processUserSelectionStartTime(0);
        $("#start-justStarted").addClass($.mobile.activeBtnClass);
        $("#start-just-started-text").css("font-weight", "bold");
        $("#start-tenMinutes, #start-twentyMinutes, #start-thirtyMinutes, #start-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#start-ten-minutes-text, #start-twenty-minutes-text, #start-thirty-minutes-text, #start-user-minutes-text").css("font-weight", "normal");

    });

    $("#start-tenMinutes").on("click", function(){
        processUserSelectionStartTime(10);
        $("#start-tenMinutes").addClass($.mobile.activeBtnClass);
        $("#start-ten-minutes-text").css("font-weight", "bold");
        $("#start-justStarted, #start-twentyMinutes, #start-thirtyMinutes, #start-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#start-just-started-text, #start-twenty-minutes-text, #start-thirty-minutes-text, #start-user-minutes-text").css("font-weight", "normal");
    });

    $("#start-twentyMinutes").on("click", function(){
        processUserSelectionStartTime(20);
        $("#start-twentyMinutes").addClass($.mobile.activeBtnClass);
        $("#start-twenty-minutes-text").css("font-weight", "bold");
        $("#start-justStarted, #start-tenMinutes, #start-thirtyMinutes, #start-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#start-just-started-text, #start-ten-minutes-text, #start-thirty-minutes-text, #start-user-minutes-text").css("font-weight", "normal");
    });

    $("#start-thirtyMinutes").on("click", function(){
        processUserSelectionStartTime(30);
        $("#start-thirtyMinutes").addClass($.mobile.activeBtnClass);
        $("#start-thirty-minutes-text").css("font-weight", "bold");
        $("#start-justStarted, #start-tenMinutes, #start-twentyMinutes, #start-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#start-just-started-text, #start-twenty-minutes-text, #start-ten-minutes-text, #start-user-minutes-text").css("font-weight", "normal");
    });
}

function showEndDateTime() {

    $("#end-show-time p").text("Still Going On");
    $("#end-show-date p").text("--");

}

function showEndDateTimeOnUserSelection(){

    $("#end-justStarted").on("click", function(){
        processUserSelectionEndTime(0);
        $("#end-justStarted").addClass($.mobile.activeBtnClass);
        $("#end-just-started-text").css("font-weight", "bold");
        $("#end-tenMinutes, #end-twentyMinutes, #end-thirtyMinutes, #end-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#end-ten-minutes-text, #end-twenty-minutes-text, #end-thirty-minutes-text, #end-user-minutes-text").css("font-weight", "normal");

    });

    $("#end-tenMinutes").on("click", function(){
        processUserSelectionEndTime(10);
        $("#end-tenMinutes").addClass($.mobile.activeBtnClass);
        $("#end-ten-minutes-text").css("font-weight", "bold");
        $("#end-justStarted, #end-twentyMinutes, #end-thirtyMinutes, #end-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#end-just-started-text, #end-twenty-minutes-text, #end-thirty-minutes-text, #end-user-minutes-text").css("font-weight", "normal");

    });

    $("#end-twentyMinutes").on("click", function(){
        processUserSelectionEndTime(20);
        $("#end-twentyMinutes").addClass($.mobile.activeBtnClass);
        $("#end-twenty-minutes-text").css("font-weight", "bold");
        $("#end-justStarted, #end-tenMinutes, #end-thirtyMinutes, #end-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#end-just-started-text, #end-ten-minutes-text, #end-thirty-minutes-text, #end-user-minutes-text").css("font-weight", "normal");

    });

    $("#end-thirtyMinutes").on("click", function(){
        processUserSelectionEndTime(30);
        $("#end-thirtyMinutes").addClass($.mobile.activeBtnClass);
        $("#end-thirty-minutes-text").css("font-weight", "bold");
        $("#end-justStarted, #end-tenMinutes, #end-twentyMinutes, #end-userMinutes").removeClass($.mobile.activeBtnClass);
        $("#end-just-started-text, #end-twenty-minutes-text, #end-ten-minutes-text, #end-user-minutes-text").css("font-weight", "normal");

    });
}

function showNext(){

    $("#tmj-blk, #sinus-blk, #migraine-blk, #tension-blk, #neck-blk, #cluster-blk").on('click', function(){
        $("#painloc-skip").text("Go to Next");
        $("#painloc-skip").css("background-color", "cornflowerblue");
    });

    $("#pain-nature-throbbing, #pain-nature-pressing, #pain-nature-steady").on("change", function(){
        $("#painnature-skip").text("Go to Next");
        $("#painnature-skip").css("background-color", "cornflowerblue");
    });

    $("#no-symptom, #light-sensitivity, #sound-sensitivity, #nasal-congestion, #nausea-condition, #depressed-mood, #feel-anxious, #smell-sensitivity").on("change", function(){
        $("#painsym-skip").text("Go to Next");
        $("#painsym-skip").css("background-color", "cornflowerblue");
    });

    $("#home-block, #office-block, #school-block, #park-block, #transit-block, #party-block, #stadium-block, #shopping-block").on("change", function(){
        $("#userloc-skip").text("Go to Next");
        $("#userloc-skip").css("background-color", "cornflowerblue");
    });

    $("#headachenote").on("change", function(){
        $("#note-skip").text("Go to Next");
        $("#note-skip").css("background-color", "cornflowerblue");

    });

}

function setStartDateTime() {

    $("#start-userMinutes").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#start-show-time p").text(selectedTime);
            $("#start-show-date p").text(selectedDate);
            $("#start-userMinutes").addClass($.mobile.activeBtnClass);
            $("#start-user-minutes-text").css("font-weight", "bold");
            $("#start-justStarted, #start-tenMinutes, #start-twentyMinutes, #start-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#start-just-started-text, #start-twenty-minutes-text, #start-thirty-minutes-text, #start-ten-minutes-text").css("font-weight", "normal");

        }
    });

    $("#start-show-time").mobiscroll().time({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            //var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            //var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#start-show-time p").text(valueText);
            //$("#start-show-date p").text(selectedDate);
            $("#start-userMinutes").addClass($.mobile.activeBtnClass);
            $("#start-user-minutes-text").css("font-weight", "bold");
            $("#start-justStarted, #start-tenMinutes, #start-twentyMinutes, #start-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#start-just-started-text, #start-twenty-minutes-text, #start-thirty-minutes-text, #start-ten-minutes-text").css("font-weight", "normal");

        }
    });

    $("#start-show-date").mobiscroll().date({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {
            $("#start-show-date p").text(valueText);
            //$("#start-show-date p").text(selectedDate);
            $("#start-userMinutes").addClass($.mobile.activeBtnClass);
            $("#start-user-minutes-text").css("font-weight", "bold");
            $("#start-justStarted, #start-tenMinutes, #start-twentyMinutes, #start-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#start-just-started-text, #start-twenty-minutes-text, #start-thirty-minutes-text, #start-ten-minutes-text").css("font-weight", "normal");

        }
    });
}


function setEndDateTime(){

    $("#end-userMinutes").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);

            $("#end-show-time p").text(selectedTime);
            $("#end-show-date p").text(selectedDate);
            $("#end-userMinutes").addClass($.mobile.activeBtnClass);
            $("#end-user-minutes-text").css("font-weight", "bold");
            $("#end-justStarted, #end-tenMinutes, #end-twentyMinutes, #end-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#end-just-started-text, #end-twenty-minutes-text, #end-thirty-minutes-text, #end-ten-minutes-text").css("font-weight", "normal");


        }
    });

    $("#end-show-time").mobiscroll().time({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {
            $("#end-show-time p").text(valueText);
            $("#end-userMinutes").addClass($.mobile.activeBtnClass);
            $("#end-user-minutes-text").css("font-weight", "bold");
            $("#end-justStarted, #end-tenMinutes, #end-twentyMinutes, #end-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#end-just-started-text, #end-twenty-minutes-text, #end-thirty-minutes-text, #end-ten-minutes-text").css("font-weight", "normal");
        }
    });

    $("#end-show-date").mobiscroll().date({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {
            $("#end-show-date p").text(valueText);
            $("#end-userMinutes").addClass($.mobile.activeBtnClass);
            $("#end-user-minutes-text").css("font-weight", "bold");
            $("#end-justStarted, #end-tenMinutes, #end-twentyMinutes, #end-thirtyMinutes").removeClass($.mobile.activeBtnClass);
            $("#end-just-started-text, #end-twenty-minutes-text, #end-thirty-minutes-text, #end-ten-minutes-text").css("font-weight", "normal");
        }
    });

}

function setSeverity1RecordTime(){

    $("#time-text").hide();
    $("#severity-text").hide();

    $("#severity-second").hide();
    $("#severity-third").hide();

    $("#severity-one-time").mobiscroll().time({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {

            var startTimeString = headacheObject.headacheStartDate + " " + headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM;
            var severity1TimeString = processDate() + " " + valueText;
            //var severity1TimeString = "04/29/2015" + " " + valueText;
            var startTime = new Date(startTimeString);
            var severity1Time = new Date(severity1TimeString);
            var endTimeString = headacheObject.headacheEndDate + " " + headacheObject.headacheEndTime + " " + headacheObject.headacheEndTimeAMPM;
            var endTime = new Date(endTimeString);

            if(Date.parse(headacheObject.headacheEndDate) || (severity1Time < startTime)) {
                if (severity1Time < startTime) {
                    $("#time-text").text("Pain Severity record time cannot be earlier than ongoing headache start time " + "(" + startTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);

                }
                else if (severity1Time > endTime) {
                    $("#time-text").text("Pain Severity record time cannot be later than headache end time " + "(" + endTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);
                }
                else {
                    $("#time-text").hide();
                    $("#severity-text").hide();
                    $("#severity-one").slider({disabled: false});
                    headacheObject.painSeverity[0].severityTime = valueText;
                }
            }
            else {
                $("#time-text").hide();
                $("#severity-text").hide();
                $("#severity-one").slider({disabled: false});
                headacheObject.painSeverity[0].severityTime = valueText;
            }

            $("#severity-two-time").prop("disabled", false);
            $("#severity-two-time").prop({
                "type": "text",
                "name": "severity-time",
                "readonly": "readonly",
                "id": "severity-two-time",
                "data-mini": "true",
                "placeholder": "Set Time"
            });
        }
    });

    $("#severity-one").on("change", function () {
        headacheObject.painSeverity[0].severityValue = $("#severity-one").val();
        headacheObject.painSeverity[0].severityTime = $("#severity-one-time").val().substring(0, 5);
        headacheObject.painSeverity[0].severityTimeAMPM = $("#severity-one-time").val().substring(6, 8);
        headacheObject.painSeverity[0].severityDate = processDate();
        //headacheObject.painSeverity[0].severityDate = "04/29/2015";
    });


}

function setSeverity2RecordTime(){

    $("#time-text").hide();
    $("#severity-text").hide();

    $("#severity-two-time").mobiscroll().time({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {

            var startTimeString = headacheObject.headacheStartDate + " " + headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM;
            var severity2TimeString = processDate() + " " + valueText;
            //var severity2TimeString = "04/29/2015" + " " + valueText;
            var startTime = new Date(startTimeString);
            var severity2Time = new Date(severity2TimeString);
            var endTimeString = headacheObject.headacheEndDate + " " + headacheObject.headacheEndTime + " " + headacheObject.headacheEndTimeAMPM;
            var endTime = new Date(endTimeString);

            if(Date.parse(headacheObject.headacheEndDate) || (severity2Time < startTime)) {
                if (severity2Time < startTime) {
                    $("#time-text").text("Pain Severity record time cannot be earlier than ongoing headache start time " + "(" + startTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);

                }
                else if (severity2Time > endTime) {
                    $("#time-text").text("Pain Severity record time cannot be later than headache end time " + "(" + endTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);
                }
                else {
                    $("#time-text").hide();
                    $("#severity-text").hide();
                    $("#severity-two").slider({disabled: false});
                    headacheObject.painSeverity[1].severityTime = valueText;
                }
            }
            else {
                $("#time-text").hide();
                $("#severity-text").hide();
                $("#severity-two").slider({disabled: false});
                headacheObject.painSeverity[1].severityTime = valueText;
            }
        }
    });

    $("#severity-two").on("change", function () {
        headacheObject.painSeverity[1].severityValue = $("#severity-two").val();
        headacheObject.painSeverity[1].severityTime = $("#severity-two-time").val().substring(0,5);
        headacheObject.painSeverity[1].severityTimeAMPM = $("#severity-two-time").val().substring(6,8);
        headacheObject.painSeverity[1].severityDate = processDate();
        //headacheObject.painSeverity[1].severityDate = "04/29/2015";
    });
}

function setSeverity3RecordTime(){

    $("#time-text").hide();
    $("#severity-text").hide();

    $("#severity-three-time").mobiscroll().time({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        onSelect: function (valueText, inst) {

            var startTimeString = headacheObject.headacheStartDate + " " + headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM;
            var severity3TimeString = processDate() + " " + valueText;
            //var severity3TimeString = "04/29/2015" + " " + valueText;
            var startTime = new Date(startTimeString);
            var severity3Time = new Date(severity3TimeString);
            var endTimeString = headacheObject.headacheEndDate + " " + headacheObject.headacheEndTime + " " + headacheObject.headacheEndTimeAMPM;
            var endTime = new Date(endTimeString);

            if(Date.parse(headacheObject.headacheEndDate) || (severity3Time < startTime)) {
                if (severity3Time < startTime) {
                    $("#time-text").text("Here Pain Severity record time cannot be earlier than ongoing headache start time " + "(" + startTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);
                }
                else if (severity3Time > endTime) {
                    $("#time-text").text("Pain Severity record time cannot be later than headache end time " + "(" + endTime + ")");
                    $("#time-text").show();
                    $("#time-text").fadeOut(5000);
                }
                else {
                    $("#time-text").hide();
                    $("#severity-text").hide();
                    $("#severity-three").slider({disabled: false});
                    headacheObject.painSeverity[2].severityTime = valueText;
                }
            }
            else
            {
                $("#time-text").hide();
                $("#severity-text").hide();
                $("#severity-three").slider({disabled: false});
                headacheObject.painSeverity[2].severityTime = valueText;
            }
        }
    });

    $("#severity-three").on("change", function () {
        headacheObject.painSeverity[2].severityValue = $("#severity-three").val();
        headacheObject.painSeverity[2].severityTime = $("#severity-three-time").val().substring(0,5);
        headacheObject.painSeverity[2].severityTimeAMPM = $("#severity-three-time").val().substring(6,8);
        headacheObject.painSeverity[2].severityDate = processDate();
        //headacheObject.painSeverity[2].severityDate = "04/29/2015";

    });
}

function updateSeverityData(objectType){

    $("#severity-text").hide();
    $("#time-text").hide();


    headacheObject.lastSavedPage = "painSeverity.html";

    if(headacheObject.painSeverity[0].severityValue == 0)
    {
        if(Date.parse(headacheObject.headacheEndDate)) {
            if(Date.parse(processDate()) > Date.parse(headacheObject.headacheEndDate)){
            //if(Date.parse("04/29/2015") > Date.parse(headacheObject.headacheEndDate)){
                $("#severity-skip").attr("href","painDisability.html");
                $("#severity-back").attr("href", "index.html");
                $("#severity-text").hide();
                $("#time-text").hide();
            }
            else{
                $("#severity-text").show();
                $("#severity-text").fadeOut(2000);
            }
        }
        else{
            $("#severity-text").show();
            $("#severity-text").fadeOut(2000);
        }
    }
    else if(headacheObject.painSeverity[1].severityTime != null && headacheObject.painSeverity[1].severityValue == 0)
    {
        if(Date.parse(headacheObject.headacheEndDate)) {
            if(Date.parse(processDate()) > Date.parse(headacheObject.headacheEndDate)){
            //if(Date.parse("04/29/2015") > Date.parse(headacheObject.headacheEndDate)){
                $("#severity-skip").attr("href","painDisability.html");
                $("#severity-back").attr("href", "index.html");
                $("#severity-text").hide();
                $("#time-text").hide();
            }
            else{
                $("#severity-text").show();
                $("#severity-text").fadeOut(2000);
            }
        }
        else{
            $("#severity-text").show();
            $("#severity-text").fadeOut(2000);
        }
    }
    else if(headacheObject.painSeverity[2].severityTime != null && headacheObject.painSeverity[2].severityValue == 0)
    {
        if(Date.parse(headacheObject.headacheEndDate)) {
            if(Date.parse(processDate()) > Date.parse(headacheObject.headacheEndDate)){
            //if(Date.parse("04/29/2015") > Date.parse(headacheObject.headacheEndDate)){
                $("#severity-skip").attr("href","painDisability.html");
                $("#severity-back").attr("href", "index.html");
                $("#severity-text").hide();
                $("#time-text").hide();
            }
            else{
                $("#severity-text").show();
                $("#severity-text").fadeOut(2000);
            }
        }
        else{
            $("#severity-text").show();
            $("#severity-text").fadeOut(2000);
        }
    }
    else
    {

        var newHeadacheObj = {
            "endTime" : headacheObject.headacheEndTime,
            "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
            "endDate" : headacheObject.headacheEndDate,
            "severity" : [{recordTime : headacheObject.painSeverity[0].severityTime, recordTimeAMPM : headacheObject.painSeverity[0].severityTimeAMPM, recordDate : headacheObject.painSeverity[0].severityDate, severityLevel : headacheObject.painSeverity[0].severityValue},
                {recordTime : headacheObject.painSeverity[1].severityTime, recordTimeAMPM : headacheObject.painSeverity[1].severityTimeAMPM, recordDate : headacheObject.painSeverity[1].severityDate, severityLevel : headacheObject.painSeverity[1].severityValue},
                {recordTime : headacheObject.painSeverity[2].severityTime, recordTimeAMPM : headacheObject.painSeverity[2].severityTimeAMPM, recordDate : headacheObject.painSeverity[2].severityDate, severityLevel : headacheObject.painSeverity[2].severityValue}],
            "lastSaved" : headacheObject.lastSavedPage
        }

        var httpMethod = "put";
        var uid = "";
        uid = "/" + updateID;

        var newHeadacheObject = JSON.stringify(newHeadacheObj);

        // send to server
        $.ajax({
            url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
            contentType: "application/json", data : newHeadacheObject
        })

            .done(function(inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
                newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
                $.mobile.loading("hide");
                //alert("Start Time Updated");

            })
            .fail(function(inXHR, inStatus) {
                $.mobile.loading("hide");

            })
            .always(function(){
                checkForOngoingHeadache('headache');
            });


        $("#severity-skip").attr("href","painDisability.html");
        $("#severity-back").attr("href", "index.html");
        $("#severity-text").hide();
        $("#time-text").hide();
    }

}


function validateStartVsEndDate(){
    $("#msg-text").hide();

    var startDate = $("#start-show-date p").text() + " " + $("#start-show-time p").text();
    var endDate = $("#end-show-date p").text() + " " + $("#end-show-time p").text();

    var endDateOnly = $("#end-show-date p").text();


    //alert(endDateOnly + " " + processDate());
    if(endDate == "-- Still Going On")
    {
        $("#end-skip").attr("href", "painSeverity.html");
    }
    else if(Date.parse(endDate) <= Date.parse(startDate))
    {
        $("#end-skip").attr("href", "#");
        $("#msg-text").text("Headache End time cannot be earlier than Start time " + "(" + startDate + ").");
        $("#msg-text").show();
        $("#msg-text").fadeOut(4000);
    }
    else if(endDateOnly > processDate())
    //else if(endDateOnly > "04/29/2015")
    {
        $("#end-skip").attr("href", "#");
        $("#msg-text").text("Headache End time cannot be later than today's date " + "(" + processDate() + ").");
        //$("#msg-text").text("Headache End time cannot be later than today's date " + "(" + "05/08/2015" + ").");
        $("#msg-text").show();
        $("#msg-text").fadeOut(4000);
    }
        /*else if($("#end-show-time p").text() == "Still Going On" && $("#end-show-date p").text() != "--")
        {
            $("#msg-text").text("Set Headache End Time before going to next page.");
            $("#msg-text").show();
            $("#msg-text").fadeOut(4000);
        }
        else if($("#end-show-time p").text() != "Still Going On" && $("#end-show-date p").text() == "--")
        {
            $("#msg-text").text("Set Headache End Date before going to next page.");
            $("#msg-text").show();
            $("#msg-text").fadeOut(4000);
        }*/
    else
    {
        $("#end-skip").attr("href","painSeverity.html");
        $("#msg-text").hide();
    }
}


function showDisabilityMessage(){

    $("#disability-text").hide();

    $("#disability-range-0").on("click", function(){
        $("#disability-content p").text("Disability Level 0 : No problem at all to carry out activities.");
    });

    $("#disability-range-1").on("click", function(){
        $("#disability-content p").text("Disability Level 1 : Able to carry out usual activities fairly well.");
    });

    $("#disability-range-2").on("click", function(){
        $("#disability-content p").text("Disability Level 2 : Difficulty with usual activity, may cancel less important ones.");
    });


    $("#disability-range-3").on("click", function(){
        $("#disability-content p").text("Disability Level 3 : Have to miss work (all or partial) or go to bed for part of day.");
    });

}

function populateDisabilityData()
{

    if(headacheObject.painDisability.disabilityValue == 0) {
        $("#disability-content p").text("Disability Level 0 : No problem at all to carry out activities.");
        $("#disability-range-0").attr("checked","checked").checkboxradio("refresh");
        showDisabilityMessage();
    }
    else if(headacheObject.painDisability.disabilityValue == 1){
        $("#disability-content p").text("Disability Level 1 : Able to carry out usual activities fairly well.");
        $("#disability-range-1").attr("checked","checked").checkboxradio("refresh");
        showDisabilityMessage();
    }
    else if(headacheObject.painDisability.disabilityValue == 2) {
        $("#disability-content p").text("Disability Level 2 : Difficulty with usual activity, may cancel less important ones.");
        $("#disability-range-2").attr("checked","checked").checkboxradio("refresh");
        showDisabilityMessage();
    }
    else {
        $("#disability-content p").text("Disability Level 3 : Have to miss work (all or partial) or go to bed for part of day.");
        $("#disability-range-3").attr("checked","checked").checkboxradio("refresh");
        showDisabilityMessage();
    }


}

function populatePainLocationData()
{
    var backgroundColor = "lightgray";
    var fontWeight = "bold";
    var clusterImage = "img/cluster_selected.png";
    var migraineImage = "img/migraine_selected.png";
    var neckImage = "img/neck_selected.png";
    var sinusImage = "img/sinus_selected.png";
    var tensionImage = "img/tension_selected.png";
    var tmjImage = "img/tmj_selected.png";


    if(headacheObject.painLocation.tmjHeadache == true){
        $("#tmj").attr("src", tmjImage);
        $("#tmj-blk").css("background-color", backgroundColor);
        $("#tmj-blk p").css("font-weight", fontWeight);
    }

    if(headacheObject.painLocation.sinusHeadache == true){
        $("#sinus").attr("src", sinusImage);
        $("#sinus-blk").css("background-color", backgroundColor);
        $("#sinus-blk p").css("font-weight", fontWeight);
    }

    if(headacheObject.painLocation.clusterHeadache == true){
        $("#cluster").attr("src", clusterImage);
        $("#cluster-blk").css("background-color", backgroundColor);
        $("#cluster-blk p").css("font-weight", fontWeight);
    }

    if( headacheObject.painLocation.tensionHeadache == true){
        $("#tension").attr("src", tensionImage);
        $("#tension-blk").css("background-color", backgroundColor);
        $("#tension-blk p").css("font-weight", fontWeight);
    }

    if(headacheObject.painLocation.migraineHeadache == true){
        $("#migraine").attr("src", migraineImage);
        $("#migraine-blk").css("background-color", backgroundColor);
        $("#migraine-blk p").css("font-weight", fontWeight);
    }

    if(headacheObject.painLocation.neckHeadache == true){
        $("#neck").attr("src", neckImage);
        $("#neck-blk").css("background-color", backgroundColor);
        $("#neck-blk p").css("font-weight", fontWeight);
    }
}


function populatePainNatureData(){
    if(headacheObject.painNature == "Throbbing, Pounding or Pulsating") {
        $("input[id=pain-nature-throbbing]").attr("checked", true).checkboxradio("refresh");
        $("input[id=pain-nature-pressing]").attr("checked", false).checkboxradio("refresh");
        $("input[id=pain-nature-steady]").attr("checked", false).checkboxradio("refresh");
    }

    if(headacheObject.painNature == "Pressing Pain or Dull Steady Ache") {
        $("input[id=pain-nature-throbbing]").attr("checked", false).checkboxradio("refresh");
        $("input[id=pain-nature-pressing]").attr("checked", true).checkboxradio("refresh");
        $("input[id=pain-nature-steady]").attr("checked", false).checkboxradio("refresh");
    }

    if(headacheObject.painNature == "Steady Sharp or Burning Ache") {
        $("input[id=pain-nature-throbbing]").attr("checked", false).checkboxradio("refresh");
        $("input[id=pain-nature-pressing]").attr("checked", false).checkboxradio("refresh");
        $("input[id=pain-nature-steady]").attr("checked", true).checkboxradio("refresh");
    }


}

function populatePainSymptomData(){
    if(headacheObject.painSymptoms.noSymptom == true)
        $("input[id=no-symptom]").attr("checked", true).checkboxradio("refresh");
    else
        $("input[id=no-symptom]").attr("checked", false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.lightSensitivity == true)
        $("input[id=light-sensitivity]").attr("checked", true).checkboxradio("refresh");
    else
        $("input[id=light-sensitivity]").attr("checked", false).checkboxradio("refresh");


    if(headacheObject.painSymptoms.soundSensitivity == true)
        $("#sound-sensitivity").attr('checked', true).checkboxradio("refresh");
    else
        $("#sound-sensitivity").attr('checked', false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.nasalCongestion == true)
        $("#nasal-congestion").attr('checked', true).checkboxradio("refresh");
    else
        $("#nasal-congestion").attr('checked', false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.nauseaCondition == true)
        $("#nausea-condition").attr('checked', true).checkboxradio("refresh");
    else
        $("#nausea-condition").attr('checked', false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.depressedMood == true)
        $("#depressed-mood").attr('checked', true).checkboxradio("refresh");
    else
        $("#depressed-mood").attr('checked', false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.smellSensitivity == true)
        $("#smell-sensitivity").attr('checked', true).checkboxradio("refresh");
    else
        $("#smell-sensitivity").attr('checked', false).checkboxradio("refresh");


    if(headacheObject.painSymptoms.feelAnxious == true)
        $("#feel-anxious").attr('checked', true).checkboxradio("refresh");
    else
        $("#feel-anxious").attr('checked', false).checkboxradio("refresh");

    if(headacheObject.painSymptoms.otherSymptom == true)
        $("#other-symptom").attr('checked', true).checkboxradio("refresh");
    else
        $("#other-symptom").attr('checked', false).checkboxradio("refresh");
}
/**
 * Show the dialog when network connectivity is unavailable.
 */
function showConnectivityMsg() {

    networkAvailable = false;
    $("#infoDialogHeader").html("No Network Connectivity");
    $("#infoDialogContent").html(
        "Network connectivity is currently unavailable. The ability to " +
        "create new items, update items and delete items has been " +
        "disabled.  You can still browse locally-cached data. Restart " +
        "the app when connectivity has been restored."
    );
    $.mobile.changePage($("#infoDialog"), { role : "dialog" });

} // End showConnectivityMsg().

function painLocationSelected(){

    var tmjIndex = 0;
    var sinusIndex = 0;
    var clusterIndex = 0;
    var migraineIndex = 0;
    var neckIndex = 0;
    var tensionIndex = 0;
    var backgroundColor = ["lightgray", "#E6E6FA"];
    var fontWeight = ["bold", "normal"];
    var clusterImage = new Array("img/cluster_selected.png", "img/cluster.png");
    var migraineImage = new Array("img/migraine_selected.png", "img/migraine.png");
    var neckImage = new Array("img/neck_selected.png", "img/neck.png");
    var sinusImage = new Array("img/sinus_selected.png", "img/sinus.png");
    var tensionImage = new Array("img/tension_selected.png", "img/tension.png");
    var tmjImage = new Array("img/tmj_selected.png", "img/tmj.png");

    $("#tmj").on("click", function(){
        $(this).attr("src", tmjImage[tmjIndex%2]);
        $("#tmj-blk").css("background-color", backgroundColor[tmjIndex%2]);
        $("#tmj-blk p").css("font-weight", fontWeight[tmjIndex%2]);
        if(tmjIndex%2 == 0)
            headacheObject.painLocation.tmjHeadache = true;
        else
            headacheObject.painLocation.tmjHeadache = false;
        tmjIndex++;
    });

    $("#sinus").on("click", function(){
        $(this).attr("src", sinusImage[sinusIndex%2]);
        $("#sinus-blk").css("background-color", backgroundColor[sinusIndex%2]);
        $("#sinus-blk p").css("font-weight", fontWeight[sinusIndex%2]);
        if(sinusIndex%2 == 0)
            headacheObject.painLocation.sinusHeadache = true;
        else
            headacheObject.painLocation.sinusHeadache = false;
        sinusIndex++;
    });

    $("#cluster").on("click", function(){
        $(this).attr("src", clusterImage[clusterIndex%2]);
        $("#cluster-blk").css("background-color", backgroundColor[clusterIndex%2]);
        $("#cluster-blk p").css("font-weight", fontWeight[clusterIndex%2]);
        if(clusterIndex%2 == 0)
            headacheObject.painLocation.clusterHeadache = true;
        else
            headacheObject.painLocation.clusterHeadache = false;

        clusterIndex++;
    });

    $("#tension").on("click", function(){
        $(this).attr("src", tensionImage[tensionIndex%2]);
        $("#tension-blk").css("background-color", backgroundColor[tensionIndex%2]);
        $("#tension-blk p").css("font-weight", fontWeight[tensionIndex%2]);
        if(tensionIndex%2 == 0)
            headacheObject.painLocation.tensionHeadache = true;
        else
            headacheObject.painLocation.tensionHeadache = false;
        tensionIndex++;
    });

    $("#migraine").on("click", function(){
        $(this).attr("src", migraineImage[migraineIndex%2]);
        $("#migraine-blk").css("background-color", backgroundColor[migraineIndex%2]);
        $("#migraine-blk p").css("font-weight", fontWeight[migraineIndex%2]);
        if(migraineIndex%2 == 0)
            headacheObject.painLocation.migraineHeadache = true;
        else
            headacheObject.painLocation.migraineHeadache = false;
        migraineIndex++;
    });


    $("#neck").on("click", function(){
        $(this).attr("src", neckImage[neckIndex%2]);
        $("#neck-blk").css("background-color", backgroundColor[neckIndex%2]);
        $("#neck-blk p").css("font-weight", fontWeight[neckIndex%2]);
        if(neckIndex%2 == 0)
            headacheObject.painLocation.neckHeadache = true;
        else
            headacheObject.painLocation.neckHeadache = false;
        neckIndex++;
    });
}

function physicalLocationSelected(){

    var homeIndex = 0;
    var officeIndex = 0;
    var schoolIndex = 0;
    var parkIndex = 0;
    var partyIndex = 0;
    var shoppingIndex = 0;
    var stadiumIndex = 0;
    var transitIndex = 0;
    var fontWeight = ["bold", "normal"];
    var homeImage = new Array("img/home-icon-alt.png", "img/home-icon.png");
    var officeImage = new Array("img/office-icon-alt.png", "img/office-icon.png");
    var schoolImage = new Array("img/school-icon-alt.png", "img/school-icon.png");
    var parkImage = new Array("img/park-icon-alt.png", "img/park-icon.png");
    var partyImage = new Array("img/party-icon-alt.png", "img/party-icon.png");
    var barImage = new Array("img/bar-icon-alt.png", "img/bar-icon.png");
    var shoppingImage = new Array("img/shopping-icon-alt.png", "img/shopping-icon.png");
    var stadiumImage = new Array("img/stadium-icon-alt.png", "img/stadium-icon.png");
    var transitImage = new Array("img/transit-icon-alt.png", "img/transit-icon.png");

    $("#home-icon").on("click", function(){
        $(this).attr("src", homeImage[homeIndex%2]);
        $("#at-home-text").css("font-weight", fontWeight[homeIndex%2]);
        if(homeIndex%2 == 0)
            headacheObject.userLocation = "Home";
        homeIndex++;

        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-work-text, #at-school-text, #at-park-text, #at-transit-text, #at-party-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        officeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;

    });

    $("#office-icon").on("click", function(){
        $(this).attr("src", officeImage[officeIndex%2]);
        $("#at-work-text").css("font-weight", fontWeight[officeIndex%2]);
        if(officeIndex%2 == 0)
            headacheObject.userLocation = "Work";
        officeIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-school-text, #at-park-text, #at-transit-text, #at-party-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;
    });

    $("#school-icon").on("click", function(){
        $(this).attr("src", schoolImage[schoolIndex%2]);
        $("#at-school-text").css("font-weight", fontWeight[schoolIndex%2]);
        if(schoolIndex%2 == 0)
            headacheObject.userLocation = "School";
        schoolIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-office-text, #at-park-text, #at-transit-text, #at-party-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;

    });

    $("#park-icon").on("click", function(){
        $(this).attr("src", parkImage[parkIndex%2]);
        $("#at-park-text").css("font-weight", fontWeight[parkIndex%2]);
        if(parkIndex%2 == 0)
            headacheObject.userLocation = "Park";
        parkIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-office-text, #at-school-text, #at-transit-text, #at-party-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        schoolIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;

    });

    $("#transit-icon").on("click", function(){
        $(this).attr("src", transitImage[transitIndex%2]);
        $("#at-transit-text").css("font-weight", fontWeight[transitIndex%2]);
        if(transitIndex%2 == 0)
            headacheObject.userLocation = "In-Transit";
        transitIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-office-text, #at-school-text, #at-park-text, #at-party-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;

    });

    $("#party-icon").on("click", function(){
        $(this).attr("src", partyImage[partyIndex%2]);
        $("#at-party-text").css("font-weight", fontWeight[partyIndex%2]);
        if(partyIndex%2 == 0)
            headacheObject.userLocation = "Party";
        partyIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-office-text, #at-school-text, #at-park-text, #at-transit-text, #at-stadium-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        shoppingIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;

    });

    $("#stadium-icon").on("click", function(){
        $(this).attr("src", stadiumImage[stadiumIndex%2]);
        $("#at-stadium-text").css("font-weight", fontWeight[stadiumIndex%2]);
        if(stadiumIndex%2 == 0)
            headacheObject.userLocation = "Playground";
        stadiumIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#shopping-icon").attr("src", shoppingImage[1]);
        $("#at-home-text, #at-office-text, #at-school-text, #at-park-text, #at-transit-text, #at-party-text, #at-shopping-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        shoppingIndex = 0;
        transitIndex = 0;

    });

    $("#shopping-icon").on("click", function(){
        $(this).attr("src", shoppingImage[shoppingIndex%2]);
        $("#at-shopping-text").css("font-weight", fontWeight[shoppingIndex%2]);
        if(shoppingIndex%2 == 0)
            headacheObject.userLocation = "Shopping Center";
        shoppingIndex++;

        $("#home-icon").attr("src", homeImage[1]);
        $("#office-icon").attr("src", officeImage[1]);
        $("#school-icon").attr("src", schoolImage[1]);
        $("#park-icon").attr("src", parkImage[1]);
        $("#transit-icon").attr("src", transitImage[1]);
        $("#party-icon").attr("src", partyImage[1]);
        $("#stadium-icon").attr("src", stadiumImage[1]);
        $("#at-home-text, #at-office-text, #at-school-text, #at-park-text, #at-transit-text, #at-party-text, #at-stadium-text").css("font-weight", "normal");
        homeIndex = 0;
        officeIndex = 0;
        schoolIndex = 0;
        parkIndex = 0;
        partyIndex = 0;
        stadiumIndex = 0;
        transitIndex = 0;


    });

}

function populateUserLocationData(){

    var fontWeight = "bold";
    var homeImage = "img/home-icon-alt.png";
    var officeImage = "img/office-icon-alt.png";
    var schoolImage = "img/school-icon-alt.png";
    var parkImage = "img/park-icon-alt.png";
    var partyImage = "img/party-icon-alt.png";
    var barImage = "img/bar-icon-alt.png";
    var shoppingImage = "img/shopping-icon-alt.png";
    var stadiumImage = "img/stadium-icon-alt.png";
    var transitImage = "img/transit-icon-alt.png";

    if(headacheObject.userLocation == "Home")
    {
        $("#home-icon").attr("src", homeImage);
        $("#at-home-text").css("font-weight", fontWeight);
    }

    if(headacheObject.userLocation == "Work")
    {
        $("#office-icon").attr("src", officeImage);
        $("#at-work-text").css("font-weight", fontWeight);
    }
    if(headacheObject.userLocation == "School")
    {
        $("#school-icon").attr("src", schoolImage);
        $("#at-school-text").css("font-weight", fontWeight);
    }
    if(headacheObject.userLocation == "Park")
    {
        $("#park-icon").attr("src", parkImage);
        $("#at-park-text").css("font-weight", fontWeight);
    }
    if(headacheObject.userLocation == "In-Transit")
    {
        $("#transit-icon").attr("src", transitImage);
        $("#at-transit-text").css("font-weight", fontWeight);
    }
    if(headacheObject.userLocation == "Party")
    {
        $("#party-icon").attr("src", partyImage);
        $("#at-party-text").css("font-weight", fontWeight);
    }
    if(headacheObject.userLocation == "Playground")
    {
        $("#stadium-icon").attr("src", stadiumImage);
        $("#at-stadium-text").css("font-weight", fontWeight);
    }

    if(headacheObject.userLocation == "Shopping Center")
    {
        $("#shopping-icon").attr("src", officeImage);
        $("#at-shopping-text").css("font-weight", fontWeight);
    }
}

function updateUserLocationData(objectType)
{
    headacheObject.lastSavedPage = "userLocation.html";

    var newHeadacheObj = {
        "userLocation" : headacheObject.userLocation,
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;


    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });
    $("#userloc-back").attr("href","index.html");
    $("#userloc-skip").attr("href", "painNote.html");
}
function updateStartTimeData(objectType){

    headacheObject.headacheStartTime = $("#start-show-time p").text().substring(0,5);
    headacheObject.headacheStartTimeAMPM = $("#start-show-time p").text().substring(6,8);
    headacheObject.headacheStartDate = $("#start-show-date p").text();
    headacheObject.lastSavedPage = "startTime.html";

    var newHeadacheObj = {
        "startTime" : headacheObject.headacheStartTime,
        "startTimeAMPM" : headacheObject.headacheStartTimeAMPM,
        "startDate" : headacheObject.headacheStartDate,
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }

        //var items = getAllFromLocalStorage(inType);
        //var items = JSON.parse(localStorage.getItem());
        //updateID = items._id;
        //alert(updateID);
        var httpMethod = "put";
        var uid = "";
        uid = "/" + updateID;


        var newHeadacheObject = JSON.stringify(newHeadacheObj);
        //alert(newHeadacheObject);

        //updateID = null;

        // send to server
        $.ajax({
            url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
            contentType: "application/json", data : newHeadacheObject
        })
            //alert(json.stringify(newHeadacheObject))
            //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

            .done(function(inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
                newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
                $.mobile.loading("hide");
                //alert("Start Time Updated");

            })
            .fail(function(inXHR, inStatus) {
                $.mobile.loading("hide");

            })
            .always(function(){
                checkForOngoingHeadache('headache');
            });
}


function updateEndTimeData(objectType){


    validateStartVsEndDate();
    //if(headacheObject.headacheEndTime == null)
        headacheObject.headacheEndTime = $("#end-show-time p").text().substring(0,5);
    //if(headacheObject.headacheEndTimeAMPM == null)
        headacheObject.headacheEndTimeAMPM = $("#end-show-time p").text().substring(6,8);
    //if(headacheObject.headacheEndDate == null)
        headacheObject.headacheEndDate = $("#end-show-date p").text();
    //if(headacheObject.lastSavedPage == null)
        headacheObject.lastSavedPage = "endTime.html";

    var newHeadacheObj = {
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }

    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;

    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("End Time Updated" + newHeadacheObject.lastSaved);
            //alert(objectType + "_" + inResponse);

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });


}

function updateDisabilityData(objectType){

    headacheObject.painDisability.disabilityValue = $("input[name=disability-range]:checked").val();
    headacheObject.painDisability.disabilityDate = processDate();
    //headacheObject.painDisability.disabilityDate = "04/29/2015";
    headacheObject.lastSavedPage = "painDisability.html";



    if(headacheObject.painDisability.disabilityValue == null)
    {
        if(Date.parse(headacheObject.headacheEndDate)) {
            if(Date.parse(processDate()) > Date.parse(headacheObject.headacheEndDate)){
            //if(Date.parse("04/29/2015") > Date.parse(headacheObject.headacheEndDate)){
                $("#paindis-skip").attr("href","painLocation.html");
                $("#paindis-back").attr("href", "index.html");
                $("#disability-text").hide();
            }
            else{
                $("#disability-text").show();
                $("#disability-text").fadeOut(2000);
            }
        }
        else{
            $("#disability-text").show();
            $("#disability-text").fadeOut(2000);
        }
    }
    else {


        var newHeadacheObj = {
            "endTime" : headacheObject.headacheEndTime,
            "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
            "endDate" : headacheObject.headacheEndDate,
            "disability": {
                "recordDate": headacheObject.painDisability.disabilityDate,
                "disabilityLevel": headacheObject.painDisability.disabilityValue
            },
            "lastSaved": headacheObject.lastSavedPage,
            "confirmed" : headacheObject.confirmedData
        }

        var httpMethod = "put";
        var uid = "";
        uid = "/" + updateID;

        var newHeadacheObject = JSON.stringify(newHeadacheObj);
        updateID = null;

        // send to server
        $.ajax({
            url: ajaxURLPrefix + "/" + objectType + uid, type: httpMethod,
            contentType: "application/json", data: newHeadacheObject
        })

            .done(function (inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
                newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
                $.mobile.loading("hide");
                //alert("End Time Updated" + newHeadacheObject.lastSaved);
                //alert(objectType + "_" + inResponse);
                checkForOngoingHeadache('headache');
            })
            .fail(function (inXHR, inStatus) {
                $.mobile.loading("hide");

            })
            .always(function(){
                checkForOngoingHeadache('headache');
            });
        $("#paindis-skip").attr("href","painLocation.html");
        $("#paindis-back").attr("href", "index.html");
    }




}

function updatePainLocationData(objectType){
    //"painLocation" : {"tmjHeadache":false, "sinusHeadache":false, "clusterHeadache":false, "tensionHeadache":false, "migraineHeadache":false, "neckHeadache":false},

    headacheObject.lastSavedPage = "painLocation.html";

    var newHeadacheObj = {
        "painArea" : {"tmj" : headacheObject.painLocation.tmjHeadache, "sinus" : headacheObject.painLocation.sinusHeadache, "cluster" : headacheObject.painLocation.clusterHeadache, "tension" : headacheObject.painLocation.tensionHeadache, "migraine" : headacheObject.painLocation.migraineHeadache, "neck" : headacheObject.painLocation.neckHeadache},
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }



    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;


    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });
    $("#painloc-skip").attr("href","painNature.html");
    $("#painloc-back").attr("href", "index.html");
}

function updatePainNatureData(objectType){

    headacheObject.lastSavedPage = "painNature.html";

    headacheObject.painNature = $("input[name=pain-nature]:checked").val();



    if(headacheObject.painNature == undefined)
        headacheObject.painNature = null;

    var newHeadacheObj = {
        "painNature" : headacheObject.painNature,
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;


    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });
    $("#painnature-skip").attr("href","painSymptom.html");
    $("#painnature-back").attr("href", "index.html");
}


function updateSymptomData(objectType){

    headacheObject.lastSavedPage = "painSymptom.html";


    if($("#no-symptom").prop('checked'))
        headacheObject.painSymptoms.noSymptom = true;
    else
        headacheObject.painSymptoms.noSymptom = false;

    if($("#light-sensitivity").prop('checked'))
        headacheObject.painSymptoms.lightSensitivity = true;
    else
        headacheObject.painSymptoms.lightSensitivity = false;

    if($("#sound-sensitivity").prop('checked'))
        headacheObject.painSymptoms.soundSensitivity = true;
    else
        headacheObject.painSymptoms.soundSensitivity = false;

    if($("#nasal-congestion").prop('checked'))
        headacheObject.painSymptoms.nasalCongestion = true;
    else
        headacheObject.painSymptoms.nasalCongestion = false;

    if($("#nausea-condition").prop('checked'))
        headacheObject.painSymptoms.nauseaCondition = true;
    else
        headacheObject.painSymptoms.nauseaCondition = false;
    if($("#depressed-mood").prop('checked'))
        headacheObject.painSymptoms.depressedMood = true;
    else
        headacheObject.painSymptoms.depressedMood = false;
    if($("#smell-sensitivity").prop('checked'))
        headacheObject.painSymptoms.smellSensitivity = true;
    else
        headacheObject.painSymptoms.smellSensitivity = false;
    if($("#feel-anxious").prop('checked'))
        headacheObject.painSymptoms.feelAnxious = true;
    else
        headacheObject.painSymptoms.feelAnxious = false;
    if($("#other-symptom").prop('checked'))
        headacheObject.painSymptoms.otherSymptom = true;
    else
        headacheObject.painSymptoms.otherSymptom = false;

    var newHeadacheObj = {
        "painSymptom" : {noSymptom:headacheObject.painSymptoms.noSymptom, lightSensitivity : headacheObject.painSymptoms.lightSensitivity, soundSensitivity: headacheObject.painSymptoms.soundSensitivity, nasalCongestion : headacheObject.painSymptoms.nasalCongestion, nauseaCondition:headacheObject.painSymptoms.nauseaCondition, depressedMood:headacheObject.painSymptoms.depressedMood, smellSensitivity:headacheObject.painSymptoms.smellSensitivity, feelAnxious:headacheObject.painSymptoms.feelAnxious, otherSymptom:headacheObject.painSymptoms.otherSymptom},
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;


    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });
    $("#painsym-skip").attr("href","userLocation.html");
    $("#painsym-back").attr("href", "index.html");

}

function updateUserNoteData(objectType){

    headacheObject.lastSavedPage = "painNote.html";

    headacheObject.userNote = $("#headachenote").val();

    var newHeadacheObj = {
        "painNote" : headacheObject.userNote,
        "endTime" : headacheObject.headacheEndTime,
        "endTimeAMPM" : headacheObject.headacheEndTimeAMPM,
        "endDate" : headacheObject.headacheEndDate,
        "lastSaved" : headacheObject.lastSavedPage,
        "confirmed" : headacheObject.confirmedData
    }


    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "put";
    var uid = "";
    uid = "/" + updateID;


    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");
        })
        .always(function(){
            checkForOngoingHeadache('headache');
        });
    $("#note-skip").attr("href","summaryData.html");
    $("#note-back").attr("href", "index.html");


}

function populateUserNoteData(){
    $("#headachenote").val(headacheObject.userNote);
}

function showSummary(){

    $("#summary-header h1").text("Summary : " + processDate());

    $("#start-header").text("Start Time").css({"font-size": 9, "font-weight":"bold", "text-align": "center"});
    $("#headache-start-time").text(headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
    $("#headache-start-date").text(headacheObject.headacheStartDate).css({"font-size": 10, "text-align": "center"});

    $("#duration-header").text("Duration").css({"font-size": 9, "font-weight":"bold", "text-align": "center"});

    if (headacheObject.headacheEndTime == "Still")
    {
        $("#end-header").text("End Time").css({"font-size": 9, "font-weight":"bold", "text-align": "center", "color":"red"});
        $("#headache-end-time").text("Going On").css({"font-weight": "bold", "text-align":"center", "font-size": 10, "color":"red"});
        $("#headache-end-date").text("");
        $("#duration-number").text("--").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

        $("#end-header").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
        $("#headache-end-time").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
        $("#duration-number").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
    }
    else
    {
        $("#end-header").text("End Time").css({"font-size": 9, "font-weight":"bold", "text-align": "center", "color": "black"});
        $("#headache-end-time").text(headacheObject.headacheEndTime+ " " + headacheObject.headacheEndTimeAMPM).css({"font-weight": "bold", "text-align":"center", "font-size": 10, "color": "black"});
        $("#headache-end-date").text(headacheObject.headacheEndDate).css({"font-size": 10, "text-align": "center"});
        var startTimeString = headacheObject.headacheStartDate + " " + headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM;
        var startTime = new Date(startTimeString);
        var endTimeString = headacheObject.headacheEndDate + " " + headacheObject.headacheEndTime + " " + headacheObject.headacheEndTimeAMPM;
        var endTime = new Date(endTimeString);

        var duration = calculateHeadacheDuration(startTime, endTime);

        $("#duration-number").text(duration).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
        $("#duration-unit").text("Hour(s)").css({"text-align":"center", "font-size": 10});

        $("#end-header").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
        $("#headache-end-time").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
        $("#duration-number").on("click", function(){
            $.mobile.changePage("endTime.html");
        });
    }

    $("#severity-time-one").text(headacheObject.painSeverity[0].severityTime + " " + headacheObject.painSeverity[0].severityTimeAMPM).css({"font-size": 9, "font-weight":"bold", "text-align": "center"});
    $("#severity-one-value").text("Severity: " + headacheObject.painSeverity[0].severityValue).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
    $("#severity-one-date").text(headacheObject.painSeverity[0].severityDate).css({"font-size": 10, "text-align": "center"});

    if(headacheObject.painSeverity[1].severityValue != 0)
    {
        $("#severity-time-two").text(headacheObject.painSeverity[1].severityTime + " " + headacheObject.painSeverity[0].severityTimeAMPM).css({"font-size": 9, "font-weight":"bold", "text-align": "center"});
        $("#severity-two-value").text("Severity: " + headacheObject.painSeverity[1].severityValue).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
        $("#severity-two-date").text(headacheObject.painSeverity[1].severityDate).css({"font-size": 10, "text-align": "center"});
    }
    else
    {
        $("#severity-two-value").text("Tap to add severity.").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

        $("#severity-two-value").on("click", function(){
            $.mobile.changePage("painSeverity.html");
        });
    }

    if(headacheObject.painSeverity[2].severityValue != 0)
    {
        $("#severity-time-three").text(headacheObject.painSeverity[2].severityTime + " " + headacheObject.painSeverity[0].severityTimeAMPM).css({"font-size": 9, "font-weight":"bold", "text-align": "center"});
        $("#severity-three-value").text("Severity: " + headacheObject.painSeverity[2].severityValue).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
        $("#severity-three-date").text(headacheObject.painSeverity[2].severityDate).css({"font-size": 10, "text-align": "center"});
    }
    else
    {
        $("#severity-three-value").text("Tap to add severity").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

        $("#severity-three-value").on("click", function(){
            $.mobile.changePage("painSeverity.html");
        });
    }

    $("#disability-level-text").text("Disability").css({"font-size": 9, "font-weight":"bold", "text-align": "center"});
    $("#disability-value").text("Level: " + headacheObject.painDisability.disabilityValue).css({"font-weight": "bold", "text-align":"center", "font-size": 10});
    $("#disability-record-time").text(headacheObject.painDisability.disabilityDate).css({"font-size": 10, "text-align": "center"});

    $("#disability-level-text").on("click", function(){
        $.mobile.changePage("painDisability.html");
    });

    $("#disability-value").on("click", function(){
        $.mobile.changePage("painDisability.html");
    });

    $("#disability-record-time").on("click", function(){
        $.mobile.changePage("painDisability.html");
    });

    if(headacheObject.painLocation.tmjHeadache)
        $("#painloc-two-block").append("Temples." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.sinusHeadache)
        $("#painloc-two-block").append("Sinus areas." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.clusterHeadache)
        $("#painloc-two-block").append("Behind eye." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.migraineHeadache)
        $("#painloc-two-block").append("One sided." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.tensionHeadache)
        $("#painloc-two-block").append("Squeezing band around head." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.neckHeadache)
        $("#painloc-two-block").append("Top and/or back of head." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    if(headacheObject.painLocation.neckHeadache == false && headacheObject.painLocation.tensionHeadache == false && headacheObject.painLocation.migraineHeadache == false && headacheObject.painLocation.clusterHeadache == false && headacheObject.painLocation.sinusHeadache == false && headacheObject.painLocation.tmjHeadache == false)
    {
        $("#painloc-two-block").text("Tap to add pain Location").css({"font-weight": "bold", "text-align":"center", "font-size": 10});
    }
    else
    {
        $("#painloc-two-block").text("");
        if(headacheObject.painLocation.tmjHeadache)
            $("#painloc-two-block").append("Temples." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painLocation.sinusHeadache)
            $("#painloc-two-block").append("Sinus areas." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painLocation.clusterHeadache)
            $("#painloc-two-block").append("Behind eye." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painLocation.migraineHeadache)
            $("#painloc-two-block").append("One sided." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painLocation.tensionHeadache)
            $("#painloc-two-block").append("Squeezing band around head." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painLocation.neckHeadache)
            $("#painloc-two-block").append("Top and/or back of head." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    }


    $("#painloc-two-block").on("click", function(){
        $.mobile.changePage("painLocation.html");
    });

    if(headacheObject.painNature != null)
        $("#painnature-two-block").text(headacheObject.painNature).css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    else
        $("#painnature-two-block").text("Tap to add pain nature").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

    $("#painnature-two-block").on("click", function(){
        $.mobile.changePage("painNature.html");
    });


    if(!headacheObject.painSymptoms.depressedMood && !headacheObject.painSymptoms.soundSensitivity && !headacheObject.painSymptoms.smellSensitivity && !headacheObject.painSymptoms.otherSymptom && !headacheObject.painSymptoms.noSymptom && !headacheObject.painSymptoms.nauseaCondition && !headacheObject.painSymptoms.nasalCongestion && !headacheObject.painSymptoms.lightSensitivity && !headacheObject.painSymptoms.feelAnxious)
        $("#symptom-two-block").text("Tap to add symptom").css({"font-weight": "bold", "text-align":"center", "font-size": 10});
    else
    {
        $("#symptom-two-block").text("");
        if(headacheObject.painSymptoms.depressedMood)
            $("#symptom-two-block").append("Depressed mood." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.feelAnxious)
            $("#symptom-two-block").append("Feel anxious." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.lightSensitivity)
            $("#symptom-two-block").append("Light sensitivity." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.nasalCongestion)
            $("#symptom-two-block").append("Nasal congestion." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.nauseaCondition)
            $("#symptom-two-block").append("Nausea." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.noSymptom)
            $("#symptom-two-block").append("No symptom." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.otherSymptom)
            $("#symptom-two-block").append("Other symptom." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.smellSensitivity)
            $("#symptom-two-block").append("Smell sensitivity." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
        if(headacheObject.painSymptoms.soundSensitivity)
            $("#symptom-two-block").append("Sound sensitivity." + "\n").css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    }

    $("#symptom-two-block").on("click", function(){
        $.mobile.changePage("painSymptom.html");
    });

    if(headacheObject.userLocation != null)
        $("#userloc-two-block").text(headacheObject.userLocation).css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    else
        $("#userloc-two-block").text("Tap to add location").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

    $("#userloc-two-block").on("click", function(){
        $.mobile.changePage("userLocation.html");
    });

    if(headacheObject.userNote != null)
        $("#note-two-block").text(headacheObject.userNote).css({"font-size": 10, "font-weight":"bold", "text-align": "center"});
    else
        $("#note-two-block").text("Tap to add note").css({"font-weight": "bold", "text-align":"center", "font-size": 10});

    $("#note-two-block").on("click", function(){
        $.mobile.changePage("painNote.html");
    });

    //alert(headacheObject.headacheEndDate + " show summary")
}

function calculateHeadacheDuration(startTime, endTime){

    var d = (endTime - startTime)/(1000*60*60);
    var rd = d.toFixed(2);

    return rd;
}

function createHeadacheObject(inType){


    var user = window.sessionStorage.getItem("currentUser");
    if(user)
        headacheObject.userID = user;
    //window.sessionStorage.clear();

    var newHeadacheObj = {
        "userID" : headacheObject.userID,
        "headacheID" : null,
        startTime : null,
        startTimeAMPM : null,
        startDate : null,
        endTime : null,
        endTimeAMPM : null,
        endDate : null,
        severity : [{recordTime : null, recordTimeAMPM :null, recordDate : null, severityLevel : null},
            {recordTime : null, recordTimeAMPM : null, recordDate : null, severityLevel : null},
            {recordTime : null, recordTimeAMPM : null, recordDate : null, severityLevel : null}],
        disability : {recordDate : null, disabilityLevel : null},
        painArea : {tmj : false, sinus : false, cluster : false, tension : false, migraine : false, neck : false},
        painNature : null,
        painSymptom : {noSymptom : false, lightSensitivity : false, soundSensitivity : false, nasalCongestion : false, nauseaCondition : false, depressedMood : false, smellSensitivity : false, feelAnxious : false, otherSymptom : false},
        userLocation : null,
        userNote : null,
        lastSaved : "startTime.html",
        "confirmed" : false
        }
    var httpMethod = "post";
    var uid = "";
    //if (updateID) {
    //    httpMethod = "put";
    //    uid = "/" + updateID;
    //}

    var newHeadacheObject = JSON.stringify(newHeadacheObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + inType + uid, type : httpMethod,
        contentType: "application/json", data : newHeadacheObject
    })
    //alert(json.stringify(newHeadacheObject))
    //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
            newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(inType + "_" + inResponse, newHeadacheObject);
            $.mobile.loading("hide");
            //var items = window.localStorage.getItem(inType + "_" + inResponse);
            //alert(items)
            updateID = inResponse;
            //alert("New Headache created in database");
        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });
}


function deleteHeadacheEntry(objectType){

    // Scrim screen for the duration of the call.
    $.mobile.loading("show");

    var uid = "/" + updateID;

    // Clear entry form and reset updateID.
    updateID = null;

    var currentUser = headacheObject.userID;
    // Send to server.
    $.ajax({ url : ajaxURLPrefix + "/" + objectType + uid, type : "delete" })
        .done(function(inResponse) {
            // Remove item from localStorage.
            window.localStorage.removeItem(objectType + "_" + inResponse);
            window.sessionStorage.setItem("currentUser", headacheObject.userID);
            window.sessionStorage.setItem("currentPass", headacheObject.userPass);
            // Now repopulate the listview from localStorage.  This is NOT the most
            // efficient way to go about doing this, but it's expedient in terms of
            // writing the code and for small data sets the performance will be fine.
            //populateList(inType);
            // Now update the UI as appropriate and we're done.
            $.mobile.loading("hide");
            $("#infoDialogHeader").html("Success");
            $("#infoDialogContent").html("Delete from server complete");
            $.mobile.changePage($("#infoDialog"), { role : "dialog" });

        })
        .fail(function(inXHR, inStatus) {
            alert(inStatus);
            $.mobile.loading("hide");
            $("#infoDialogHeader").html("Error");
            $("#infoDialogContent").html(inStatus);
            $.mobile.changePage($("#infoDialog"), { role : "dialog" });
        })
        .always(function (){
            setTimeout(function(){document.location.href = "index.html";},200);
        });


    //$("#summary-back").attr("href", "index.html");
    $("#unfinished p").hide();
    $("#ongoing p").hide();
    //initialize();
    //downloadServerData();

}

function validateConfirmation(){
    $("#summary-save").on("click", function() {
        if (headacheObject.headacheEndDate == null || headacheObject.headacheEndDate == "--")
            $("#popupDialog").popup("open");
        else
        {
            $("#popupDialog").popup("close");
            confirmEntry('headache');
        }
    });
}


function confirmEntry(objectType){

    //$("#popupDialog").popup('open');

    headacheObject.confirmedData = true;
    headacheObject.lastSavedPage = "summaryData.html";

    if(headacheObject.headacheEndDate == null || headacheObject.headacheEndDate == "--")
    {
        //$("#infoDialogHeader").html("Message");
        //$("#infoDialogContent").html("Tap to record when headache ended.");
        //$.mobile.changePage($("#infoDialog"), { role : "dialog" }).positionTo(window);

            $("#popupDialog").popup("open");


    }
    else
    {
        var newHeadacheObj = {
            "lastSaved" : headacheObject.lastSavedPage,
            "confirmed" : headacheObject.confirmedData
        }

        //var items = getAllFromLocalStorage(inType);
        //var items = JSON.parse(localStorage.getItem());
        //updateID = items._id;
        //alert(updateID);
        var httpMethod = "put";
        var uid = "";
        uid = "/" + updateID;


        var newHeadacheObject = JSON.stringify(newHeadacheObj);
        //alert(newHeadacheObject);

        updateID = null;

        // send to server
        $.ajax({
            url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
            contentType: "application/json", data : newHeadacheObject
        })

            .done(function(inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newHeadacheObject = newHeadacheObject.slice(0, newHeadacheObject.length - 1);
                newHeadacheObject = newHeadacheObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newHeadacheObject);
                window.sessionStorage.setItem("currentUser", headacheObject.userID);
                window.sessionStorage.setItem("currentPass", headacheObject.userPass);
                $.mobile.loading("hide");
            })

            .fail(function(inXHR, inStatus) {
                $.mobile.loading("hide");
            })

            .always(function(){
                setTimeout(function(){document.location.href = "index.html";},200);
            });


        var headacheDateTimeString = headacheObject.headacheStartDate + " " + headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM;
        var headacheDateTime = new Date(headacheDateTimeString);
        var timeSegment = "";
        var hours = headacheDateTime.getHours();
        var minutes = headacheDateTime.getMinutes();
        if(hours < 10)
            hours = "0" + hours;

        getWeatherData(headacheDateTime.getMonth()+1, headacheDateTime.getDate(), hours);

        if (headacheDateTime.getHours() >= 4 && headacheDateTime.getHours() <= 11) {
            timeSegment = "Morning";
        }
        else if (headacheDateTime.getHours() >= 12 && headacheDateTime.getHours() <= 17) {
            timeSegment = "Afternoon";

        }
        else if (headacheDateTime.getHours() >= 18 && headacheDateTime.getHours() <= 23) {
            timeSegment = "Evening";
        }
        else {
            timeSegment = "Late Night";
        }

        var month = (new Date(headacheObject.headacheStartDate)).getMonth()+1;

        var newTimeBucket = {
            "userID" : headacheObject.userID,
            "month" : month,
            "date" : headacheObject.headacheStartDate,
            "time" : headacheObject.headacheStartTime + " " + headacheObject.headacheStartTimeAMPM,
            "segment" : timeSegment,
            "item" : "Headache Started",
            "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
        }

        var method = "post";
        var oid = "";


        var newTimeBucketObject = JSON.stringify(newTimeBucket);
        //alert(newHeadacheObject);

        //updateID = null;

        // send to server
        $.ajax({
            url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
            contentType: "application/json", data : newTimeBucketObject
        })

            .done(function(inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
                newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
                $.mobile.loading("hide");
                //alert("Start Time Updated");

            })
            .fail(function(inXHR, inStatus) {
                $.mobile.loading("hide");

            });

    }


}

function showActivitySelection(){
    $("#food-block").on("click", function(){

        $("#food-icon").prop("src", "img/food_alter.png");
        $("#food-text").css("font-weight", "bold");

        $("#drink-icon").prop("src", "img/drink.png");
        $("#drink-text").css("font-weight", "normal");

        $("#exercise-icon").prop("src", "img/exercise.png");
        $("#exercise-text").css("font-weight", "normal");

        $("#sleep-icon").prop("src", "img/sleep.png");
        $("#sleep-text").css("font-weight", "normal");

        $("#stress-icon").prop("src", "img/stress.png");
        $("#stress-text").css("font-weight", "normal");

        $("#period-icon").prop("src", "img/period.png");
        $("#period-text").css("font-weight", "normal");

        activityObject.activeActivityPage = "trackFood.html";

        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");

    });

    $("#drink-block").on("click", function(){
        $("#food-icon").prop("src", "img/food.png");
        $("#food-text").css("font-weight", "normal");

        $("#drink-icon").prop("src", "img/drink_alter.png");
        $("#drink-text").css("font-weight", "bold");

        $("#exercise-icon").prop("src", "img/exercise.png");
        $("#exercise-text").css("font-weight", "normal");

        $("#sleep-icon").prop("src", "img/sleep.png");
        $("#sleep-text").css("font-weight", "normal");

        $("#stress-icon").prop("src", "img/stress.png");
        $("#stress-text").css("font-weight", "normal");

        $("#period-icon").prop("src", "img/period.png");
        $("#period-text").css("font-weight", "normal");

        activityObject.activeActivityPage = "trackDrink.html";
        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");


    });

    $("#exercise-block").on("click", function(){
        $("#food-icon").prop("src", "img/food.png");
        $("#food-text").css("font-weight", "normal");

        $("#drink-icon").prop("src", "img/drink.png");
        $("#drink-text").css("font-weight", "normal");

        $("#exercise-icon").prop("src", "img/exercise_alter.png");
        $("#exercise-text").css("font-weight", "bold");

        $("#sleep-icon").prop("src", "img/sleep.png");
        $("#sleep-text").css("font-weight", "normal");

        $("#stress-icon").prop("src", "img/stress.png");
        $("#stress-text").css("font-weight", "normal");

        $("#period-icon").prop("src", "img/period.png");
        $("#period-text").css("font-weight", "normal");

        activityObject.activeActivityPage = "trackExercise.html";
        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");


    });

    $("#sleep-block").on("click", function(){
        $("#food-icon").prop("src", "img/food.png");
        $("#food-text").css("font-weight", "normal");

        $("#drink-icon").prop("src", "img/drink.png");
        $("#drink-text").css("font-weight", "normal");

        $("#exercise-icon").prop("src", "img/exercise.png");
        $("#exercise-text").css("font-weight", "normal");

        $("#sleep-icon").prop("src", "img/sleep_alter.png");
        $("#sleep-text").css("font-weight", "bold");

        $("#stress-icon").prop("src", "img/stress.png");
        $("#stress-text").css("font-weight", "normal");

        $("#period-icon").prop("src", "img/period.png");
        $("#period-text").css("font-weight", "normal");

        activityObject.activeActivityPage = "trackSleep.html";
        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");


    });

    $("#stress-block").on("click", function(){
        $("#food-icon").prop("src", "img/food.png");
        $("#food-text").css("font-weight", "normal");

        $("#drink-icon").prop("src", "img/drink.png");
        $("#drink-text").css("font-weight", "normal");

        $("#exercise-icon").prop("src", "img/exercise.png");
        $("#exercise-text").css("font-weight", "normal");

        $("#sleep-icon").prop("src", "img/sleep.png");
        $("#sleep-text").css("font-weight", "normal");

        $("#stress-icon").prop("src", "img/stress_alter.png");
        $("#stress-text").css("font-weight", "bold");

        $("#period-icon").prop("src", "img/period.png");
        $("#period-text").css("font-weight", "normal");

        activityObject.activeActivityPage = "trackStress.html";
        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");

    });

    $("#period-block").on("click", function(){
        $("#food-icon").prop("src", "img/food.png");
        $("#food-text").css("font-weight", "normal");

        $("#drink-icon").prop("src", "img/drink.png");
        $("#drink-text").css("font-weight", "normal");

        $("#exercise-icon").prop("src", "img/exercise.png");
        $("#exercise-text").css("font-weight", "normal");

        $("#sleep-icon").prop("src", "img/sleep.png");
        $("#sleep-text").css("font-weight", "normal");

        $("#stress-icon").prop("src", "img/stress.png");
        $("#stress-text").css("font-weight", "normal");

        $("#period-icon").prop("src", "img/period_alter.png");
        $("#period-text").css("font-weight", "bold");

        activityObject.activeActivityPage = "trackPeriod.html";
        $("#activity-skip-btn").prop("href", activityObject.activeActivityPage);
        $("#activity-skip-btn").css("background-color", "cornflowerblue");

    });

}


function resetActivitySelection(){

    $("#food-icon").prop("src", "img/food.png");
    $("#food-text").css("font-weight", "normal");

    $("#drink-icon").prop("src", "img/drink.png");
    $("#drink-text").css("font-weight", "normal");

    $("#exercise-icon").prop("src", "img/exercise.png");
    $("#exercise-text").css("font-weight", "normal");

    $("#sleep-icon").prop("src", "img/sleep.png");
    $("#sleep-text").css("font-weight", "normal");

    $("#stress-icon").prop("src", "img/stress.png");
    $("#stress-text").css("font-weight", "normal");

    $("#period-icon").prop("src", "img/period.png");
    $("#period-text").css("font-weight", "normal");

    activityObject.activeActivityPage = null;
    $("#activity-skip-btn").css("background-color", "black");


}


function showActivityDateTime() {
    var d = processDate();
    var t = processTime();

    $("#food-time").text("Time: " + t);
    $("#food-date").text("Date: " + d);

    $("#drink-time").text("Time: " + t);
    $("#drink-date").text("Date: " + d);

    $("#exercise-time").text("Time: " + t);
    $("#exercise-date").text("Date: " + d);

    $("#sleep-time").text("Time: " + t);
    $("#sleep-date").text("Date: " + d);

    $("#stress-time").text("Time: " + t);
    $("#stress-date").text("Date: " + d);

    $("#period-time").text("Time: " + t);
    $("#period-date").text("Date: " + d);

    $("#med-time").text("Time: " + t);
    $("#med-date").text("Date: " + d);


}

function setActivityDateTime() {

    $("#food-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#food-time").text("Time: " + selectedTime);
            $("#food-date").text("Date: " + selectedDate);
            $("#food-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#food-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#food-time").text("Time: " + selectedTime);
            $("#food-date").text("Date: " + selectedDate);
            $("#food-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#drink-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#drink-time").text("Time: " + selectedTime);
            $("#drink-date").text("Date: " + selectedDate);
            $("#drink-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#drink-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#drink-time").text("Time: " + selectedTime);
            $("#drink-date").text("Date: " + selectedDate);
            $("#drink-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#exercise-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#exercise-time").text("Time: " + selectedTime);
            $("#exercise-date").text("Date: " + selectedDate);
            $("#exercise-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#exercise-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#exercise-time").text("Time: " + selectedTime);
            $("#exercise-date").text("Date: " + selectedDate);
            $("#exercise-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#sleep-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#sleep-time").text("Time: " + selectedTime);
            $("#sleep-date").text("Date: " + selectedDate);
            $("#sleep-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#sleep-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#sleep-time").text("Time: " + selectedTime);
            $("#sleep-date").text("Date: " + selectedDate);
            $("#sleep-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#stress-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#stress-time").text("Time: " + selectedTime);
            $("#stress-date").text("Date: " + selectedDate);
            $("#stress-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#stress-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#stress-time").text("Time: " + selectedTime);
            $("#stress-date").text("Date: " + selectedDate);
            $("#stress-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#period-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#period-time").text("Time: " + selectedTime);
            $("#period-date").text("Date: " + selectedDate);
            $("#period-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#period-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#period-time").text("Time: " + selectedTime);
            $("#period-date").text("Date: " + selectedDate);
            $("#period-time").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#med-date").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#med-time").text("Time: " + selectedTime);
            $("#med-date").text("Date: " + selectedDate);
            $("#med-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#med-time").mobiscroll().datetime({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method

            var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#med-time").text("Time: " + selectedTime);
            $("#med-date").text("Date: " + selectedDate);
            $("#med-time").removeClass($.mobile.activeBtnClass);
        }
    });
}


function saveFood(objectType){


    activityObject.trackDate = $("#food-date").text().substring(6,16);
    activityObject.trackTime = $("#food-time").text().substring(6,15);

    activityObject.foodTracking = $("input[name=food]:checked").val();


    var newFoodObj = {
        "userID" : headacheObject.userID,
        "foodTrackDate" : activityObject.trackDate,
        "foodTrackTime" : activityObject.trackTime,
        "foodName" : activityObject.foodTracking
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";


    var newFoodObject = JSON.stringify(newFoodObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newFoodObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newFoodObject = newFoodObject.slice(0, newFoodObject.length - 1);
            newFoodObject = newFoodObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newFoodObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#aged-cheese").prop('checked', false).checkboxradio("refresh");
            $("#chocolate").prop('checked', false).checkboxradio("refresh");
            $("#citrus-fruit").prop('checked',false).checkboxradio("refresh");
            $("#cured-meat").prop('checked', false).checkboxradio("refresh");
            $("#nuts").prop('checked', false).checkboxradio("refresh");
            $("#onions").prop('checked', false).checkboxradio("refresh");
            $("#salty-food").prop('checked', false).checkboxradio("refresh");
            $("#msg").prop('checked', false).checkboxradio("refresh");
            $("#nutra-sweet").prop('checked', false).checkboxradio("refresh");
        });

    var foodDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var foodDateTime = new Date(foodDateTimeString);
    var timeSegment = "";
    var hours = foodDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    //getWeatherData(foodDateTime.getMonth()+1, foodDateTime.getDate(), hours);

    if (foodDateTime.getHours() >= 4 && foodDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (foodDateTime.getHours() >= 12 && foodDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (foodDateTime.getHours() >= 18 && foodDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : activityObject.foodTracking + " taken",
        //"environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";


    var newTimeBucketObject = JSON.stringify(newTimeBucket);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });


    $("#food-not-btn").attr("href","trackActivity.html");
    $("#food-skip-btn").attr("href", "trackActivity.html");

}

function saveDrink(objectType){


    activityObject.trackDate = $("#drink-date").text().substring(6,16);
    activityObject.trackTime = $("#drink-time").text().substring(6,15);

    activityObject.drinkTracking = $("input[name=drink]:checked").val();

    var newDrinkObj = {
        "userID" : headacheObject.userID,
        "drinkTrackDate" : activityObject.trackDate,
        "drinkTrackTime" : activityObject.trackTime,
        "drinkName" : activityObject.drinkTracking
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";

    var newDrinkObject = JSON.stringify(newDrinkObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newDrinkObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newDrinkObject = newDrinkObject.slice(0, newDrinkObject.length - 1);
            newDrinkObject = newDrinkObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newDrinkObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#coffee").prop('checked', false).checkboxradio("refresh");
            $("#red-wine").prop('checked', false).checkboxradio("refresh");
            $("#beer").prop('checked',false).checkboxradio("refresh");
            $("#water").prop('checked', false).checkboxradio("refresh");
        });


    var drinkDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var drinkDateTime = new Date(drinkDateTimeString);
    var timeSegment = "";
    var hours = drinkDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    //getWeatherData(drinkDateTime.getMonth()+1, drinkDateTime.getDate(), hours);

    if (drinkDateTime.getHours() >= 4 && drinkDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (drinkDateTime.getHours() >= 12 && drinkDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (drinkDateTime.getHours() >= 18 && drinkDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : activityObject.drinkTracking + " taken",
        //"environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";

    var newTimeBucketObject = JSON.stringify(newTimeBucket);

    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });


    //$("#food-not-btn").attr("href","trackActivity.html");
    $("#drink-skip-btn").attr("href", "trackActivity.html");

}

function saveExercise(objectType){


    activityObject.trackDate = $("#exercise-date").text().substring(6,16);
    activityObject.trackTime = $("#exercise-time").text().substring(6,15);

    activityObject.exerciseTracking.exerciseName = $("input[name=exercise-name]:checked").val();
    activityObject.exerciseTracking.exerciseStatus = $("input[name=exercise-status]:checked").val();

    var newExerciseObj = {
        "userID" : headacheObject.userID,
        "exerciseTrackDate" : activityObject.trackDate,
        "exerciseTrackTime" : activityObject.trackTime,
        "exerName" : activityObject.exerciseTracking.exerciseName,
        "exerStatus": activityObject.exerciseTracking.exerciseStatus
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";

    var newExerciseObject = JSON.stringify(newExerciseObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newExerciseObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newExerciseObject = newExerciseObject.slice(0, newExerciseObject.length - 1);
            newExerciseObject = newExerciseObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newExerciseObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#exercise-aerobic").prop('checked', false).checkboxradio("refresh");
            $("#exercise-anaerobic").prop('checked', false).checkboxradio("refresh");
            $("#exercise-flexibility").prop('checked',false).checkboxradio("refresh");
            $("#exercise-started").prop('checked', false).checkboxradio("refresh");
            $("#exercise-ongoing").prop('checked', false).checkboxradio("refresh");
            $("#exercise-finished").prop('checked', false).checkboxradio("refresh");
        });

    var exerciseDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var exerciseDateTime = new Date(exerciseDateTimeString);
    var timeSegment = "";
    var hours = exerciseDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    getWeatherData(exerciseDateTime.getMonth()+1, exerciseDateTime.getDate(), hours);

    if (exerciseDateTime.getHours() >= 4 && exerciseDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (exerciseDateTime.getHours() >= 12 && exerciseDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (exerciseDateTime.getHours() >= 18 && exerciseDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : activityObject.exerciseTracking.exerciseName + " " + activityObject.exerciseTracking.exerciseStatus,
        "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";

    var newTimeBucketObject = JSON.stringify(newTimeBucket);

    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });


    //$("#food-not-btn").attr("href","trackActivity.html");
    $("#exercise-skip-btn").attr("href", "trackActivity.html");

}

function saveSleep(objectType){


    activityObject.trackDate = $("#sleep-date").text().substring(6,16);
    activityObject.trackTime = $("#sleep-time").text().substring(6,15);

    activityObject.sleepTracking = $("input[name=sleep]:checked").val();

    var newSleepObj = {
        "userID" : headacheObject.userID,
        "sleepTrackDate" : activityObject.trackDate,
        "sleepTrackTime" : activityObject.trackTime,
        "sleepStatus" : activityObject.sleepTracking
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";

    var newSleepObject = JSON.stringify(newSleepObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newSleepObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newSleepObject = newSleepObject.slice(0, newSleepObject.length - 1);
            newSleepObject = newSleepObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newSleepObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#sound-sleep").prop('checked', false).checkboxradio("refresh");
            $("#interrupted-sleep").prop('checked', false).checkboxradio("refresh");
            $("#sleep-less").prop('checked',false).checkboxradio("refresh");
        });


    var sleepDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var sleepDateTime = new Date(sleepDateTimeString);
    var timeSegment = "";
    var hours = sleepDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    getWeatherData(sleepDateTime.getMonth()+1, sleepDateTime.getDate(), hours);

    if (sleepDateTime.getHours() >= 4 && sleepDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (sleepDateTime.getHours() >= 12 && sleepDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (sleepDateTime.getHours() >= 18 && sleepDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : activityObject.sleepTracking,
        "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";

    var newTimeBucketObject = JSON.stringify(newTimeBucket);

    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });


    //$("#food-not-btn").attr("href","trackActivity.html");
    $("#sleep-skip-btn").attr("href", "trackActivity.html");

}

function saveStress(objectType){


    activityObject.trackDate = $("#stress-date").text().substring(6,16);
    activityObject.trackTime = $("#stress-time").text().substring(6,15);

    activityObject.stressTracking = $("input[name=stress]:checked").val();

    var newStressObj = {
        "userID" : headacheObject.userID,
        "stressTrackDate" : activityObject.trackDate,
        "stressTrackTime" : activityObject.trackTime,
        "stressLevel" : activityObject.stressTracking
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";

    var newStressObject = JSON.stringify(newStressObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newStressObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newStressObject = newStressObject.slice(0, newStressObject.length - 1);
            newStressObject = newStressObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newStressObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#stress-high").prop('checked', false).checkboxradio("refresh");
            $("#stress-moderate").prop('checked', false).checkboxradio("refresh");
            $("#stress-less").prop('checked',false).checkboxradio("refresh");
        });


    var stressDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var stressDateTime = new Date(stressDateTimeString);
    var timeSegment = "";
    var hours = stressDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    getWeatherData(stressDateTime.getMonth()+1, stressDateTime.getDate(), hours);

    if (stressDateTime.getHours() >= 4 && stressDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (stressDateTime.getHours() >= 12 && stressDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (stressDateTime.getHours() >= 18 && stressDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : activityObject.stressTracking,
        "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";

    var newTimeBucketObject = JSON.stringify(newTimeBucket);

    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });


    //$("#food-not-btn").attr("href","trackActivity.html");
    $("#stress-skip-btn").attr("href", "trackActivity.html");

}

function savePeriod(objectType){


    activityObject.trackDate = $("#period-date").text().substring(6,16);
    activityObject.trackTime = $("#period-time").text().substring(6,15);

    activityObject.periodTracking = $("input[name=mens]:checked").val();

    var newPeriodObj = {
        "userID" : headacheObject.userID,
        "periodTrackDate" : activityObject.trackDate,
        "periodTrackTime" : activityObject.trackTime,
        "periodStatus" : activityObject.periodTracking
    }

    //var items = getAllFromLocalStorage(inType);
    //var items = JSON.parse(localStorage.getItem());
    //updateID = items._id;
    //alert(updateID);
    var httpMethod = "post";
    var uid = "";

    var newPeriodObject = JSON.stringify(newPeriodObj);
    //alert(newHeadacheObject);

    //updateID = null;

    // send to server
    $.ajax({
        url : ajaxURLPrefix + "/" + objectType + uid, type : httpMethod,
        contentType: "application/json", data : newPeriodObject
    })
        //alert(json.stringify(newHeadacheObject))
        //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newPeriodObject = newPeriodObject.slice(0, newPeriodObject.length - 1);
            newPeriodObject = newPeriodObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newPeriodObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        })

        .always(function(){
            $("#mens-start").prop('checked', false).checkboxradio("refresh");
            $("#mens-ongoing").prop('checked', false).checkboxradio("refresh");
            $("#mens-ended").prop('checked',false).checkboxradio("refresh");
        });


    var mensDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
    var mensDateTime = new Date(mensDateTimeString);
    var timeSegment = "";
    var hours = mensDateTime.getHours();
    if(hours < 10)
        hours = "0" + hours;

    getWeatherData(mensDateTime.getMonth()+1, mensDateTime.getDate(), hours);

    if (mensDateTime.getHours() >= 4 && mensDateTime.getHours() <= 11) {
        timeSegment = "Morning";
    }
    else if (mensDateTime.getHours() >= 12 && mensDateTime.getHours() <= 17) {
        timeSegment = "Afternoon";

    }
    else if (mensDateTime.getHours() >= 18 && mensDateTime.getHours() <= 23) {
        timeSegment = "Evening";
    }
    else {
        timeSegment = "Late Night";
    }

    var month = (new Date(activityObject.trackDate)).getMonth()+1;

    var newTimeBucket = {
        "userID" : headacheObject.userID,
        "month" : month,
        "date" : activityObject.trackDate,
        "time" : activityObject.trackTime,
        "segment" : timeSegment,
        "item" : "Menstruation " + activityObject.periodTracking,
        "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
    }

    var method = "post";
    var oid = "";

    var newTimeBucketObject = JSON.stringify(newTimeBucket);

    $.ajax({
        url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
        contentType: "application/json", data : newTimeBucketObject
    })

        .done(function(inResponse) {
            // Add the item to localStorage.  Since we have the data in the form of a
            // string we just need to slice off the closing brace, then add the
            // two fields that MongoDB would add.
            newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
            newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
            window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
            $.mobile.loading("hide");
            //alert("Start Time Updated");

        })
        .fail(function(inXHR, inStatus) {
            $.mobile.loading("hide");

        });

    //$("#food-not-btn").attr("href","trackActivity.html");
    $("#period-skip-btn").attr("href", "trackActivity.html");

}

function popupMedQuantity()
{

    $("input[name=medication-symp]").on("change", function () {
        activityObject.medicineTracking.medName = $("input[name=medication-symp]:checked").val();
        activityObject.medicineTracking.medType = this.form.name;
        $("#med-quantity").val(0).slider("refresh");
        $("#medQuantityPop").popup("open");
        $("#med-ok").on("click", function () {
            $("#medQuantityPop").popup("close");
        });
    });

    $("input[name=medication-prev]").on("change", function () {
        activityObject.medicineTracking.medName = $("input[name=medication-prev]:checked").val();
        activityObject.medicineTracking.medType = this.form.name;
        $("#med-quantity").val(0).slider("refresh");
        $("#medQuantityPop").popup("open");
        $("#med-ok").on("click", function () {
            $("#medQuantityPop").popup("close");
        });
    });

    $("#med-quantity").on("change", function(){
        activityObject.medicineTracking.medQuantity = $("#med-quantity").val();
    });
}

function saveMedication(objectType){


    activityObject.trackDate = $("#med-date").text().substring(6,16);
    activityObject.trackTime = $("#med-time").text().substring(6,15);

    if($("#med-quantity").val() > 0) {
        var newMedObj = {
            "userID": headacheObject.userID,
            "medicationTrackDate": activityObject.trackDate,
            "medicationTrackTime": activityObject.trackTime,
            "medicationType": activityObject.medicineTracking.medType,
            "medicationName": activityObject.medicineTracking.medName,
            "medicationQuantity": activityObject.medicineTracking.medQuantity
        }

        //var items = getAllFromLocalStorage(inType);
        //var items = JSON.parse(localStorage.getItem());
        //updateID = items._id;
        //alert(updateID);
        var httpMethod = "post";
        var uid = "";

        var newMedObject = JSON.stringify(newMedObj);
        //alert(newHeadacheObject);

        //updateID = null;

        // send to server
        $.ajax({
            url: ajaxURLPrefix + "/" + objectType + uid, type: httpMethod,
            contentType: "application/json", data: newMedObject
        })
            //alert(json.stringify(newHeadacheObject))
            //alert(ajaxURLPrefix + "/" + inType + uid + " " + httpMethod + " " + "application/json" + " " + newHeadacheObject)

            .done(function (inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newMedObject = newMedObject.slice(0, newMedObject.length - 1);
                newMedObject = newMedObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newMedObject);
                $.mobile.loading("hide");
                //alert("Start Time Updated");

            })
            .fail(function (inXHR, inStatus) {
                $.mobile.loading("hide");

            })

            .always(function () {
                $("input[name=medication]:checked").prop("checked", false).checkboxradio("refresh");
            });

        var medDateTimeString = activityObject.trackDate + " " + activityObject.trackTime;
        var medDateTime = new Date(medDateTimeString);
        var timeSegment = "";
        var hours = medDateTime.getHours();
        if(hours < 10)
            hours = "0" + hours;

        getWeatherData(medDateTime.getMonth()+1, medDateTime.getDate(), hours);

        if (medDateTime.getHours() >= 4 && medDateTime.getHours() <= 11) {
            timeSegment = "Morning";
        }
        else if (medDateTime.getHours() >= 12 && medDateTime.getHours() <= 17) {
            timeSegment = "Afternoon";

        }
        else if (medDateTime.getHours() >= 18 && medDateTime.getHours() <= 23) {
            timeSegment = "Evening";
        }
        else {
            timeSegment = "Late Night";
        }

        var month = (new Date(activityObject.trackDate)).getMonth()+1;

        var newTimeBucket = {
            "userID" : headacheObject.userID,
            "month" : month,
            "date" : activityObject.trackDate,
            "time" : activityObject.trackTime,
            "segment" : timeSegment,
            "item" : activityObject.medicineTracking.medName + " (" + activityObject.medicineTracking.medQuantity + ") taken",
            "environment" : {"temp": weatherObject.temperature, "hum" : weatherObject.humidity, "wind" : weatherObject.wind, "press": weatherObject.pressure}
        }

        var method = "post";
        var oid = "";

        var newTimeBucketObject = JSON.stringify(newTimeBucket);

        $.ajax({
            url : ajaxURLPrefix + "/" + "timebucket" + oid, type : method,
            contentType: "application/json", data : newTimeBucketObject
        })

            .done(function(inResponse) {
                // Add the item to localStorage.  Since we have the data in the form of a
                // string we just need to slice off the closing brace, then add the
                // two fields that MongoDB would add.
                newTimeBucketObject = newTimeBucketObject.slice(0, newTimeBucketObject.length - 1);
                newTimeBucketObject = newTimeBucketObject + ",\"__v\":\"0\",\"_id\":\"" + inResponse + "\"}";
                window.localStorage.setItem(objectType + "_" + inResponse, newTimeBucketObject);
                $.mobile.loading("hide");
                //alert("Start Time Updated");

            })
            .fail(function(inXHR, inStatus) {
                $.mobile.loading("hide");

            });



        //$("#food-not-btn").attr("href","trackActivity.html");
        $("#med-skip-btn").attr("href", "index.html");
    }
    else
    {
        $("#quantityError").popup("open");
    }

}

function getAllFromLocalStorage(inType) {

    var items = [ ];

    // First, get the data of the appropriate type from localStorage.
    var lst = window.localStorage;
    for (var itemKey in lst) {
        if (itemKey.indexOf(inType) == 0) {
            var sObj = lst.getItem(itemKey);
            items.push(JSON.parse(sObj));
        }
    }
    return items;

} // End getAllFromLocalStorage().


function showDataSummary(){
    $("#explore-text-above, #explore-swipe-viz, #explore-text-down").hide();
    var headaches = getAllFromLocalStorage('headache');
    var numberOfHeadaches = headaches.length;
    /*var foods = getAllFromLocalStorage('food');
    var drinks = getAllFromLocalStorage('drink');
    var exercises = getAllFromLocalStorage('exercise');
    var sleeps = getAllFromLocalStorage('sleep');
    var stresses = getAllFromLocalStorage('stress');
    var mens = getAllFromLocalStorage('period');
    var medications = getAllFromLocalStorage('medication');

    $("#number-of-headaches").text(headaches.length + "  entries").show();
    $("#number-of-headaches").css({"text-align": "center", "font-weight": "bold"});
    $("#headache-label").css("text-align", "right");

    $("#number-of-foods").text(foods.length + "  entries").show();
    $("#number-of-foods").css({"text-align": "center", "font-weight": "bold"});
    $("#food-label").css("text-align", "right");

    $("#number-of-drinks").text(drinks.length + "  entries").show();
    $("#number-of-drinks").css({"text-align": "center", "font-weight": "bold"});
    $("#drink-label").css("text-align", "right");

    $("#number-of-exercises").text(exercises.length + "  entries").show();
    $("#number-of-exercises").css({"text-align": "center", "font-weight": "bold"});
    $("#exercise-label").css("text-align", "right");

    $("#number-of-sleeps").text(sleeps.length + "  entries").show();
    $("#number-of-sleeps").css({"text-align": "center", "font-weight": "bold"});
    $("#sleep-label").css("text-align", "right");

    $("#number-of-stresses").text(stresses.length + "  entries").show();
    $("#number-of-stresses").css({"text-align": "center", "font-weight": "bold"});
    $("#stress-label").css("text-align", "right");

    $("#number-of-mens").text(mens.length + "  entries").show();
    $("#number-of-mens").css({"text-align": "center", "font-weight": "bold"});
    $("#mens-label").css("text-align", "right");

    $("#number-of-medications").text(medications.length + "  entries").show();
    $("#number-of-medications").css({"text-align": "center", "font-weight": "bold"});
    $("#medication-label").css("text-align", "right");*/


    var startTimeString = [];
    var startTimes = [];
    var endTimeString = [];
    var endTimes = [];
    var morningHeadaches = 0;
    var afternoonHeadaches = 0;
    var eveningHeadaches = 0;
    var lateNightHeadaches = 0;

    for (var j = 0; j < numberOfHeadaches; j++) {
        startTimeString[j] = headaches[j].startDate + " " + headaches[j].startTime + " " + headaches[j].startTimeAMPM;
        startTimes[j] = new Date(startTimeString[j]);
        endTimeString[j] = headaches[j].endDate + " " + headaches[j].endTime + " " + headaches[j].endTimeAMPM;
        endTimes[j] = new Date(endTimeString[j]);


        if (startTimes[j].getHours() >= 4 && startTimes[j].getHours() <= 11) {
            morningHeadaches++;
        }
        else if (startTimes[j].getHours() >= 12 && startTimes[j].getHours() <= 17) {
            afternoonHeadaches++;

        }
        else if (startTimes[j].getHours() >= 18 && startTimes[j].getHours() <= 23) {
            eveningHeadaches++;
        }
        else {
            lateNightHeadaches++;
        }
    }

    var startTimeData = [
        ['Morning', morningHeadaches], ['Afternoon', afternoonHeadaches], ['Evening', eveningHeadaches],
        ['Night', lateNightHeadaches]];

    showStartTimePieForSwipe(startTimeData);



}

function showReviewCharts() {

    $.mobile.loading("show");
    var items = getAllFromLocalStorage('headache');
    numberOfHeadaches = items.length;
    var i = numberOfHeadaches;

    var morningHeadaches = 0;
    var afternoonHeadaches = 0;
    var eveningHeadaches = 0;
    var lateNightHeadaches = 0;

    var startTimeString = [];
    var startTimes = [];
    var endTimeString = [];
    var endTimes = [];
    var duration = [];
    var sumOfDurations = 0.00;
    var sumOfSeverities = 0;
    var severityCounter = 0;
    var severities = [];
    var sumOfDisabilities = 0;
    var disabilityCounter = 0;
    var disabilities = [];

    var tmj = 0;
    var sinus = 0;
    var cluster = 0;
    var tension = 0;
    var migraine = 0;
    var neck = 0;

    var throbbing = 0;
    var dull = 0;
    var sharp = 0;

    var lightSens = 0;
    var soundSens = 0;
    var nasalConges = 0;
    var nauseaCon = 0;
    var depress = 0;
    var smell = 0;
    var anxious = 0;
    var other = 0;

    var home = 0;
    var work = 0;
    var school = 0;
    var park = 0;
    var transit = 0;
    var party = 0;
    var playground = 0;
    var shopping = 0;

    for (var j = 0; j < numberOfHeadaches; j++) {
        startTimeString[j] = items[j].startDate + " " + items[j].startTime + " " + items[j].startTimeAMPM;
        startTimes[j] = new Date(startTimeString[j]);
        endTimeString[j] = items[j].endDate + " " + items[j].endTime + " " + items[j].endTimeAMPM;
        endTimes[j] = new Date(endTimeString[j]);


        if (startTimes[j].getHours() >= 4 && startTimes[j].getHours() <= 11) {
            morningHeadaches++;
        }
        else if (startTimes[j].getHours() >= 12 && startTimes[j].getHours() <= 17) {
            afternoonHeadaches++;

        }
        else if (startTimes[j].getHours() >= 18 && startTimes[j].getHours() <= 23) {
            eveningHeadaches++;
        }
        else {
            lateNightHeadaches++;
        }

        duration[j] = calculateHeadacheDuration(startTimes[j], endTimes[j]);
        if (duration[j] == "NaN")
            i = numberOfHeadaches - 1;
        else
            sumOfDurations = sumOfDurations + parseFloat(duration[j]);

        for (var k = 0; k < 3; k++) {
            if (parseInt(items[j].severity[k].severityLevel) != 0) {
                //alert(parseInt(items[j].severity[k].severityLevel));
                sumOfSeverities = sumOfSeverities + parseInt(items[j].severity[k].severityLevel);
                severities[severityCounter] = parseInt(items[j].severity[k].severityLevel);
                severityCounter++;
            }
        }

        // debug comment: disability should not be an array of objects in DAO, its corrected but database has previous values
        sumOfDisabilities = sumOfDisabilities + parseInt(items[j].disability.disabilityLevel);
        disabilities[disabilityCounter] = parseInt(items[j].disability.disabilityLevel);
        disabilityCounter++;

        if(items[j].painArea.tmj)
            tmj++;
        if(items[j].painArea.sinus)
            sinus++;
        if(items[j].painArea.cluster)
            cluster++;
        if(items[j].painArea.tension)
            tension++;
        if(items[j].painArea.migraine)
            migraine++;
        if(items[j].painArea.neck)
            neck++;

        if(items[j].painNature == "Throbbing, Pounding or Pulsating")
            throbbing++;
        if(items[j].painNature == "Pressing Pain or Dull Steady Ache")
            dull++;
        if(items[j].painNature == "Steady Sharp or Burning Ache")
            sharp++;


        if(items[j].painSymptom.lightSensitivity)
            lightSens++;
        if(items[j].painSymptom.soundSensitivity)
            soundSens++;
        if(items[j].painSymptom.depressedMood)
            depress++;
        if(items[j].painSymptom.feelAnxious)
            anxious++;
        if(items[j].painSymptom.nasalCongestion)
            nasalConges++;
        if(items[j].painSymptom.nauseaCondition)
            nauseaCon++;
        if(items[j].painSymptom.smellSensitivity)
            smell++;
        if(items[j].painSymptom.otherSymptom)
            other++;

        if(items[j].userLocation == "Home")
            home++;
        if(items[j].userLocation == "Work")
            work++;
        if(items[j].userLocation == "School")
            school++;
        if(items[j].userLocation == "Park")
            park++;
        if(items[j].userLocation == "In-Transit")
            transit++;
        if(items[j].userLocation == "Party")
            party++;
        if(items[j].userLocation == "playground")
            playground++;
        if(items[j].userLocation == "Shopping Center")
            shopping++;

    }

    $.mobile.loading("hide");
    var startTimeData = [
        ['Morning', morningHeadaches], ['Afternoon', afternoonHeadaches], ['Evening', eveningHeadaches],
        ['Night', lateNightHeadaches]];

    showStartTimePie(startTimeData);

    var sortedDuration = duration.sort();

    var avgDuration = sumOfDurations / i;
    var durationData = [parseFloat(sortedDuration[0]), avgDuration, parseFloat(sortedDuration[duration.length - 1])];

    if (i < numberOfHeadaches)
        durationData = [parseFloat(sortedDuration[0]), avgDuration, parseFloat(sortedDuration[duration.length - 2])];


    var ticks = ['Shortest', 'Average', 'Longest'];
    showDurationBar(durationData, ticks);

    var ticksSeverity = ['Lowest', 'Average', 'Highest'];
    var sortedSeverities = severities.sort();
    var avgSeverity = sumOfSeverities / severityCounter;
    var severityData = [sortedSeverities[0], avgSeverity, sortedSeverities[severities.length - 1]];
    //alert(severityData);
    showSeverityBar(severityData, ticksSeverity);

    var ticksDisability = ['Lowest', 'Average', 'Highest'];
    var sortedDisabilities = disabilities.sort();
    var avgDisability = sumOfDisabilities / disabilityCounter;
    var disabilityData = [sortedDisabilities[0], avgDisability, sortedDisabilities[disabilities.length - 1]];
    showDisabilityBar(disabilityData, ticksDisability);

    var painLocationData = [
        ['Temple Area', tmj], ['Sinus Area', sinus], ['Behind Eye', cluster], ['Squeezing Band', tension], ['One Sided', migraine], ['Top/Back Head', neck]
    ];

    showPainLocationPie(painLocationData);

    var painNatureData = [
        ['Throbbing', throbbing], ['Pressing/Dull', dull], ['Sharp', sharp]
    ];

    showPainNaturePie(painNatureData);

    var painSymptomData = [
        ['Light Sensitivity', lightSens], ['Sound Sensitivity', soundSens], ['Smell Sensitivity', smell], ['Nasal Congestion', nasalConges], ['Nausea', nauseaCon], ['Feel Anxious', anxious], ['Depressed Mood', depress], ['Others', other]
    ];

    showPainSymptomPie(painSymptomData);

    var userLocationData = [
        ['Home', home], ['Work', work], ['School', school], ['Park', park], ['In-Transit', transit], ['Party', party], ['Playground', playground], ['Shopping Center', shopping]
    ];

    showUserLocationPie(userLocationData);
}

function showStartTimePie(startTimeData){
    jQuery.jqplot ('start-time-pie', [startTimeData],
        {
            //animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 's', rendererOptions: { numberRows: 1}}
        });

}

function showStartTimePieForSwipe(startTimeData){

    if(startTimeData.length > 0) {
        jQuery.jqplot('review-swipe-viz', [startTimeData],
            {
                //animate: !$.jqplot.use_excanvas,
                seriesDefaults: {
                    // Make this a pie chart.
                    renderer: jQuery.jqplot.PieRenderer,
                    rendererOptions: {
                        // Put data labels on the pie slices.
                        // By default, labels show the percentage of the slice.
                        showDataLabels: true
                    }
                },
                legend: {
                    renderer: $.jqplot.EnhancedLegendRenderer,
                    show: true,
                    location: 'e'
                    //rendererOptions: {numberRows: 1}
                }
            });
    }


}

function swipeAction(){
    $("#review-text-above, #review-swipe-viz, #review-text-down").on("swipeleft",function(){
        $("#review-text-above, #review-swipe-viz, #review-text-down").hide();
        $("#explore-text-above, #explore-swipe-viz, #explore-text-down").show();
    });

    $("#explore-text-above, #explore-swipe-viz, #explore-text-down").on("swipeleft",function(){
        $("#review-text-above, #review-swipe-viz, #review-text-down").show();
        $("#explore-text-above, #explore-swipe-viz, #explore-text-down").hide();
    });

    $("#review-text-above, #review-swipe-viz, #review-text-down").on("swiperight",function(){
        $("#review-text-above, #review-swipe-viz, #review-text-down").hide();
        $("#explore-text-above, #explore-swipe-viz, #explore-text-down").show();
    });

    $("#explore-text-above, #explore-swipe-viz, #explore-text-down").on("swiperight",function(){
        $("#review-text-above, #review-swipe-viz, #review-text-down").show();
        $("#explore-text-above, #explore-swipe-viz, #explore-text-down").hide();
    });
}

function showDurationBar(durationData, ticks){
    //$.jqplot.config.enablePlugins = true;
    //var durationData = [2, 6, 7, 10];
    //var ticks = ['a', 'b', 'c', 'd'];
    plot1 = $.jqplot('duration-bar', [durationData], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks,
                label: 'Headaches',
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%.2f'
                },
                label: 'Hours'

            }
        },
        highlighter: { show: false }
    });
}

function showSeverityBar(severityData, ticksSeverity){

    plot1 = $.jqplot('severity-bar', [severityData], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksSeverity,
                label: 'Severities',
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%.2f'
                },
                label: 'Severity Level'

            }
        },
        highlighter: { show: false }
    });
}


function showDisabilityBar(disabilityData, ticksDisability)
{
    plot1 = $.jqplot('disability-bar', [disabilityData], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksDisability,
                label: 'Disabilities',
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%.2f'
                },
                label: 'Disability Level'

            }
        },
        highlighter: { show: false }
    });
}

function showPainLocationPie(painLocationData){
    jQuery.jqplot ('pain-location-pie', [painLocationData],
        {
            //animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 's', rendererOptions: { numberRows: 2}}
        });
}

function showPainNaturePie(painNatureData){
    jQuery.jqplot ('pain-nature-pie', [painNatureData],
        {
            //animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 's', rendererOptions: { numberRows: 1}}
        });
}

function showPainSymptomPie(painSymptomData){
    jQuery.jqplot ('pain-symptom-pie', [painSymptomData],
        {
            //animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e'}
        });
}

function showUserLocationPie(userLocationData){
    jQuery.jqplot ('user-location-pie', [userLocationData],
        {
            //animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e'}
        });
}

function hideAllComparisons(){
    $("#cheese-compare").hide();
    $("#meat-compare").hide();
    $("#chocolate-compare").hide();
    $("#fruit-compare").hide();
    $("#ns-compare").hide();
    $("#nut-compare").hide();
    $("#onion-compare").hide();
    $("#salty-compare").hide();
    $("#msg-compare").hide();
    $("#coffee-compare").hide();
    $("#wine-compare").hide();
}

function showCompareDate(){
    $("#compare-from-date").text("Set From Date");
    $("#compare-to-date").text("Set To Date");
    //$("#food-compare").hide();
}

function setCompareDate(){

    $("#compare-from-date").mobiscroll().date({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method
            var selectedDate = valueText;
            //var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            //var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#compare-from-date").text("From: " + selectedDate);
            $("#compare-from-date").removeClass($.mobile.activeBtnClass);
        }
    });

    $("#compare-to-date").mobiscroll().date({
        theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default
        mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default
        display: 'modal', // Specify display mode like: display: 'bottom' or omit setting to use default
        lang: 'en',       // Specify language like: lang: 'pl' or omit setting to use default
        minDate: new Date(2014,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-minDate
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   // More info about maxDate: http://docs.mobiscroll.com/2-15-0/datetime#!opt-maxDate
        stepMinute: 1,  // More info about stepMinute: http://docs.mobiscroll.com/2-15-0/datetime#!opt-stepMinute
        onSelect: function (valueText, inst) {
            //var selectedDateTime = inst.getVal(); // Call the getVal method
            var selectedDate = valueText;
            //var selectedDate = valueText.substr(0, valueText.indexOf(' '));
            //var selectedTime = valueText.substr(valueText.indexOf(' ')+1);
            $("#compare-to-date").text("To: " + selectedDate);
            $("#compare-to-date").removeClass($.mobile.activeBtnClass);



            //var userSelection = $("input[name=radio-activities]:checked").val();

            if($("#compare-from-date").text().length === 16)
                showTriggerBarChart();



            /*if($("#compare-from-date").text().length === 16 && userSelection === "food")
            {
                $.mobile.loading("show");
                showFoodCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else if($("#compare-from-date").text().length === 16 && userSelection === "drink")
            {
                $.mobile.loading("show");
                showDrinkCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else if($("#compare-from-date").text().length === 16 && userSelection === "exercise")
            {
                //$.mobile.loading("show");
                //showExerciseCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else if($("#compare-from-date").text().length === 16 && userSelection === "sleep")
            {
                //$.mobile.loading("show");
               // showSleepCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else if($("#compare-from-date").text().length === 16 && userSelection === "stress")
            {
                //$.mobile.loading("show");
                //showStressCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else if($("#compare-from-date").text().length === 16 && userSelection === "mens")
            {
                //$.mobile.loading("show");
                //showMensCompareCharts(new Date($("#compare-from-date").text()), new Date($("#compare-to-date").text()));
            }
            else
            {
                $("#popupDate").popup("open");
            }*/
        }
    });

}

function getUserSelectionToCompare(){



    $("input[name=radio-compare]").on("change", function () {

        var userSelection = $("input[name=radio-compare]:checked").val();

        if(userSelection == "two month")
        {
            var rangeStartDate = new Date(2015, 3, 1);
            var rangeEndDate = new Date(2015, 3, 30);
            plotTriggers.destroy();
            $('#trigger-text p').text("Tap a Trigger Bar to See Details.");
            $("#combine-text").hide();
            showTriggerBarChart(rangeStartDate, rangeEndDate);
        }
        else if(userSelection == "one month")
        {
            var rangeStartDate = new Date(2015, 3, 1);
            var rangeEndDate = new Date(2015, 3, 30);
            plotTriggers.destroy();
            $('#trigger-text p').text("Tap a Trigger Bar to See Details.");
            $("#combine-text").hide();
            showTriggerBarChart(rangeStartDate, rangeEndDate);
        }
        else if(userSelection == "two week")
        {
            var rangeStartDate = new Date(2015, 3, 17);
            var rangeEndDate = new Date(2015, 3, 30);
            plotTriggers.destroy();
            $('#trigger-text p').text("Tap a Trigger Bar to See Details.");
            $("#combine-text").hide();
            showTriggerBarChart(rangeStartDate, rangeEndDate);
        }
        else if(userSelection == "one week")
        {
            var rangeStartDate = new Date(2015, 3, 24);
            var rangeEndDate = new Date(2015, 3, 30);
            plotTriggers.destroy();
            $('#trigger-text p').text("Tap a Trigger Bar to See Details.");
            $("#combine-text").hide();
            showTriggerBarChart(rangeStartDate, rangeEndDate);
        }
    });


}

function showInitialTriggerComparison()
{
    $("#combine-text").hide();
    var rangeStartDate = new Date(2015, 3, 1);
    var rangeEndDate = new Date(2015, 3, 30);
    showTriggerBarChart(rangeStartDate, rangeEndDate);
}

function showTriggerBarChart(rangeStartDate, rangeEndDate){
    //var headaches = getAllFromLocalStorage('headache');

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var totalDaysWithinDateRange = Math.round(Math.abs((rangeStartDate.getTime() - rangeEndDate.getTime())/(oneDay))) + 1;
    var trackedTriggers = getTrackedTriggers();


    //var totalDaysWithinDateRange = rangeEndDate.getDate() - rangeStartDate.getDate() + 1;
    var timeSegments = getAllFromLocalStorage('timebucket');
    var timeSegmentDate;
    var distinctDates = [];
    var distinctHeadacheDates = [];
    var distinctHeadacheDateTimes = [];

    // declare all variables needed for processing of timeline data of different events
    var distinctCoffeeDates = [];
    var distinctCoffeeDateTimes = [];
    var totalCoffeeDays = 0;
        var totalCoffeeDaysStartHeadache = 0;
        var distinctHeadacheDateTimesAfterCoffee = [];
        var totalCoffeeDaysStartNoHeadache = 0;
    var distinctNoCoffeeDates = [];
    var totalNoCoffeeDays = 0;
        var totalNoCoffeeDaysButHeadache = 0;
        var distinctHeadacheDatesNoCoffee = [];
        var totalNoCoffeeDaysNoHeadache = 0;

    var distinctCheeseDates = [];
    var distinctCheeseDateTimes = [];
    var totalCheeseDays = 0;
    var totalCheeseDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterCheese = [];
    var totalCheeseDaysStartNoHeadache = 0;
    var distinctNoCheeseDates = [];
    var totalNoCheeseDays = 0;
    var totalNoCheeseDaysButHeadache = 0;
    var distinctHeadacheDatesNoCheese = [];
    var totalNoCheeseDaysNoHeadache = 0;

    var distinctChocolateDates = [];
    var distinctChocolateDateTimes = [];
    var totalChocolateDays = 0;
    var totalChocolateDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterChocolate = [];
    var totalChocolateDaysStartNoHeadache = 0;
    var distinctNoChocolateDates = [];
    var totalNoChocolateDays = 0;
    var totalNoChocolateDaysButHeadache = 0;
    var distinctHeadacheDatesNoChocolate = [];
    var totalNoChocolateDaysNoHeadache = 0;

    var distinctCitrusDates = [];
    var distinctCitrusDateTimes = [];
    var totalCitrusDays = 0;
    var totalCitrusDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterCitrus = [];
    var totalCitrusDaysStartNoHeadache = 0;
    var distinctNoCitrusDates = [];
    var totalNoCitrusDays = 0;
    var totalNoCitrusDaysButHeadache = 0;
    var distinctHeadacheDatesNoCitrus = [];
    var totalNoCitrusDaysNoHeadache = 0;

    var distinctMeatDates = [];
    var distinctMeatDateTimes = [];
    var totalMeatDays = 0;
    var totalMeatDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterMeat = [];
    var totalMeatDaysStartNoHeadache = 0;
    var distinctNoMeatDates = [];
    var totalNoMeatDays = 0;
    var totalNoMeatDaysButHeadache = 0;
    var distinctHeadacheDatesNoMeat = [];
    var totalNoMeatDaysNoHeadache = 0;

    var distinctNutDates = [];
    var distinctNutDateTimes = [];
    var totalNutDays = 0;
    var totalNutDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterNut = [];
    var totalNutDaysStartNoHeadache = 0;
    var distinctNoNutDates = [];
    var totalNoNutDays = 0;
    var totalNoNutDaysButHeadache = 0;
    var distinctHeadacheDatesNoNut = [];
    var totalNoNutDaysNoHeadache = 0;

    var distinctOnionDates = [];
    var distinctOnionDateTimes = [];
    var totalOnionDays = 0;
    var totalOnionDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterOnion = [];
    var totalOnionDaysStartNoHeadache = 0;
    var distinctNoOnionDates = [];
    var totalNoOnionDays = 0;
    var totalNoOnionDaysButHeadache = 0;
    var distinctHeadacheDatesNoOnion = [];
    var totalNoOnionDaysNoHeadache = 0;

    var distinctSaltyDates = [];
    var distinctSaltyDateTimes = [];
    var totalSaltyDays = 0;
    var totalSaltyDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterSalty = [];
    var totalSaltyDaysStartNoHeadache = 0;
    var distinctNoSaltyDates = [];
    var totalNoSaltyDays = 0;
    var totalNoSaltyDaysButHeadache = 0;
    var distinctHeadacheDatesNoSalty = [];
    var totalNoSaltyDaysNoHeadache = 0;

    var distinctMsgDates = [];
    var distinctMsgDateTimes = [];
    var totalMsgDays = 0;
    var totalMsgDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterMsg = [];
    var totalMsgDaysStartNoHeadache = 0;
    var distinctNoMsgDates = [];
    var totalNoMsgDays = 0;
    var totalNoMsgDaysButHeadache = 0;
    var distinctHeadacheDatesNoMsg = [];
    var totalNoMsgDaysNoHeadache = 0;

    var distinctNutraDates = [];
    var distinctNutraDateTimes = [];
    var totalNutraDays = 0;
    var totalNutraDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterNutra = [];
    var totalNutraDaysStartNoHeadache = 0;
    var distinctNoNutraDates = [];
    var totalNoNutraDays = 0;
    var totalNoNutraDaysButHeadache = 0;
    var distinctHeadacheDatesNoNutra = [];
    var totalNoNutraDaysNoHeadache = 0;

    var distinctWineDates = [];
    var distinctWineDateTimes = [];
    var totalWineDays = 0;
    var totalWineDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterWine = [];
    var totalWineDaysStartNoHeadache = 0;
    var distinctNoWineDates = [];
    var totalNoWineDays = 0;
    var totalNoWineDaysButHeadache = 0;
    var distinctHeadacheDatesNoWine = [];
    var totalNoWineDaysNoHeadache = 0;

    var distinctBeerDates = [];
    var distinctBeerDateTimes = [];
    var totalBeerDays = 0;
    var totalBeerDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterBeer = [];
    var totalBeerDaysStartNoHeadache = 0;
    var distinctNoBeerDates = [];
    var totalNoBeerDays = 0;
    var totalNoBeerDaysButHeadache = 0;
    var distinctHeadacheDatesNoBeer = [];
    var totalNoBeerDaysNoHeadache = 0;

    var distinctWaterDates = [];
    var distinctWaterDateTimes = [];
    var totalWaterDays = 0;
    var totalWaterDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterWater = [];
    var totalWaterDaysStartNoHeadache = 0;
    var distinctNoWaterDates = [];
    var totalNoWaterDays = 0;
    var totalNoWaterDaysButHeadache = 0;
    var distinctHeadacheDatesNoWater = [];
    var totalNoWaterDaysNoHeadache = 0;

    var distinctAerobicDates = [];
    var distinctAerobicDateTimes = [];
    var totalAerobicDays = 0;
    var totalAerobicDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterAerobic = [];
    var totalAerobicDaysStartNoHeadache = 0;
    var distinctNoAerobicDates = [];
    var totalNoAerobicDays = 0;
    var totalNoAerobicDaysButHeadache = 0;
    var distinctHeadacheDatesNoAerobic = [];
    var totalNoAerobicDaysNoHeadache = 0;

    var distinctAnaerobicDates = [];
    var distinctAnaerobicDateTimes = [];
    var totalAnaerobicDays = 0;
    var totalAnaerobicDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterAnaerobic = [];
    var totalAnaerobicDaysStartNoHeadache = 0;
    var distinctNoAnaerobicDates = [];
    var totalNoAnaerobicDays = 0;
    var totalNoAnaerobicDaysButHeadache = 0;
    var distinctHeadacheDatesNoAnaerobic = [];
    var totalNoAnaerobicDaysNoHeadache = 0;

    var distinctFlexibilityDates = [];
    var distinctFlexibilityDateTimes = [];
    var totalFlexibilityDays = 0;
    var totalFlexibilityDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterFlexibility = [];
    var totalFlexibilityDaysStartNoHeadache = 0;
    var distinctNoFlexibilityDates = [];
    var totalNoFlexibilityDays = 0;
    var totalNoFlexibilityDaysButHeadache = 0;
    var distinctHeadacheDatesNoFlexibility = [];
    var totalNoFlexibilityDaysNoHeadache = 0;

    var distinctInterruptedSleepDates = [];
    var distinctInterruptedSleepDateTimes = [];
    var totalInterruptedSleepDays = 0;
    var totalInterruptedSleepDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterInterruptedSleep = [];
    var totalInterruptedSleepDaysStartNoHeadache = 0;
    var distinctNoInterruptedSleepDates = [];
    var totalNoInterruptedSleepDays = 0;
    var totalNoInterruptedSleepDaysButHeadache = 0;
    var distinctHeadacheDatesNoInterruptedSleep = [];
    var totalNoInterruptedSleepDaysNoHeadache = 0;

    var distinctLackSleepDates = [];
    var distinctLackSleepDateTimes = [];
    var totalLackSleepDays = 0;
    var totalLackSleepDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterLackSleep = [];
    var totalLackSleepDaysStartNoHeadache = 0;
    var distinctNoLackSleepDates = [];
    var totalNoLackSleepDays = 0;
    var totalNoLackSleepDaysButHeadache = 0;
    var distinctHeadacheDatesNoLackSleep = [];
    var totalNoLackSleepDaysNoHeadache = 0;

    var distinctHighStressDates = [];
    var distinctHighStressDateTimes = [];
    var totalHighStressDays = 0;
    var totalHighStressDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterHighStress = [];
    var totalHighStressDaysStartNoHeadache = 0;
    var distinctNoHighStressDates = [];
    var totalNoHighStressDays = 0;
    var totalNoHighStressDaysButHeadache = 0;
    var distinctHeadacheDatesNoHighStress = [];
    var totalNoHighStressDaysNoHeadache = 0;

    var distinctModerateStressDates = [];
    var distinctModerateStressDateTimes = [];
    var totalModerateStressDays = 0;
    var totalModerateStressDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterModerateStress = [];
    var totalModerateStressDaysStartNoHeadache = 0;
    var distinctNoModerateStressDates = [];
    var totalNoModerateStressDays = 0;
    var totalNoModerateStressDaysButHeadache = 0;
    var distinctHeadacheDatesNoModerateStress = [];
    var totalNoModerateStressDaysNoHeadache = 0;

    var distinctMensStartedDates = [];
    var distinctMensStartedDateTimes = [];
    var totalMensStartedDays = 0;
    var totalMensStartedDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterMensStarted = [];
    var totalMensStartedDaysStartNoHeadache = 0;
    var distinctNoMensStartedDates = [];
    var totalNoMensStartedDays = 0;
    var totalNoMensStartedDaysButHeadache = 0;
    var distinctHeadacheDatesNoMensStarted = [];
    var totalNoMensStartedDaysNoHeadache = 0;

    var distinctMensOngoingDates = [];
    var distinctMensOngoingDateTimes = [];
    var totalMensOngoingDays = 0;
    var totalMensOngoingDaysStartHeadache = 0;
    var distinctHeadacheDateTimesAfterMensOngoing = [];
    var totalMensOngoingDaysStartNoHeadache = 0;
    var distinctNoMensOngoingDates = [];
    var totalNoMensOngoingDays = 0;
    var totalNoMensOngoingDaysButHeadache = 0;
    var distinctHeadacheDatesNoMensOngoing = [];
    var totalNoMensOngoingDaysNoHeadache = 0;

    var index = 0;

    // find all distinct dates in the whole timeline data
    for (var i = 0; i < timeSegments.length; i++) {
        timeSegmentDate = new Date(timeSegments[i].date);
        //alert(timeSegmentDate + " " + rangeStartDate + " " + rangeEndDate);
        if (distinctDates.indexOf(timeSegments[i].date) === -1 && (timeSegmentDate >= rangeStartDate && timeSegmentDate <= rangeEndDate)) {
            distinctDates.push(timeSegments[i].date);
        }
    }


    // find distinct trigger dates within timeline data for selected daterange of the user
    for (var j = 0; j < distinctDates.length; j++)
    {
        for (var k = 0; k < timeSegments.length; k++)
        {
            if(distinctDates[j] == timeSegments[k].date)
            {
                if(timeSegments[k].item == "Coffee taken" && distinctCoffeeDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctCoffeeDates.push(timeSegments[k].date);
                    distinctCoffeeDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Headache Started" && distinctHeadacheDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctHeadacheDates.push(timeSegments[k].date);
                    distinctHeadacheDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Aged Cheese taken" && distinctCheeseDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctCheeseDates.push(timeSegments[k].date);
                    distinctCheeseDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Chocolate taken" && distinctChocolateDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctChocolateDates.push(timeSegments[k].date);
                    distinctChocolateDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Citrus Fruit taken" && distinctCitrusDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctCitrusDates.push(timeSegments[k].date);
                    distinctCitrusDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Cured Meat taken" && distinctMeatDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctMeatDates.push(timeSegments[k].date);
                    distinctMeatDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Nut taken" && distinctNutDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctNutDates.push(timeSegments[k].date);
                    distinctNutDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Onion taken" && distinctOnionDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctOnionDates.push(timeSegments[k].date);
                    distinctOnionDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Salty Food taken" && distinctSaltyDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctSaltyDates.push(timeSegments[k].date);
                    distinctSaltyDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "MSG taken" && distinctMsgDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctMsgDates.push(timeSegments[k].date);
                    distinctMsgDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "NutraSweet taken" && distinctNutraDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctNutraDates.push(timeSegments[k].date);
                    distinctNutraDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Red Wine taken" && distinctWineDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctWineDates.push(timeSegments[k].date);
                    distinctWineDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Beer taken" && distinctBeerDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctBeerDates.push(timeSegments[k].date);
                    distinctBeerDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if(timeSegments[k].item == "Water taken" && distinctWaterDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctWaterDates.push(timeSegments[k].date);
                    distinctWaterDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Aerobic Exercise Started" || timeSegments[k].item == "Aerobic Exercise Ongoing" || timeSegments[k].item == "Aerobic Exercise Finished") && distinctAerobicDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctAerobicDates.push(timeSegments[k].date);
                    distinctAerobicDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Anaerobic Exercise Started" || timeSegments[k].item == "Anaerobic Exercise Ongoing" || timeSegments[k].item == "Anaerobic Exercise Finished") && distinctAnaerobicDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctAnaerobicDates.push(timeSegments[k].date);
                    distinctAnaerobicDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Flexibility Exercise Started" || timeSegments[k].item == "Flexibility Exercise Ongoing" || timeSegments[k].item == "Flexibility Exercise Finished") && distinctFlexibilityDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctFlexibilityDates.push(timeSegments[k].date);
                    distinctFlexibilityDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Interrupted Sleep") && distinctInterruptedSleepDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctInterruptedSleepDates.push(timeSegments[k].date);
                    distinctInterruptedSleepDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Lack of Sleep") && distinctLackSleepDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctLackSleepDates.push(timeSegments[k].date);
                    distinctLackSleepDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "High Stress") && distinctHighStressDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctHighStressDates.push(timeSegments[k].date);
                    distinctHighStressDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Moderate Stress") && distinctModerateStressDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctModerateStressDates.push(timeSegments[k].date);
                    distinctModerateStressDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Period Started") && distinctMensStartedDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctMensStartedDates.push(timeSegments[k].date);
                    distinctMensStartedDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }
                else if((timeSegments[k].item == "Period Ongoing") && distinctMensOngoingDates.indexOf(timeSegments[k].date) === -1)
                {
                    distinctMensOngoingDates.push(timeSegments[k].date);
                    distinctMensOngoingDateTimes.push(timeSegments[k].date + " " + timeSegments[k].time);
                }

            }
        }

    }


    var PofHeadache = (distinctHeadacheDates.length)/totalDaysWithinDateRange;
    // total number of events vs total number of no events for each trigger
    totalCoffeeDays = distinctCoffeeDates.length;
    totalNoCoffeeDays = totalDaysWithinDateRange - totalCoffeeDays;
    totalCheeseDays = distinctCheeseDates.length;
    totalNoCheeseDays = totalDaysWithinDateRange - totalCheeseDays;
    totalChocolateDays = distinctChocolateDates.length;
    totalNoChocolateDays = totalDaysWithinDateRange - totalChocolateDays;
    totalCitrusDays = distinctCitrusDates.length;
    totalNoCitrusDays = totalDaysWithinDateRange - totalCitrusDays;
    totalMeatDays = distinctMeatDates.length;
    totalNoMeatDays = totalDaysWithinDateRange - totalMeatDays;
    totalNutDays = distinctNutDates.length;
    totalNoNutDays = totalDaysWithinDateRange - totalNutDays;
    totalOnionDays = distinctOnionDates.length;
    totalNoOnionDays = totalDaysWithinDateRange - totalOnionDays;
    totalSaltyDays = distinctSaltyDates.length;
    totalNoSaltyDays = totalDaysWithinDateRange - totalSaltyDays;
    totalMsgDays = distinctMsgDates.length;
    totalNoMsgDays = totalDaysWithinDateRange - totalMsgDays;
    totalNutraDays = distinctNutraDates.length;
    totalNoNutraDays = totalDaysWithinDateRange - totalNutraDays;
    totalWineDays = distinctWineDates.length;
    totalNoWineDays = totalDaysWithinDateRange - totalWineDays;
    totalBeerDays = distinctBeerDates.length;
    totalNoBeerDays = totalDaysWithinDateRange - totalBeerDays;
    totalWaterDays = distinctWaterDates.length;
    totalNoWaterDays = totalDaysWithinDateRange - totalWaterDays;
    totalAerobicDays = distinctAerobicDates.length;
    totalNoAerobicDays = totalDaysWithinDateRange - totalAerobicDays;
    totalAnaerobicDays = distinctAnaerobicDates.length;
    totalNoAnaerobicDays = totalDaysWithinDateRange - totalAnaerobicDays;
    totalFlexibilityDays = distinctFlexibilityDates.length;
    totalNoFlexibilityDays = totalDaysWithinDateRange - totalFlexibilityDays;
    totalInterruptedSleepDays = distinctInterruptedSleepDates.length;
    totalNoInterruptedSleepDays = totalDaysWithinDateRange - totalInterruptedSleepDays;
    totalLackSleepDays = distinctLackSleepDates.length;
    totalNoLackSleepDays = totalDaysWithinDateRange - totalLackSleepDays;
    totalHighStressDays = distinctHighStressDates.length;
    totalNoHighStressDays = totalDaysWithinDateRange - totalHighStressDays;
    totalModerateStressDays = distinctModerateStressDates.length;
    totalNoModerateStressDays = totalDaysWithinDateRange - totalModerateStressDays;
    totalMensStartedDays = distinctMensStartedDates.length;
    totalNoMensStartedDays = totalDaysWithinDateRange - totalMensStartedDays;
    totalMensOngoingDays = distinctMensOngoingDates.length;
    totalNoMensOngoingDays = totalDaysWithinDateRange - totalMensOngoingDays;

    var individualTriggerProbability = [];

    var truePositive = [];
    var trueNegative = [];

    var coffeeHeadacheDates = [];
    var lackSleepHeadacheDates = [];
    var interruptedSleepHeadacheDates = [];
    var highStressHeadacheDates = [];
    var moderateStressHeadacheDates = [];
    var mensStartedHeadacheDates = [];
    var mensOngoingHeadacheDates = [];

    for (var a = 0; a < trackedTriggers.length; a++) {
        if (trackedTriggers[a] == "Aged Cheese") {

        }
        else if (trackedTriggers[a] == "Chocolate") {
        }
        else if (trackedTriggers[a] == "Citrus Fruit") {

        }
        else if (trackedTriggers[a] == "Cured Meat") {

        }
        else if (trackedTriggers[a] == "Nut") {

        }
        else if (trackedTriggers[a] == "Onion") {

        }
        else if (trackedTriggers[a] == "Salty Food") {

        }
        else if (trackedTriggers[a] == "MSG") {
        }
        else if (trackedTriggers[a] == "NutraSweet") {

        }
        else if (trackedTriggers[a] == "Coffee") {
            for (var x = 0; x < distinctCoffeeDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctCoffeeDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctCoffeeDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterCoffee.push(distinctHeadacheDateTimes[index]);
                        coffeeHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }


            // find total days within total coffee days that start headache vs start no headache
            totalCoffeeDaysStartHeadache = distinctHeadacheDateTimesAfterCoffee.length;
            totalCoffeeDaysStartNoHeadache = totalCoffeeDays - totalCoffeeDaysStartHeadache;


            var PofHeadacheGivenCoffee = Math.floor((totalCoffeeDaysStartHeadache / totalCoffeeDays)*100);
            truePositive.push([PofHeadacheGivenCoffee, trackedTriggers[a]]);
            var PofNoHeadacheGivenCoffee = Math.floor(100 - PofHeadacheGivenCoffee);
            trueNegative.push([PofNoHeadacheGivenCoffee, trackedTriggers[a]]);

            individualTriggerProbability.push(totalCoffeeDays/totalDaysWithinDateRange);

            //mapping.push([a+1, trackedTriggers[a]]);

        }
        else if (trackedTriggers[a] == "Red Wine") {

        }
        else if (trackedTriggers[a] == "Beer") {

        }
        else if (trackedTriggers[a] == "Water") {

        }
        else if (trackedTriggers[a] == "Aerobic Exercise") {

        }
        else if (trackedTriggers[a] == "Anaerobic Exercise") {

        }
        else if (trackedTriggers[a] == "Flexibility Exercise") {

        }
        else if (trackedTriggers[a] == "Interrupted Sleep") {
            for (var x = 0; x < distinctInterruptedSleepDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctInterruptedSleepDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctInterruptedSleepDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterInterruptedSleep.push(distinctHeadacheDateTimes[index]);
                        interruptedSleepHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }

            totalInterruptedSleepDaysStartHeadache = distinctHeadacheDateTimesAfterInterruptedSleep.length;
            totalInterruptedSleepDaysStartNoHeadache = totalInterruptedSleepDays - totalInterruptedSleepDaysStartHeadache;


            var PofHeadacheGivenInterruptedSleep = Math.floor((totalInterruptedSleepDaysStartHeadache / totalInterruptedSleepDays)*100);
            truePositive.push([PofHeadacheGivenInterruptedSleep, trackedTriggers[a]])
            var PofNoHeadacheGivenInterruptedSleep = Math.floor(100 - PofHeadacheGivenInterruptedSleep);
            trueNegative.push([PofNoHeadacheGivenInterruptedSleep, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);

            individualTriggerProbability.push(totalInterruptedSleepDays/totalDaysWithinDateRange);

        }
        else if (trackedTriggers[a] == "Lack of Sleep") {
            for (var x = 0; x < distinctLackSleepDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctLackSleepDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctLackSleepDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterLackSleep.push(distinctHeadacheDateTimes[index]);
                        lackSleepHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }

            totalLackSleepDaysStartHeadache = distinctHeadacheDateTimesAfterLackSleep.length;
            totalLackSleepDaysStartNoHeadache = totalLackSleepDays - totalLackSleepDaysStartHeadache;

            var PofHeadacheGivenLackSleep = Math.floor((totalLackSleepDaysStartHeadache / totalLackSleepDays)*100);
            truePositive.push([PofHeadacheGivenLackSleep, trackedTriggers[a]]);
            var PofNoHeadacheGivenLackSleep = Math.floor(100 - PofHeadacheGivenLackSleep);
            trueNegative.push([PofNoHeadacheGivenLackSleep, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);

            individualTriggerProbability.push(totalLackSleepDays/totalDaysWithinDateRange);


        }
        else if (trackedTriggers[a] == "High Stress") {
            for (var x = 0; x < distinctHighStressDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctHighStressDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctHighStressDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterHighStress.push(distinctHeadacheDateTimes[index]);
                        highStressHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }


            // find total days within total high stress days that start headache vs start no headache
            totalHighStressDaysStartHeadache = distinctHeadacheDateTimesAfterHighStress.length;
            totalHighStressDaysStartNoHeadache = totalHighStressDays - totalHighStressDaysStartHeadache;


            //alert(totalHighStressDaysStartHeadache + " " + totalHighStressDaysStartNoHeadache);

            var PofHeadacheGivenHighStress = Math.floor((totalHighStressDaysStartHeadache / totalHighStressDays)*100);
            truePositive.push([PofHeadacheGivenHighStress, trackedTriggers[a]]);
            var PofNoHeadacheGivenHighStress = Math.floor(100 - PofHeadacheGivenHighStress);
            trueNegative.push([PofNoHeadacheGivenHighStress, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);

            individualTriggerProbability.push(totalHighStressDays/totalDaysWithinDateRange);

        }
        else if (trackedTriggers[a] == "Moderate Stress") {
            for (var x = 0; x < distinctModerateStressDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctModerateStressDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctModerateStressDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterModerateStress.push(distinctHeadacheDateTimes[index]);
                        moderateStressHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }

            totalModerateStressDaysStartHeadache = distinctHeadacheDateTimesAfterModerateStress.length;
            totalModerateStressDaysStartNoHeadache = totalModerateStressDays - totalModerateStressDaysStartHeadache;

            var PofHeadacheGivenModerateStress = Math.floor((totalModerateStressDaysStartHeadache / totalModerateStressDays)*100);
            truePositive.push([PofHeadacheGivenModerateStress, trackedTriggers[a]]);
            var PofNoHeadacheGivenModerateStress = Math.floor(100 - PofHeadacheGivenModerateStress);
            trueNegative.push([PofNoHeadacheGivenModerateStress, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);

            individualTriggerProbability.push(totalModerateStressDays/totalDaysWithinDateRange);

        }
        else if (trackedTriggers[a] == "Period Started") {
            for (var x = 0; x < distinctMensStartedDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctMensStartedDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctMensStartedDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterMensStarted.push(distinctHeadacheDateTimes[index]);
                        mensStartedHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }

            totalMensStartedDaysStartHeadache = distinctHeadacheDateTimesAfterMensStarted.length;
            totalMensStartedDaysStartNoHeadache = totalMensStartedDays - totalMensStartedDaysStartHeadache;

            var PofHeadacheGivenMensStarted = Math.floor((totalMensStartedDaysStartHeadache / totalMensStartedDays)*100);
            truePositive.push([PofHeadacheGivenMensStarted, trackedTriggers[a]]);
            var PofNoHeadacheGivenMensStarted = Math.floor(100 - PofHeadacheGivenMensStarted);
            trueNegative.push([PofNoHeadacheGivenMensStarted, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);
            individualTriggerProbability.push(totalMensStartedDays/totalDaysWithinDateRange);

        }
        else if (trackedTriggers[a] == "Period Ongoing") {
            for (var x = 0; x < distinctMensOngoingDates.length; x++) {
                index = distinctHeadacheDates.indexOf(distinctMensOngoingDates[x]);
                //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x])
                if (index !== -1) {
                    //alert(index + " " + distinctHeadacheDates[index] + " " + distinctCoffeeDates[x]);
                    //alert( distinctCoffeeDateTimes[x] + " " + distinctHeadacheDateTimes[index]);
                    if (new Date(distinctMensOngoingDateTimes[x]) < new Date(distinctHeadacheDateTimes[index])) {
                        distinctHeadacheDateTimesAfterMensOngoing.push(distinctHeadacheDateTimes[index]);
                        mensOngoingHeadacheDates.push(distinctHeadacheDates[index]);
                    }

                    // alert(distinctHeadacheDateTimesAfterCoffee);
                }
            }

            totalMensOngoingDaysStartHeadache = distinctHeadacheDateTimesAfterMensOngoing.length;
            totalMensOngoingDaysStartNoHeadache = totalMensOngoingDays - totalMensOngoingDaysStartHeadache;

            var PofHeadacheGivenMensOngoing = Math.floor((totalMensOngoingDaysStartHeadache / totalMensOngoingDays)*100);
            truePositive.push([PofHeadacheGivenMensOngoing, trackedTriggers[a]]);
            var PofNoHeadacheGivenMensOngoing = Math.floor(100 - PofHeadacheGivenMensOngoing);
            trueNegative.push([PofNoHeadacheGivenMensOngoing, trackedTriggers[a]]);
            //mapping.push([a+1, trackedTriggers[a]]);

            individualTriggerProbability.push(totalMensOngoingDays/totalDaysWithinDateRange);

        }
    }


    var triggerHeadachePositive = [];
    var triggerHeadacheNegative = [];
    var validTriggers = [];

    for(var b = 0; b < truePositive.length; b++)
    {
        if(!isNaN(truePositive[b][0]) && !isNaN(trueNegative[b][0]))
        {

            triggerHeadachePositive.push(truePositive[b]);
            triggerHeadacheNegative.push(trueNegative[b]);
            validTriggers.push(trackedTriggers[b]);
        }
    }

    triggerHeadachePositive.sort(function(a, b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
    triggerHeadacheNegative.sort(function(a, b) { return (a[0] > b[0] ? -1 : (a[0] < b[0] ? 1 : 0)); });

    //alert(triggerHeadachePositive)

    var plotDataHeadacheStack = [];
    var plotDataNoHeadacheStack = [];
    var yAxisTicks = [];

    for (var c = 0; c < triggerHeadachePositive.length; c++)
    {
        yAxisTicks.push(triggerHeadachePositive[c][1]);
        plotDataHeadacheStack.push([triggerHeadachePositive[c][0], c + 1]);
        plotDataNoHeadacheStack.push([triggerHeadacheNegative[c][0], c + 1]);

    }


    //tickData = yAxisTicks.reverse();
    //alert(tickData);
    //alert(plotDataHeadacheStack);
    //alert(truePositive.length);

    totalNoCoffeeDaysButHeadache = distinctHeadacheDates.length - totalCoffeeDaysStartHeadache;
    var PofNoCoffeeGivenHeadache = totalNoCoffeeDaysButHeadache/distinctHeadacheDates.length;

    totalNoInterruptedSleepDaysButHeadache = distinctHeadacheDates.length - totalInterruptedSleepDaysStartHeadache;
    var PofNoInterruptedSleepGivenHeadache = totalNoInterruptedSleepDaysButHeadache/distinctHeadacheDates.length;

    totalNoLackSleepDaysButHeadache = distinctHeadacheDates.length - totalLackSleepDaysStartHeadache;
    var PofNoLackSleepGivenHeadache = totalNoLackSleepDaysButHeadache/distinctHeadacheDates.length;

    totalNoModerateStressDaysButHeadache = distinctHeadacheDates.length - totalModerateStressDaysStartHeadache;
    var PofNoModerateStressGivenHeadache = totalNoModerateStressDaysButHeadache/distinctHeadacheDates.length;

    totalNoHighStressDaysButHeadache = distinctHeadacheDates.length - totalHighStressDaysStartHeadache;
    var PofNoHighStressGivenHeadache = totalNoHighStressDaysButHeadache/distinctHeadacheDates.length;

    totalNoCoffeeDaysNoHeadache = totalNoCoffeeDays - totalNoCoffeeDaysButHeadache;
    var PofHeadacheGivenNoCoffee = totalNoCoffeeDaysButHeadache/totalNoCoffeeDays;

    //alert(PofHeadacheGivenNoCoffee);
    //alert(totalDaysWithinDateRange);



    showIndividualTriggerImpact(plotDataHeadacheStack, plotDataNoHeadacheStack, yAxisTicks, distinctCoffeeDates, distinctInterruptedSleepDates, distinctLackSleepDates, distinctHighStressDates, distinctModerateStressDates, distinctHeadacheDates, coffeeHeadacheDates, interruptedSleepHeadacheDates, lackSleepHeadacheDates, highStressHeadacheDates, moderateStressHeadacheDates);
    //showIndividualTriggerImpact(plotDataHeadacheStack, plotDataNoHeadacheStack, yAxisTicks, PofHeadache);

}


function getTrackedTriggers()
{
    var distinctTriggers = [];
    var foods = getAllFromLocalStorage('food');
    var drinks = getAllFromLocalStorage('drink');
    var exercises = getAllFromLocalStorage('exercise');
    var stresses = getAllFromLocalStorage('stress');
    var sleeps = getAllFromLocalStorage('sleep');
    var mens = getAllFromLocalStorage('period');

    if(foods.length > 0) {
        for (var i = 0; i < foods.length; i++) {
            if (distinctTriggers.indexOf(foods[i].foodName) === -1)
            {
                distinctTriggers.push(foods[i].foodName);
            }
        }
    }

    if(drinks.length > 0)
    {
        for (i = 0; i < drinks.length; i++) {
            if (distinctTriggers.indexOf(drinks[i].drinkName) === -1)
                distinctTriggers.push(drinks[i].drinkName);
        }
    }

    if(exercises.length > 0)
    {
        for (i = 0; i < exercises.length; i++) {
            if (distinctTriggers.indexOf(exercises[i].exerName) === -1)
                distinctTriggers.push(drinks[i].exerName);
        }
    }
    if(stresses.length > 0)
    {
        for (var i = 0; i < stresses.length; i++) {
            if (distinctTriggers.indexOf(stresses[i].stressLevel) === -1 && stresses[i].stressLevel != "Low Stress")
                distinctTriggers.push(stresses[i].stressLevel);
        }
    }
    if(sleeps.length > 0)
    {
        for (i = 0; i < sleeps.length; i++) {
            if (distinctTriggers.indexOf(sleeps[i].sleepStatus) === -1 && sleeps[i].sleepStatus != "Sound Sleep")
                distinctTriggers.push(sleeps[i].sleepStatus);
        }
    }
    if(mens.length > 0)
    {
        for (var i = 0; i < mens.length; i++) {
            if (distinctTriggers.indexOf(mens[i].periodStatus) === -1 && mens[i].periodStatus != "Period Finished")
                distinctTriggers.push(mens[i].periodStatus);
        }
    }

    return distinctTriggers;
}


function showIndividualTriggerImpact(truePositive, trueNegative, dataTicks, distinctCoffeeDates, distinctInterruptedSleepDates, distinctLackSleepDates, distinctHighStressDates, distinctModerateStressDates, distinctHeadacheDates, coffeeHeadacheDates, interruptedSleepHeadacheDates, lackSleepHeadacheDates, highStressHeadacheDates, moderateStressHeadacheDates){
//function showIndividualTriggerImpact(truePositive, trueNegative, dataTicks, PofHeadache){


plotTriggers = $.jqplot('trigger-individual', [truePositive, trueNegative], {

        // Tell the plot to stack the bars.
        stackSeries: true,
        captureRightClick: true,
        //title:'Trigger Impact (%)',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: {show: true, fontSize: '14pt'},
            shadowAngle: 135,
            rendererOptions: {
                // Put a 30 pixel margin between bars.
                barMargin: 20,
                // Highlight bars when mouse button pressed.
                // Disables default highlighting on mouse over.
                highlightMouseDown: true,
                barDirection: 'horizontal'
            }
        },
        axesDefaults: {
            tickRenderer: $.jqplot.CanvasAxisTickRenderer
            /*tickOptions: {
                angle: -30,
                fontSize: '10pt',
            }*/
        },
        axes: {
            xaxis:{
                tickOptions: {
                    formatter: function(format, value) {
                        return value + '%';
                    },
                    angle: 0,
                    fontSize: '9pt'
                }
            },
            yaxis: {
                // Don't pad out the bottom of the data range.  By default,
                // axes scaled as if data extended 10% above and below the
                // actual range to prevent data points right on grid boundaries.
                // Don't want to do that here.
                renderer: $.jqplot.CategoryAxisRenderer,
                //tickRenderer: $.jqplot.AxisTickRenderer,
                tickOptions: {
                    formatter: function(format, value) {
                        return dataTicks[value-1];
                    },
                    angle: -70,
                    fontSize: '7pt',
                    ticks: dataTicks
                }
            }
        },
        legend:{
            renderer: $.jqplot.EnhancedLegendRenderer,
            show:true,
            location: 'n',
            labels: ['Headache', 'No Headache'],
            //placement: 'outside'
            rendererOptions:{numberRows: 1, placement: "outsideGrid"}
        },
        highlighter: { show: true,
            tooltipContentEditor: function (str, seriesIndex, pointIndex) {
            return "You tapped:<br />" + str;
            }
        }

    });

    var probability = [];
    var triggers = [];

    $('#trigger-individual').bind('jqplotDataClick', function (ev, seriesIndex, pointIndex, data) {

            var tickData = plotTriggers.axes.yaxis.tickOptions.ticks;
            $("#combine-text").show();

            //plotTriggers.series[seriesIndex].seriesColors[pointIndex] = 'red';
            //plotTriggers.replot({ clear: true });

            //probability.push(tickData[pointIndex]);


            if(seriesIndex == 0) {

                probability.push(tickData[pointIndex]);
                if(tickData[pointIndex] == "Coffee") {
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of headache if you have Coffee on a day.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctCoffeeDates.length + " days), " + data[0] + "% of those days you had headaches afterwards.");
                    triggers.push(distinctCoffeeDates);
                }

                if(tickData[pointIndex] == "Interrupted Sleep") {
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of headache if you have Interrupted Sleep.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctInterruptedSleepDates.length + " days), " + data[0] + "% of those days you had headaches afterwards.");
                    triggers.push(distinctInterruptedSleepDates);
                }

                if(tickData[pointIndex] == "Lack of Sleep") {
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of headache if you have Lack of Sleep.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctLackSleepDates.length + " days), " + data[0] + "% of those days you had headaches afterwards.");
                    triggers.push(distinctLackSleepDates);
                }

                if(tickData[pointIndex] == "High Stress") {
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of headache if you have High Stress.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctHighStressDates.length + " days), " + data[0] + "% of those days you had headaches afterwards.");
                    triggers.push(distinctHighStressDates);
                }

                if(tickData[pointIndex] == "Moderate Stress") {
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of headache if you have Moderate Stress.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctModerateStressDates.length + " days), " + data[0] + "% of those days you had headaches afterwards.");
                    triggers.push(distinctModerateStressDates);
                }

                if(probability.length == 2 && probability[0] !== probability[1]) {
                    //var combined_probability = Math.floor((((truePositive[probability[0]][0]/100)*(truePositive[probability[1]][0]/100))*100));
                    var combinedTriggerDays = intersect(triggers[0], triggers[1]);

                    var combined = calculateCombinedProbability(probability, coffeeHeadacheDates, interruptedSleepHeadacheDates, lackSleepHeadacheDates, highStressHeadacheDates, moderateStressHeadacheDates, distinctHeadacheDates);

                    //$('#combine-text p').text(combined + "%" + " of days you had headaches when you had both " + probability[0] + " and " + probability[1]);
                    if(combinedTriggerDays.length !== 0)
                        $('#combine-text p').text("On the days you had both " + probability[0] + " and " + probability[1] + " (total " + combinedTriggerDays.length + " days), " + Math.floor((combined/combinedTriggerDays.length)*100) + "%" + " of those days you had headaches afterwards");
                    else
                        $('#combine-text p').text("You did not have both " + probability[0] + " and " + probability[1] + " on the same day.");
                    //$('#combine-text p').text("There is " + combined_probability + "% probability of having headache due to " + tickData[probability[0]] + " and " + tickData[probability[1]] + " on same day.");
                    $('#combine-text p').show();
                    probability.length = 0;
                    triggers.length = 0;
                }
                else if(probability[0] == probability[1] || seriesIndex == 1)
                {
                    $("#combine-text p").text("Tap a different Trigger Bar to See Combined Effect");
                    var temp = probability[0];
                    probability.length = 0;
                    probability[0] = temp;

                    var trigger = triggers[0];
                    triggers.length = 0;
                    triggers[0] = trigger;

                }
                else {
                    $("#combine-text p").text("Tap another Trigger Bar to See Combined Effect");

                }

                //alert(probability)
            }
            else if (seriesIndex == 1){

                probability.push(tickData[pointIndex]);

                if(tickData[pointIndex] == "Coffee")
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of being headache free even if you have Coffee on a day.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctCoffeeDates.length + " days), " + data[0] + "%" + " of those days you did not have headaches afterwards.");

                if(tickData[pointIndex] == "Interrupted Sleep")
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of being headache free even if you have Interrupted Sleep.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctInterruptedSleepDates.length + " days), " + data[0] + "%" + " of those days you did not have headaches afterwards.");

                if(tickData[pointIndex] == "Lack of Sleep")
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of being headache free even if you have Lack of Sleep.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctLackSleepDates.length + " days), " + data[0] + "%" + " of those days you did not have headaches afterwards.");

                if(tickData[pointIndex] == "High Stress")
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of being headache free even if you have High Stress.");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctHighStressDates.length + " days), " + data[0] + "%" + " of those days you did not have headaches afterwards.");

                if(tickData[pointIndex] == "Moderate Stress")
                    //$('#trigger-text p').text("There is " + data[0] + "% probability of being headache free even if you have Moderate Stress");
                    $('#trigger-text p').text("On the days you had " + tickData[pointIndex] + " (total " + distinctModerateStressDates.length + " days), " + data[0] + "%" + " of those days you did not have headaches afterwards.");

                if(probability.length == 2 && probability[0] !== probability[1]) {
                    //var combined_probability = Math.floor(((trueNegative[probability[0]][0]/100)*(trueNegative[probability[1]][0]/100))*100);
                    //var combinedTriggerDates = intersect()
                    var combined = calculateCombinedProbability(probability, coffeeHeadacheDates, interruptedSleepHeadacheDates, lackSleepHeadacheDates, highStressHeadacheDates, moderateStressHeadacheDates, distinctHeadacheDates);
                    $('#combine-text p').text(combined + "%" + " of days you had headaches when you had both " + probability[0] + " and " + probability[1]);
                    //$('#combine-text p').text("There is " + combined_probability + "% probability of being headache free even if you have " + tickData[probability[0]] + " and " + tickData[probability[1]] + " on same day.");
                    $('#combine-text p').show();
                    probability.length = 0;
                }
                else if(probability[0] == probability[1] || seriesIndex == 0)
                {
                    $("#combine-text p").text("Tap a different Trigger Bar to See Combined Effect");
                    var temp = probability[0];
                    probability.length = 0;
                    probability[0] = temp;

                }
                else {
                    $("#combine-text p").text("Tap another Trigger Bar to See Combined Effect");

                }

            }



        }
    );

}




function calculateCombinedProbability(probability, coffeeHeadacheDates, interruptedSleepHeadacheDates, lackSleepHeadacheDates, highStressHeadacheDates, moderateStressHeadacheDates, distinctHeadacheDates){


    var selectedTrigger = [];
    var numberOfHeadaches = distinctHeadacheDates.length;

    var x = probability[0];
    var y = probability[1];

    for(var a = 0; a < probability.length; a++)
    {
        if (probability[a] == "Aged Cheese") {

        }
        else if (probability[a] == "Chocolate") {
        }
        else if (probability[a] == "Citrus Fruit") {

        }
        else if (probability[a] == "Cured Meat") {

        }
        else if (probability[a] == "Nut") {

        }
        else if (probability[a] == "Onion") {

        }
        else if (probability[a] == "Salty Food") {

        }
        else if (probability[a] == "MSG") {
        }
        else if (probability[a] == "NutraSweet") {

        }
        else if (probability[a] == "Coffee") {
            if(coffeeHeadacheDates.length > 0)
                selectedTrigger.push(coffeeHeadacheDates);
        }
        else if (probability[a] == "Red Wine") {

        }
        else if (probability[a] == "Beer") {

        }
        else if (probability[a] == "Water") {

        }
        else if (probability[a] == "Aerobic Exercise") {

        }
        else if (probability[a] == "Anaerobic Exercise") {

        }
        else if (probability[a] == "Flexibility Exercise") {

        }
        else if (probability[a] == "Interrupted Sleep") {
            if(interruptedSleepHeadacheDates.length > 0)
                selectedTrigger.push(interruptedSleepHeadacheDates);
        }
        else if (probability[a] == "Lack of Sleep") {
            if(lackSleepHeadacheDates.length > 0)
                selectedTrigger.push(lackSleepHeadacheDates);
        }
        else if (probability[a] == "High Stress") {
            if(highStressHeadacheDates.length > 0)
                selectedTrigger.push(highStressHeadacheDates);
        }
        else if (probability[a] == "Moderate Stress") {
            if(moderateStressHeadacheDates.length > 0)
                selectedTrigger.push(moderateStressHeadacheDates);
        }
        else if (probability[a] == "Period Started") {
            //var period_started_headaache_probability = (truePositive[tickData.indexOf("Period Started")][0])/100;
        }
        else if (probability[a] == "Period Ongoing") {
           // var period_ongoing_headaache_probability = (truePositive[tickData.indexOf("Period Ongoing")][0])/100;
        }
    }

    var result = intersect(selectedTrigger[0], selectedTrigger[1]);

    //alert(result);
    //alert(selectedTrigger[0] + " / " + selectedTrigger[1] + " / " + result + " / " + numberOfHeadaches);

    //var combined_probability = Math.floor((result.length/numberOfHeadaches)*100);

    //combined_probability = ((truePositive[probability.indexOf(x)][0])/100)*((truePositive[probability.indexOf(y)][0])/100);
    //combined_probability = (triggerFrequency[tickData.indexOf(probability[0])])*(triggerFrequency[tickData.indexOf(probability[1])])
   return result.length;

}


function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}




function showFoodCompareCharts(start, end){

    var headaches = getAllFromLocalStorage('headache');
    var foods = getAllFromLocalStorage('food');
    var numberOfHeadaches = headaches.length;
    var numberOfFoods = foods.length;

    var startDate = start;
    var endDate = end;

    var date_sort_asc = function (date1, date2) {
        // This is a comparison function that will result in dates being sorted in
        // ASCENDING order. As you can see, JavaScript's native comparison operators
        // can be used to compare dates. This was news to me.
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
    };

    var startDates = [];
    for (var i = 0; i <numberOfHeadaches; i++)
    {
        if(new Date(headaches[i].startDate) >= startDate &&  new Date(headaches[i].startDate) <= endDate)
            startDates.push(new Date(headaches[i].startDate + " " + headaches[i].startTime + " " + headaches[i].startTimeAMPM));
    }

    if(startDates.length === 0)
    {
        $("#popupNoData").popup("open");
    }
    else {

        var sortedStartDates = startDates.sort(date_sort_asc);
        var timePeriod = ((sortedStartDates[sortedStartDates.length - 1]).getDate() - (sortedStartDates[0]).getDate()) + 1;
        var headachesWithinDateRange = startDates.length;
        var datesWithoutHeadaches = timePeriod - headachesWithinDateRange;

        var cheeseDates = [];
        var cheeseCounter = 0;
        var meatDates = [];
        var chocolateDates = [];
        var citrusFruitDates = [];
        var nutDates = [];
        var onionDates = [];
        var saltyFoodDates = [];
        var msgDates = [];
        var nutraSweetDates = [];

        for (var j = 0; j < numberOfFoods; j++) {
            //alert(foods[j].cheeseAged + " " + new Date(foods[j].foodTrackDate +" " + foods[j].foodTrackTime) + " " + endDate);
            if ((foods[j].cheeseAged) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                cheeseDates[cheeseCounter] = new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime);
                cheeseCounter = cheeseCounter + 1;
            }

            if ((foods[j].meatCured) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                meatDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].chocolateBar) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                chocolateDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].fruitCitrus) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                citrusFruitDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].nut) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                nutDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].onion) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                onionDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].foodSalty) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                saltyFoodDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].msgFlavor) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                msgDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }

            if ((foods[j].sweetNutra) && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) <= endDate && (new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime) >= startDate))) {
                nutraSweetDates.push(new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime));
            }


        }
        var sortedCheeseDates = cheeseDates.sort(date_sort_asc);
        var sortedMeatDates = meatDates.sort(date_sort_asc);
        var sortedChocolateDates = chocolateDates.sort(date_sort_asc);
        var sortedCitrusFruitDates = citrusFruitDates.sort(date_sort_asc);
        var sortedNutDates = nutDates.sort(date_sort_asc);
        var sortedOnionDates = onionDates.sort(date_sort_asc);
        var sortedSaltyFoodDates = saltyFoodDates.sort(date_sort_asc);
        var sortedMsgDates = msgDates.sort(date_sort_asc);
        var sortedNutraSweetDates = nutraSweetDates.sort(date_sort_asc);

        var cheeseIntakeBeforeHeadache = 0;
        var numberOfCheeseDates = sortedCheeseDates.length;


        if (numberOfCheeseDates === 0) {

            $("#cheese-compare").hide();
        }
        else {
            $("#cheese-compare").show();
            for (var k = 0; k < cheeseCounter; k++) {
                for (var l = 0; l < sortedStartDates.length; l++) {
                    if (sortedCheeseDates[k].getDate() === sortedStartDates[l].getDate()) {
                        if (sortedCheeseDates[k].getTime() <= sortedStartDates[l].getTime()) {
                            cheeseIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var cheeseDatesWithoutHeadaches = numberOfCheeseDates - cheeseIntakeBeforeHeadache;
            var cheeseHeadacheSeries = [headachesWithinDateRange, cheeseIntakeBeforeHeadache];
            var ticksCheese = ['Headaches', 'Aged Cheese'];
            var ticksCheeseWithoutHeadaches = ['Good Days', 'Aged Cheese'];
            var cheeseNoHeadaches = [datesWithoutHeadaches, cheeseDatesWithoutHeadaches];
            /**
             * cheese vs headaches
             */
            showCheeseHeadaches(cheeseHeadacheSeries, ticksCheese);
            showCheeseNoHeadaches(cheeseNoHeadaches, ticksCheeseWithoutHeadaches);
            showCheeseTimeLine(sortedStartDates, sortedCheeseDates);


        }

        var meatIntakeBeforeHeadache = 0;
        var numberOfMeatDates = sortedMeatDates.length;

        if (numberOfMeatDates === 0) {
            $("#meat-compare").hide();
        }
        else {
            $("#meat-compare").show();
            for (var m = 0; m < numberOfMeatDates; m++) {
                for (var n = 0; n < sortedStartDates.length; n++) {
                    if (sortedMeatDates[m].getDate() === sortedStartDates[n].getDate()) {
                        if (sortedMeatDates[m].getTime() <= sortedStartDates[n].getTime()) {
                            meatIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var meatDatesWithoutHeadaches = numberOfMeatDates - meatIntakeBeforeHeadache;
            var meatHeadacheSeries = [headachesWithinDateRange, meatIntakeBeforeHeadache];
            var ticksMeat = ['Headache', 'Cured Meat'];
            var meatNoHeadaches = [datesWithoutHeadaches, meatDatesWithoutHeadaches];
            var ticksMeatWithoutHeadaches = ['Good Days', 'Cured Meat'];
            showMeatHeadaches(meatHeadacheSeries, ticksMeat);
            showMeatNoHeadaches(meatNoHeadaches, ticksMeatWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);
        }

        var chocolateIntakeBeforeHeadache = 0;
        var numberOfChocolateDates = sortedChocolateDates.length;
        if (numberOfChocolateDates === 0) {
            $("#chocolate-compare").hide();
        }
        else {
            $("#chocolate-compare").show();
            for (var o = 0; o < numberOfChocolateDates; o++) {
                for (var p = 0; p < sortedStartDates.length; p++) {
                    if (sortedChocolateDates[o].getDate() === sortedStartDates[p].getDate()) {
                        if (sortedChocolateDates[o].getTime() <= sortedStartDates[p].getTime()) {
                            chocolateIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var chocolateDatesWithoutHeadaches = numberOfChocolateDates - chocolateIntakeBeforeHeadache;
            var chocolateHeadacheSeries = [headachesWithinDateRange, chocolateIntakeBeforeHeadache];
            var ticksChocolate = ['Headache', 'Chocolate'];
            var chocolateNoHeadaches = [datesWithoutHeadaches, chocolateDatesWithoutHeadaches];
            var ticksChocolateWithoutHeadaches = ['Good Days', 'Chocolate'];
            showChocolateHeadaches(chocolateHeadacheSeries, ticksChocolate);
            showChocolateNoHeadaches(chocolateNoHeadaches, ticksChocolateWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var citrusFruitIntakeBeforeHeadache = 0;
        var numberOfCitrusFruitDates = sortedCitrusFruitDates.length;
        if (numberOfCitrusFruitDates === 0) {
            $("#fruit-compare").hide();
        }
        else {
            $("#fruit-compare").show();
            for (var q = 0; q < numberOfCitrusFruitDates; q++) {
                for (var r = 0; r < sortedStartDates.length; r++) {
                    if (sortedCitrusFruitDates[q].getDate() === sortedStartDates[r].getDate()) {
                        if (sortedCitrusFruitDates[q].getTime() <= sortedStartDates[r].getTime()) {
                            citrusFruitIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var citrusFruitDatesWithoutHeadaches = numberOfCitrusFruitDates - citrusFruitIntakeBeforeHeadache;
            var citrusFruitHeadacheSeries = [headachesWithinDateRange, citrusFruitIntakeBeforeHeadache];
            var ticksCitrusFruit = ['Headache', 'Citrus Fruit'];
            var citrusFruitNoHeadaches = [datesWithoutHeadaches, citrusFruitDatesWithoutHeadaches];
            var ticksCitrusFruitWithoutHeadaches = ['Good Days', 'Citrus Fruit'];
            showCitrusFruitHeadaches(citrusFruitHeadacheSeries, ticksCitrusFruit);
            showCitrusFruitNoHeadaches(citrusFruitNoHeadaches, ticksCitrusFruitWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var citrusFruitIntakeBeforeHeadache = 0;
        var numberOfCitrusFruitDates = sortedCitrusFruitDates.length;
        if (numberOfCitrusFruitDates === 0) {
            $("#fruit-compare").hide();
        }
        else {
            $("#fruit-compare").show();
            for (var q = 0; q < numberOfCitrusFruitDates; q++) {
                for (var r = 0; r < sortedStartDates.length; r++) {
                    if (sortedCitrusFruitDates[q].getDate() === sortedStartDates[r].getDate()) {
                        if (sortedCitrusFruitDates[q].getTime() <= sortedStartDates[r].getTime()) {
                            citrusFruitIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var citrusFruitDatesWithoutHeadaches = numberOfCitrusFruitDates - citrusFruitIntakeBeforeHeadache;
            var citrusFruitHeadacheSeries = [headachesWithinDateRange, citrusFruitIntakeBeforeHeadache];
            var ticksCitrusFruit = ['Headache', 'Citrus Fruit'];
            var citrusFruitNoHeadaches = [datesWithoutHeadaches, citrusFruitDatesWithoutHeadaches];
            var ticksCitrusFruitWithoutHeadaches = ['Good Days', 'Citrus Fruit'];
            showCitrusFruitHeadaches(citrusFruitHeadacheSeries, ticksCitrusFruit);
            showCitrusFruitNoHeadaches(citrusFruitNoHeadaches, ticksCitrusFruitWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var nutraSweetIntakeBeforeHeadache = 0;
        var numberOfNutraSweetDates = sortedNutraSweetDates.length;
        if (numberOfNutraSweetDates === 0) {
            $("#ns-compare").hide();
        }
        else {
            $("#ns-compare").show();
            for (var s = 0; s < numberOfNutraSweetDates; s++) {
                for (var t = 0; t < sortedStartDates.length; t++) {
                    if (sortedNutraSweetDates[s].getDate() === sortedStartDates[t].getDate()) {
                        if (sortedNutraSweetDates[s].getTime() <= sortedStartDates[t].getTime()) {
                            nutraSweetIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var nutraSweetDatesWithoutHeadaches = numberOfNutraSweetDates - nutraSweetIntakeBeforeHeadache;
            var nutraSweetHeadacheSeries = [headachesWithinDateRange, nutraSweetIntakeBeforeHeadache];
            var ticksNutraSweet = ['Headache', 'NutraSweet'];
            var nutraSweetNoHeadaches = [datesWithoutHeadaches, nutraSweetDatesWithoutHeadaches];
            var ticksNutraSweetWithoutHeadaches = ['Good Days', 'NutraSweet'];
            showNutraSweetHeadaches(nutraSweetHeadacheSeries, ticksNutraSweet);
            showNutraSweetNoHeadaches(nutraSweetNoHeadaches, ticksNutraSweetWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var nutIntakeBeforeHeadache = 0;
        var numberOfNutDates = sortedNutDates.length;
        if (numberOfNutDates === 0) {
            $("#nut-compare").hide();
        }
        else {
            $("#nut-compare").show();
            for (var a = 0; a < numberOfNutDates; a++) {
                for (var b = 0; b < sortedStartDates.length; b++) {
                    if (sortedNutDates[s].getDate() === sortedStartDates[t].getDate()) {
                        if (sortedNutDates[s].getTime() <= sortedStartDates[t].getTime()) {
                            nutIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var nutDatesWithoutHeadaches = numberOfNutDates - nutIntakeBeforeHeadache;
            var nutHeadacheSeries = [headachesWithinDateRange, nutIntakeBeforeHeadache];
            var ticksNut = ['Headache', 'Nut'];
            var nutNoHeadaches = [datesWithoutHeadaches, nutDatesWithoutHeadaches];
            var ticksNutWithoutHeadaches = ['Good Days', 'Nut'];
            showNutHeadaches(nutHeadacheSeries, ticksNut);
            showNutNoHeadaches(nutNoHeadaches, ticksNutWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var onionIntakeBeforeHeadache = 0;
        var numberOfOnionDates = sortedOnionDates.length;
        if (numberOfOnionDates === 0) {
            $("#onion-compare").hide();
        }
        else {
            $("#onion-compare").show();
            for (var c = 0; c < numberOfOnionDates; c++) {
                for (var d = 0; d < sortedStartDates.length; d++) {
                    if (sortedOnionDates[c].getDate() === sortedStartDates[d].getDate()) {
                        if (sortedOnionDates[c].getTime() <= sortedStartDates[d].getTime()) {
                            onionIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var onionDatesWithoutHeadaches = numberOfOnionDates - onionIntakeBeforeHeadache;
            var onionHeadacheSeries = [headachesWithinDateRange, onionIntakeBeforeHeadache];
            var ticksOnion = ['Headache', 'Onion'];
            var onionNoHeadaches = [datesWithoutHeadaches, onionDatesWithoutHeadaches];
            var ticksOnionWithoutHeadaches = ['Good Days', 'Onion'];
            showOnionHeadaches(onionHeadacheSeries, ticksOnion);
            showOnionNoHeadaches(onionNoHeadaches, ticksOnionWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var saltyFoodIntakeBeforeHeadache = 0;
        var numberOfSaltyFoodDates = sortedSaltyFoodDates.length;
        if (numberOfSaltyFoodDates === 0) {
            $("#salty-compare").hide();
        }
        else {
            $("#salty-compare").show();
            for (var e = 0; e < numberOfSaltyFoodDates; e++) {
                for (var f = 0; f < sortedStartDates.length; f++) {
                    if (sortedSaltyFoodDates[e].getDate() === sortedStartDates[f].getDate()) {
                        if (sortedSaltyFoodDates[e].getTime() <= sortedStartDates[f].getTime()) {
                            saltyFoodIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var saltyFoodDatesWithoutHeadaches = numberOfSaltyFoodDates - saltyFoodIntakeBeforeHeadache;
            var saltyFoodHeadacheSeries = [headachesWithinDateRange, saltyFoodIntakeBeforeHeadache];
            var ticksSaltyFood = ['Headache', 'Salty Food'];
            var saltyFoodNoHeadaches = [datesWithoutHeadaches, saltyFoodDatesWithoutHeadaches];
            var ticksSaltyFoodWithoutHeadaches = ['Good Days', 'Salty Food'];
            showSaltyFoodHeadaches(saltyFoodHeadacheSeries, ticksSaltyFood);
            showSaltyFoodNoHeadaches(saltyFoodNoHeadaches, ticksSaltyFoodWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }

        var msgIntakeBeforeHeadache = 0;
        var numberOfMsgDates = sortedMsgDates.length;
        if (numberOfMsgDates === 0) {
            $("#msg-compare").hide();
        }
        else {
            $("#msg-compare").show();
            for (var g = 0; g < numberOfMsgDates; g++) {
                for (var h = 0; h < sortedStartDates.length; h++) {
                    if (sortedMsgDates[g].getDate() === sortedStartDates[h].getDate()) {
                        if (sortedMsgDates[g].getTime() <= sortedStartDates[h].getTime()) {
                            msgIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var msgDatesWithoutHeadaches = numberOfMsgDates - msgIntakeBeforeHeadache;
            var msgHeadacheSeries = [headachesWithinDateRange, msgIntakeBeforeHeadache];
            var ticksMsg = ['Headache', 'MSG'];
            var msgNoHeadaches = [datesWithoutHeadaches, msgDatesWithoutHeadaches];
            var ticksMsgWithoutHeadaches = ['Good Days', 'MSG'];
            showMsgHeadaches(msgHeadacheSeries, ticksMsg);
            showMsgNoHeadaches(msgNoHeadaches, ticksMsgWithoutHeadaches);
            //showMeatTimeLine(sortedStartDates, sortedMeatDates);

        }
    }

    $.mobile.loading("hide");
}

function showCheeseHeadaches(cheeseHeadacheSeries, ticksCheese){

    plot1 = $.jqplot('cheese-headache', [cheeseHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
                textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCheese,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });

    $("#cheese-headache").bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data){
        $("#cheesePopup").popup({
            beforeposition: function () {
                $(this).css({
                    width: window.innerWidth - 25,
                    left: 0,
                    right: 0
                    //height: window.innerHeight - 14
                });
            },
            x: 0,
            y: 0
        });
        //$("#cheesePopup").css("width", "80%");
        $("#cheesePopup").popup("open");
    });
}

function showCheeseNoHeadaches(cheeseNoHeadaches, ticksCheeseWithoutHeadaches){

    plot1 = $.jqplot('cheese-noheadache', [cheeseNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCheeseWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showMeatHeadaches(meatHeadacheSeries, ticksMeat){

    plot1 = $.jqplot('meat-headache', [meatHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksMeat,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });

    /*$("#cheese-headache").bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data){
        $("#cheesePopup").popup({
            beforeposition: function () {
                $(this).css({
                    width: window.innerWidth - 15,
                    left: 0,
                    right: 0
                    //height: window.innerHeight - 14
                });
            },
            x: 0,
            y: 0
        });
        //$("#cheesePopup").css("width", "80%");
        $("#cheesePopup").popup("open");
    });*/
}

function showMeatNoHeadaches(meatNoHeadaches, ticksMeatWithoutHeadaches){

    plot1 = $.jqplot('meat-noheadache', [meatNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksMeatWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showChocolateHeadaches(chocolateHeadacheSeries, ticksChocolate){
    plot1 = $.jqplot('chocolate-headache', [chocolateHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksChocolate,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showChocolateNoHeadaches(chocolateNoHeadaches, ticksChocolateWithoutHeadaches){
    plot1 = $.jqplot('chocolate-noheadache', [chocolateNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksChocolateWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showCitrusFruitHeadaches(citrusFruitHeadacheSeries, ticksCitrusFruit){
    plot1 = $.jqplot('fruit-headache', [citrusFruitHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCitrusFruit,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showCitrusFruitNoHeadaches(citrusFruitNoHeadaches, ticksCitrusFruitWithoutHeadaches){
    plot1 = $.jqplot('fruit-noheadache', [citrusFruitNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCitrusFruitWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}


function showNutraSweetHeadaches(nutraSweetHeadacheSeries, ticksNutraSweet){
    plot1 = $.jqplot('ns-headache', [nutraSweetHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksNutraSweet,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showNutraSweetNoHeadaches(nutraSweetNoHeadaches, ticksNutraSweetWithoutHeadaches){
    plot1 = $.jqplot('ns-noheadache', [nutraSweetNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksNutraSweetWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showNutHeadaches(nutHeadacheSeries, ticksNut){
    plot1 = $.jqplot('nut-headache', [nutHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksNut,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showNutNoHeadaches(nutNoHeadaches, ticksNutWithoutHeadaches){
    plot1 = $.jqplot('nut-noheadache', [nutNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksNutWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });

}

function showOnionHeadaches(onionHeadacheSeries, ticksOnion){
    plot1 = $.jqplot('onion-headache', [onionHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksOnion,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showOnionNoHeadaches(onionNoHeadaches, ticksOnionWithoutHeadaches){
    plot1 = $.jqplot('onion-noheadache', [onionNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksOnionWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showSaltyFoodHeadaches(saltyFoodHeadacheSeries, ticksSaltyFood){
    plot1 = $.jqplot('salty-headache', [saltyFoodHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksSaltyFood,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showSaltyFoodNoHeadaches(saltyFoodNoHeadaches, ticksSaltyFoodWithoutHeadaches){
    plot1 = $.jqplot('salty-noheadache', [saltyFoodNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksSaltyFoodWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}

function showMsgHeadaches(msgHeadacheSeries, ticksMsg){
    plot1 = $.jqplot('msg-headache', [msgHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksMsg,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });
}

function showMsgNoHeadaches(msgNoHeadaches, ticksMsgWithoutHeadaches){
    plot1 = $.jqplot('msg-noheadache', [msgNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksMsgWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}


function showCheeseTimeLine(headachedates, cheesedates){

    //var now = moment().minutes(0).seconds(0).milliseconds(0);
    var groupCount = 2;

    var groupnames = ['Cheese', 'Headaches'];
    var groups = new vis.DataSet();

    for (var g = 0; g < groupCount; g++) {
        groups.add({id: g, content: groupnames[g]});
    }

    // create a dataset with items
    var timeItems = new vis.DataSet();

    for(var j = 0; j < cheesedates.length; j++)
    {
        timeItems.add({
            group: 0,  // activities
            //content: 'Cheese Intake',
            start: cheesedates[j],
            type: 'point',
            color: 'blue'
        });
    }

    for(var p = 0; p < headachedates.length; p++)
    {
        //alert(headaches[p].userLocation);
        timeItems.add({
            group: 1,
            //content: 'Headache Started',
            start: headachedates[p],
            //end: new Date(headaches[p].endDate + " " + headaches[p].endTime + " " + headaches[p].endTimeAMPM),
            type: 'point'
        });
    }

    // create visualization
    var container = document.getElementById('cheese-timeline');
    var options = {
        groupOrder: 'content',  // groupOrder can be a property name or a sorting function
        zoomable: false
    };

    var timeline = new vis.Timeline(container);
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(timeItems);
    timeline.setOptions({ orientation: {axis: "top"} });
    var startdate = headachedates[0].getDate();
    var startmonth = headachedates[0].getMonth() + 1;
    var startyear = headachedates[0].getUTCFullYear();
    var windowstart = startyear + '-' + startmonth + '-' + startdate;
    timeline.setWindow(windowstart, headachedates[1]);
    //timeline.fit();
}

function showDrinkCompareCharts(start, end){
    var headaches = getAllFromLocalStorage('headache');
    var drinks = getAllFromLocalStorage('drink');

    var numberOfHeadaches = headaches.length;
    var numberOfDrinks = drinks.length;

    var startDate = start;
    var endDate = end;

    var date_sort_asc = function (date1, date2) {
        // This is a comparison function that will result in dates being sorted in
        // ASCENDING order. As you can see, JavaScript's native comparison operators
        // can be used to compare dates. This was news to me.
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
    };

    var startDates = [];
    for (var i = 0; i <numberOfHeadaches; i++)
    {
        if(new Date(headaches[i].startDate) >= startDate &&  new Date(headaches[i].startDate) <= endDate)
            startDates.push(new Date(headaches[i].startDate + " " + headaches[i].startTime + " " + headaches[i].startTimeAMPM));
    }

    if(startDates.length === 0)
    {
        $("#popupNoData").popup("open");
    }
    else
    {
        var sortedStartDates = startDates.sort(date_sort_asc);
        var timePeriod = ((sortedStartDates[sortedStartDates.length - 1]).getDate() - (sortedStartDates[0]).getDate()) + 1;
        var headachesWithinDateRange = startDates.length;
        var datesWithoutHeadaches = timePeriod - headachesWithinDateRange;

        var coffeeDates = [];
        var wineDates = [];
        var beerDates = [];
        var waterDates = [];

        for (var j = 0; j < numberOfDrinks; j++) {
            //alert(foods[j].cheeseAged + " " + new Date(foods[j].foodTrackDate +" " + foods[j].foodTrackTime) + " " + endDate);
            if ((drinks[j].drinkName == "Coffee") && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) <= endDate && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) >= startDate)))
                coffeeDates.push(new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime));

            if ((drinks[j].drinkName == "Red Wine") && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) <= endDate && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) >= startDate)))
                wineDates.push(new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime));

            if ((drinks[j].drinkName == "Beer") && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) <= endDate && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) >= startDate)))
                beerDates.push(new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime));

            if ((drinks[j].drinkName == "Water") && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) <= endDate && (new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime) >= startDate)))
                waterDates.push(new Date(drinks[j].drinkTrackDate + " " + drinks[j].drinkTrackTime));
        }

        var sortedCoffeeDates = coffeeDates.sort(date_sort_asc);
        var sortedWineDates = wineDates.sort(date_sort_asc);
        var sortedBeerDates = beerDates.sort(date_sort_asc);
        var sortedWaterDates = waterDates.sort(date_sort_asc);

        var coffeeIntakeBeforeHeadache = 0;
        var numberOfCoffeeDates = sortedCoffeeDates.length;


        if (numberOfCoffeeDates === 0) {

            $("#coffee-compare").hide();
        }
        else {
            $("#coffee-compare").show();
            for (var k = 0; k < coffeeDates.length; k++) {
                for (var l = 0; l < sortedStartDates.length; l++) {
                    if (sortedCoffeeDates[k].getDate() === sortedStartDates[l].getDate()) {
                        if (sortedCoffeeDates[k].getTime() <= sortedStartDates[l].getTime()) {
                            coffeeIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var coffeeDatesWithoutHeadaches = numberOfCoffeeDates - coffeeIntakeBeforeHeadache;
            var coffeeHeadacheSeries = [headachesWithinDateRange, coffeeIntakeBeforeHeadache];
            var ticksCoffee = ['Headaches', 'Coffee'];
            var ticksCoffeeWithoutHeadaches = ['Good Days', 'Coffee'];
            var coffeeNoHeadaches = [datesWithoutHeadaches, coffeeDatesWithoutHeadaches];

            showCoffeeHeadaches(coffeeHeadacheSeries, ticksCoffee, coffeeNoHeadaches, ticksCoffeeWithoutHeadaches);

        }

        var wineIntakeBeforeHeadache = 0;
        var numberOfWineDates = sortedWineDates.length;


        if (numberOfWineDates === 0) {

            $("#wine-compare").hide();
        }
        else {
            $("#wine-compare").show();
            for (var a = 0; a < wineDates.length; a++) {
                for (var b = 0; b < sortedStartDates.length; b++) {
                    if (sortedWineDates[a].getDate() === sortedStartDates[b].getDate()) {
                        if (sortedCoffeeDates[a].getTime() <= sortedStartDates[b].getTime()) {
                            wineIntakeBeforeHeadache++;
                        }
                    }
                }
            }

            var wineDatesWithoutHeadaches = numberOfWineDates - wineIntakeBeforeHeadache;
            var wineHeadacheSeries = [headachesWithinDateRange, wineIntakeBeforeHeadache];
            var ticksWine = ['Headaches', 'Wine'];
            var ticksWineWithoutHeadaches = ['Good Days', 'Wine'];
            var wineNoHeadaches = [datesWithoutHeadaches, wineDatesWithoutHeadaches];

            showWineHeadaches(wineHeadacheSeries, ticksWine, wineNoHeadaches, ticksWineWithoutHeadaches);

        }
        $.mobile.loading("hide");
    }
}

function showCoffeeHeadaches(coffeeHeadacheSeries, ticksCoffee, coffeeNoHeadaches, ticksCoffeeWithoutHeadaches){
    plot1 = $.jqplot('coffee-headache', [coffeeHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCoffee,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });

    plot2 = $.jqplot('coffee-noheadache', [coffeeNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksCoffeeWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });

}

function showWineHeadaches(wineHeadacheSeries, ticksWine, wineNoHeadaches, ticksWineWithoutHeadaches){
    plot1 = $.jqplot('wine-headache', [wineHeadacheSeries], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:{text: 'Headache Days',
            textAlign: 'center'},
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true},
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksWine,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                },
                label: 'Occurrences',
                labelOptions:{fontSize: 12}


            }
        },
        highlighter: { show: false }
        //legend: { renderer: $.jqplot.EnhancedLegendRenderer, show:true, location: 'e', rendererOptions: { numberRows: 2}}
    });

    plot2 = $.jqplot('wine-noheadache', [wineNoHeadaches], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        title:'No Headache Days',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true },
            rendererOptions: {
                // Set the varyBarColor option to true to use different colors for each bar.
                // The default series colors are used.
                varyBarColor: true
            }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticksWineWithoutHeadaches,
                //label: 'Headache Days',
                tickOptions:{
                    angle: -30,
                    fontSize: '8pt'
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                min: 0 ,
                tickOptions: {
                    formatString: '%d'
                }
                //label: 'Frequency'

            }
        },
        highlighter: { show: false }
    });
}


function showExploreCharts(){

    var foods = getAllFromLocalStorage('food');
    var drinks = getAllFromLocalStorage('drink');
    var exercises = getAllFromLocalStorage('exercise');
    var sleeps = getAllFromLocalStorage('sleep');
    var stresses = getAllFromLocalStorage('stress');
    var mens = getAllFromLocalStorage('period');
    var meds = getAllFromLocalStorage('medication');
    var headaches = getAllFromLocalStorage('headache');

    //var now = moment().minutes(0).seconds(0).milliseconds(0);
    //var groupCount = 3;

    //var groupnames = ['Activities', 'Weather', 'Headaches'];
   // var groups = new vis.DataSet();

   // for (var g = 0; g < groupCount; g++) {
  //      groups.add({id: g, content: groupnames[g]});
   // }

    // create a dataset with items
    var timeItems = new vis.DataSet();

    var foodItems = [];
    var column = 0;
    for(var j = 0; j < foods.length; j++)
    {
        if (foods[j].cheeseAged) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Aged Cheese');
        }

        if (foods[j].meatCured ) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Cured Meat');
        }

        if (foods[j].chocolateBar) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Chocolate');
        }

        if (foods[j].fruitCitrus) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Citrus Fruit');
        }

        if (foods[j].nut) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Nuts');
        }

        if (foods[j].onion) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Onions');
        }

        if (foods[j].foodSalty) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'Salty Food');
        }

        if (foods[j].msgFlavor) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'MSG');
        }

        if (foods[j].sweetNutra) {
            foodItems.push((new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime)), 'NutraSweet');
        }

        timeItems.add({
            //group: 0,  // activities
            content: foodItems[j][column],
            start: new Date(foods[j].foodTrackDate + " " + foods[j].foodTrackTime),
            type: 'point'
        });
        column++;
    }

    /*for(var i = 0; i < drinks.length; i++)
    {
        timeItems.add({
            group: 0,
            content: drinks[i].drinkName,
            start: new Date(drinks[i].drinkTrackDate + " " + drinks[i].drinkTrackTime),
            type: 'point'
        });
    }

    for(var k = 0; k < exercises.length; k++)
    {
        timeItems.add({
            group: 0,
            content: exercises[k].exerciseName + " " + exercises[k].exerciseStatus,
            start: new Date(exercises[k].exerciseTrackDate + " " + exercises[k].exerciseTrackTime),
            type: 'point'
        });
    }

        timeItems.add({
            group: 1,
            content: 'Cloudy',
            start: new Date(2015, 5, 1, 10, 0, 0),
            type: 'point'
        });



    for(var p = 0; p < headaches.length; p++)
    {
        //alert(headaches[p].userLocation);
        timeItems.add({
            group: 2,
            content: headaches[p].userLocation,
            start: new Date(headaches[p].startDate + " " + headaches[p].startTime + " " + headaches[p].startTimeAMPM),
            end: new Date(headaches[p].endDate + " " + headaches[p].endTime + " " + headaches[p].endTimeAMPM),
            type: 'range'
        });
    }

    for(var r = 0; r < meds.length; r++)
    {
        timeItems.add({
            group: 2,
            content: meds[r].medicationName,
            start: new Date(meds[r].trackDate + " " + meds[r].trackTime),
            type: 'point'
        });
    }

    // create visualization
    var container = document.getElementById('daily-explore');
    var options = {
        groupOrder: 'content',  // groupOrder can be a property name or a sorting function
        zoomable: false
    };

    var timeline = new vis.Timeline(container);
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(timeItems);
    timeline.setOptions({ orientation: {axis: "top"} });
    timeline.setWindow((new Date(2015,4,1,15,0,0)), (new Date(2015,4,2,23,0,0)));

     */

    return timeItems;

}

function showCalendar(){

    $("#back-to-calendar").hide();
    $("#headache-segment").hide();
    $("#morning-segment").hide();
    $("#afternoon-segment").hide();
    $("#evening-segment").hide();
    $("#late-segment").hide();

    var headaches = getAllFromLocalStorage('headache');
    var numberOfHeadaches = headaches.length;

    var headacheEvents = [];

    for (var i = 0; i <numberOfHeadaches; i++)
    {
        headacheEvents.push(
            {
                start: new Date(headaches[i].startDate + " " + headaches[i].startTime + " " + headaches[i].startTimeAMPM),
                end: new Date(headaches[i].endDate + " " + headaches[i].endTime + " " + headaches[i].endTimeAMPM)
            }
        );
    }

    //alert(JSON.stringify(headacheEvents));


    $("#calendar").fullCalendar({

        header: {
            right: 'prev next, today',
            left: 'title'
        },
        views: {
            month: { // name of view
                titleFormat: 'MMM, YYYY'
                //displayEventEnd: true
                // other view-specific options here
            }
        },
        /*dayClick: function() {
            alert('a day has been clicked!');
        },*/
        eventClick: function(calEvent, jsEvent, view) {
            $("#back-to-home").hide();
            $("#calendar").hide();
            $("#back-to-calendar").show();
            $("#headache-segment").show();

            $("#back-to-calendar").on("click", function(){
                $("#back-to-home").show();
                $("#calendar").show();
                $("#back-to-calendar").hide();
                $("#late-segment").hide();
                $("#morning-segment").hide();
                $("#afternoon-segment").hide();
                $("#evening-segment").hide();
                $("#late-time-block").text("");
                $("#late-event-block").text("");
                $("#morning-time-block").text("");
                $("#morning-event-block").text("");
                $("#afternoon-time-block").text("");
                $("#afternoon-event-block").text("");
                $("#evening-time-block").text("");
                $("#evening-event-block").text("");
                $("br").remove();






            });

            exploreHeadacheSegment(calEvent);

        },
        contentHeight: 'auto',
        events: headacheEvents,
        eventColor: 'red',
        eventTextColor: 'white'

    });

}

function exploreHeadacheSegment(event){

    $("#morning-segment").hide();
    $("#afternoon-segment").hide();
    $("#evening-segment").hide();
    $("#late-segment").hide();

    var headacheStart = new Date(event.start);
    var headacheEnd = new Date(event.end);
    var headacheTimeSegment = "";
    var month = headacheStart.getMonth()+1;
    var day = headacheStart.getDate();
    var flag = 0;
    var year = headacheStart.getFullYear();

    if(month < 10)
        month = "0" + month;
    if(day < 10)
        day = "0" + day;

    var startDateString = month + "/" + day + "/" + year;

    var allEvents = getAllFromLocalStorage('timebucket');

    function comp(a, b) {
        return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();;
    }
    allEvents.sort(comp);

    var previousSegments = [];

    var endmonth = headacheEnd.getMonth()+1;
    var endday = headacheEnd.getDate();
    var endyear = headacheEnd.getFullYear();
    var endHours = headacheEnd.getHours();
    var endMinutes = headacheEnd.getMinutes();
    var ampm = "";
    if(endHours > 12 && endHours <= 23) {
        endHours = endHours - 12;
        ampm = "PM";
    }
    else if(endHours == 12)
        ampm = "PM";
    else if(endHours == 0) {
        endHours = 1;
        ampm = "AM";
    }
    else if(endHours > 0 && endHours < 12)
    {
        ampm = "AM";
    }
    if(endmonth < 10)
        endmonth = "0" + endmonth;
    if(endday < 10)
        endday = "0" + endday;

    var endDateString = endmonth + "/" + endday + "/" + endyear + " " + endHours + ":" + endMinutes + " " + ampm;

    if (headacheStart.getHours() >= 4 && headacheStart.getHours() <= 11) {
        headacheTimeSegment = "Morning";
        previousSegments.push("Late Night", "Evening");
        $("#morning-segment").append("<br />");
        $("#afternoon-segment").hide();
        $("#afternoon-segment").append("<br />");
        $("#evening-segment").append("<br />");
        $("#late-segment").append("<br />");

        var lastDate = new Date(startDateString);
        lastDate.setDate(lastDate.getDate()-1);
        var prevDate = lastDate.getDate();

        if(prevDate < 10)
            prevDate = "0" + prevDate;

        var lastDateString = month + "/" + prevDate + "/" + year;

        var dateString = headacheStart.getMonth()+1 + "/" + headacheStart.getDate() + "/" + headacheStart.getFullYear();
        $("#morning-time-segment h4").text(dateString + ": " + headacheTimeSegment).show();
        $("#late-time-segment h4").text(dateString + ": " + previousSegments[0]).show();
        $("#evening-time-segment h4").text((lastDate.getMonth()+1 + "/" + lastDate.getDate() + "/" + lastDate.getFullYear()) + ": " + previousSegments[1]).show();

        $("#morning-segment").insertAfter("#evening-segment");
        $("#evening-segment").insertAfter("#late-segment");

        for (var i = 0; i < allEvents.length; i++)
        {

            if(startDateString == allEvents[i].date && headacheTimeSegment == allEvents[i].segment)
            {
                $("#morning-segment").show();

                if(allEvents[i].item == "Headache Started") {
                    $("#morning-time-block").append(allEvents[i].time.slice(0,2)+":00 AM");
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("Temp: " + allEvents[i].environment.temp);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Rel Hum: " + allEvents[i].environment.hum);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Wind: " + allEvents[i].environment.wind);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Pressure: " + allEvents[i].environment.press);
                    $("#morning-event-block").append("<br />");
                    $("#morning-time-block, #morning-event-block").append("<hr>");

                    $("#morning-time-block").append("<span></span>");
                    $("#morning-time-block span").append(allEvents[i].time).css("font-weight", "bold");
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<span></span>");
                    $("#morning-event-block span").append(allEvents[i].item).css("font-weight", "bold");
                    $("#morning-event-block").append("<br />");
                    if(i < allEvents.length - 1) {
                        if (headacheTimeSegment == allEvents[i + 1].segment && startDateString == allEvents[i + 1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");
                    }

                }
                else
                {
                    $("#morning-time-block").append(allEvents[i].time);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append(allEvents[i].item);
                    $("#morning-event-block").append("<br />");


                    if(i < allEvents.length - 1) {
                        if (headacheTimeSegment == allEvents[i + 1].segment && startDateString == allEvents[i + 1].date)  // check date as well in addition to segment 29th vs 30th
                            $("#morning-time-block, #morning-event-block").append("<hr>");
                    }

                }

                //if((new Date(endDateString)).getHours() >= 4 && (new Date(endDateString)).getHours() <= 11)
                    $("#morning-headache-status").text("Headache Ended: " + endDateString);
               // else
                  //  $("#morning-headache-status").text("Headache Status: Ongoing");
            }

            if(lastDate.toString() == allEvents[i].date && previousSegments[0] == allEvents[i].segment)
            {
                $("#late-segment").show();

                if($("#late-time-block, #late-event-block").text() == ""){
                    $("#late-time-block").append(allEvents[i].time.slice(0, 2) + ":00 AM");
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("Temp: " + allEvents[i].environment.temp);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Rel Hum: " + allEvents[i].environment.hum);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Wind: " + allEvents[i].environment.wind);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Pressure: " + allEvents[i].environment.press);
                    $("#late-event-block").append("<br />");
                    $("#late-time-block, #late-event-block").append("<hr>");

                    $("#late-time-block").append(allEvents[i].time);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append(allEvents[i].item);
                    $("#late-event-block").append("<br />");
                    if(i < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[i+1].segment && startDateString == allEvents[i+1].date)
                            $("#late-time-block, #late-event-block").append("<hr>");
                }
                else {
                    $("#late-time-block").append(allEvents[i].time);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append(allEvents[i].item);
                    $("#late-event-block").append("<br />");
                    if(i < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[i+1].segment && startDateString == allEvents[i+1].date)
                            $("#late-time-block, #late-event-block").append("<hr>");
                }

                $("#late-headache-status").text("Headache Status: No Headache");
            }


            if(lastDateString == allEvents[i].date && previousSegments[1] == allEvents[i].segment)
            {

                $("#evening-segment").show();

                if($("#evening-time-block, #evening-event-block").text() == ""){
                    $("#evening-time-block").append(allEvents[i].time.slice(0, 2) + ":00 PM");
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("Temp: " + allEvents[i].environment.temp);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Rel Hum: " + allEvents[i].environment.hum);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Wind: " + allEvents[i].environment.wind);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Pressure: " + allEvents[i].environment.press);
                    $("#evening-event-block").append("<br />");
                    $("#evening-time-block, #evening-event-block").append("<hr>");

                    if(allEvents[i].item == "Headache Started")
                    {
                        $("#evening-time-block").append("<span></span>");
                        $("#evening-time-block span").append(allEvents[i].time).css("font-weight", "bold");
                        $("#evening-time-block").append("<br />");
                        $("#evening-event-block").append("<span></span>");
                        $("#evening-event-block span").append(allEvents[i].item).css("font-weight", "bold");
                        $("#evening-event-block").append("<br />");
                        if (i < allEvents.length - 1)
                            if (previousSegments[1] == allEvents[i + 1].segment && lastDateString == allEvents[i + 1].date)
                                $("#evening-time-block, #evening-event-block").append("<hr>");

                        $("#evening-headache-status").text("Headache Ended: " + lastDateString);
                        flag = 1;
                    }
                    else {
                            $("#evening-time-block").append(allEvents[i].time);
                            $("#evening-time-block").append("<br />");
                            $("#evening-event-block").append(allEvents[i].item);
                            $("#evening-event-block").append("<br />");
                            if (i < allEvents.length - 1)
                                if (previousSegments[1] == allEvents[i + 1].segment && lastDateString == allEvents[i + 1].date)
                                    $("#evening-time-block, #evening-event-block").append("<hr>");
                        }
                }
                else {
                    $("#evening-time-block").append(allEvents[i].time);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append(allEvents[i].item);
                    $("#evening-event-block").append("<br />");
                    if(i < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[i+1].segment && lastDateString == allEvents[i+1].date)
                            $("#evening-time-block, #evening-event-block").append("<hr>");
                }

                if(flag != 1)
                    $("#evening-headache-status").text("Headache Status: No Headache");
            }
        }

    }
    else if (headacheStart.getHours() >= 12 && headacheStart.getHours() <= 17) {
        headacheTimeSegment = "Afternoon";
        previousSegments.push("Morning", "Late Night");
        $("#morning-segment").append("<br />");
        $("#afternoon-segment").append("<br />");
        $("#evening-segment").hide();
        $("#evening-segment").append("<br />");
        $("#late-segment").append("<br />");

        $("#morning-segment").insertAfter("#late-segment");
        $("#afternoon-segment").insertAfter("#morning-segment");

        var dateString = headacheStart.getMonth()+1 + "/" + headacheStart.getDate() + "/" + headacheStart.getFullYear();
        $("#afternoon-time-segment h4").text(dateString + ": " + headacheTimeSegment).show();
        $("#morning-time-segment h4").text(dateString + ": " + previousSegments[0]).show();
        $("#late-time-segment h4").text(dateString + ": " + previousSegments[1]).show();

        for (var j = 0; j < allEvents.length; j++)
        {
            //&& (headacheEnd > new Date(allEvents[i].date + " " + allEvents[i].time))
            if(startDateString == allEvents[j].date && headacheTimeSegment == allEvents[j].segment)
            {
                $("#afternoon-segment").show();

                //alert(allEvents[j].environment.temp + " " + j);

                if(allEvents[j].item == "Headache Started") {
                    $("#afternoon-time-block").append(allEvents[j].time.slice(0,2)+":00 PM");
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("Temp: " + allEvents[j].environment.temp);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Rel Hum: " + allEvents[j].environment.hum);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Wind: " + allEvents[j].environment.wind);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Pressure: " + allEvents[j].environment.press);
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-time-block, #afternoon-event-block").append("<hr>");

                    $("#afternoon-time-block").append("<span></span>");
                    $("#afternoon-time-block span").append(allEvents[j].time).css("font-weight", "bold");
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<span></span>");
                    $("#afternoon-event-block span").append(allEvents[j].item).css("font-weight", "bold");
                    $("#afternoon-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");

                }
                else
                {
                    $("#afternoon-time-block").append(allEvents[j].time);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append(allEvents[j].item);
                    $("#afternoon-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");

                }

               // if((new Date(endDateString)).getHours() >= 12 && (new Date(endDateString)).getHours() <= 17)
                    $("#afternoon-headache-status").text("Headache Ended: " + endDateString);
               // else
                 //   $("#afternoon-headache-status").text("Headache Status: Ongoing");


            }

            if(startDateString == allEvents[j].date && previousSegments[0] == allEvents[j].segment)
            {
                $("#morning-segment").show();

                if($("#morning-time-block, #morning-event-block").text() == "") {
                    $("#morning-time-block").append(allEvents[j].time.slice(0, 2) + ":00 AM");
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("Temp: " + allEvents[j].environment.temp);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Rel Hum: " + allEvents[j].environment.hum);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Wind: " + allEvents[j].environment.wind);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Pressure: " + allEvents[j].environment.press);
                    $("#morning-event-block").append("<br />");
                    $("#morning-time-block, #morning-event-block").append("<hr>");

                    $("#morning-time-block").append(allEvents[j].time);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append(allEvents[j].item);
                    $("#morning-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");
                }
                else {
                    $("#morning-time-block").append(allEvents[j].time);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append(allEvents[j].item);
                    $("#morning-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");

                }

                $("#morning-headache-status").text("Headache Status: No Headache");
            }

            if(startDateString == allEvents[j].date && previousSegments[1] == allEvents[j].segment)
            {
                $("#late-segment").show()

                if($("#late-time-block, #late-event-block").text() == "")
                {
                    $("#late-time-block").append(allEvents[j].time.slice(0, 2) + ":00 AM");
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("Temp: " + allEvents[j].environment.temp);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Rel Hum: " + allEvents[j].environment.hum);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Wind: " + allEvents[j].environment.wind);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Pressure: " + allEvents[j].environment.press);
                    $("#late-event-block").append("<br />");
                    $("#late-time-block, #late-event-block").append("<hr>");

                    $("#late-time-block").append(allEvents[j].time);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append(allEvents[j].item);
                    $("#late-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#late-time-block, #late-event-block").append("<hr>");
                }
                else {
                    $("#late-time-block").append(allEvents[j].time);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append(allEvents[j].item);
                    $("#late-event-block").append("<br />");
                    if(j < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[j+1].segment && startDateString == allEvents[j+1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");

                }

                $("#late-headache-status").text("Headache Status: No Headache");
            }

        }

    }
    else if (headacheStart.getHours() >= 18 && headacheStart.getHours() <= 23) {
        headacheTimeSegment = "Evening";
        previousSegments.push("Afternoon", "Morning");
        $("#morning-segment").append("<br />");
        $("#afternoon-segment").append("<br />");
        $("#evening-segment").append("<br />");
        $("#late-segment").hide();
        $("#late-segment").append("<br />");

        $("#afternoon-segment").insertAfter("#morning-segment");
        $("#evening-segment").insertAfter("#afternoon-segment");

        var dateString = headacheStart.getMonth()+1 + "/" + headacheStart.getDate() + "/" + headacheStart.getFullYear();
        $("#evening-time-segment h4").text(dateString + ": " + headacheTimeSegment).show();
        $("#afternoon-time-segment h4").text(dateString + ": " + previousSegments[0]).show();
        $("#morning-time-segment h4").text(dateString + ": " + previousSegments[1]).show();

        for (var k = 0; k < allEvents.length; k++)
        {
            //&& (headacheEnd > new Date(allEvents[i].date + " " + allEvents[i].time))
            if(startDateString == allEvents[k].date && headacheTimeSegment == allEvents[k].segment)
            {
                $("#evening-segment").show();

                if(allEvents[k].item == "Headache Started") {
                    $("#evening-time-block").append(allEvents[k].time.slice(0,2)+":00 PM");
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("Temp: " + allEvents[k].environment.temp);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Rel Hum: " + allEvents[k].environment.hum);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Wind: " + allEvents[k].environment.wind);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Pressure: " + allEvents[k].environment.press);
                    $("#evening-event-block").append("<br />");
                    $("#evening-time-block, #evening-event-block").append("<hr>");

                    $("#evening-time-block").append("<span></span>");
                    $("#evening-time-block span").append(allEvents[k].time).css("font-weight", "bold");
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<span></span>");
                    $("#evening-event-block span").append(allEvents[k].item).css("font-weight", "bold");
                    $("#evening-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#evening-time-block, #evening-event-block").append("<hr>");

                }
                else{
                    $("#evening-time-block").append(allEvents[k].time);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append(allEvents[k].item);
                    $("#evening-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#evening-time-block, #evening-event-block").append("<hr>");
                }

              //  if((new Date(endDateString)).getHours() >= 18 && (new Date(endDateString)).getHours() <= 23)
                    $("#evening-headache-status").text("Headache Ended: " + endDateString);
              //  else
              //      $("#evening-headache-status").text("Headache Status: Ongoing");
            }

            if(startDateString == allEvents[k].date && previousSegments[0] == allEvents[k].segment)
            {
                $("#afternoon-segment").show();

                if($("#afternoon-time-block, #afternoon-event-block").text() == "") {
                    $("#afternoon-time-block").append(allEvents[k].time.slice(0, 2) + ":00 PM");
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("Temp: " + allEvents[k].environment.temp);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Rel Hum: " + allEvents[k].environment.hum);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Wind: " + allEvents[k].environment.wind);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Pressure: " + allEvents[k].environment.press);
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-time-block, #afternoon-event-block").append("<hr>");

                    $("#afternoon-time-block").append(allEvents[k].time);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append(allEvents[k].item);
                    $("#afternoon-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");
                }
                else {
                    $("#afternoon-time-block").append(allEvents[k].time);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append(allEvents[k].item);
                    $("#afternoon-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");
                }

                $("#afternoon-headache-status").text("Headache Status: No Headache");
            }

            if(startDateString == allEvents[k].date && previousSegments[1] == allEvents[k].segment)
            {
                $("#morning-segment").show();

                if($("#morning-time-block, #morning-event-block").text() == "")
                {
                    $("#morning-time-block").append(allEvents[k].time.slice(0, 2) + ":00 AM");
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("Temp: " + allEvents[k].environment.temp);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Rel Hum: " + allEvents[k].environment.hum);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Wind: " + allEvents[k].environment.wind);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append("<br />");
                    $("#morning-event-block").append("Pressure: " + allEvents[k].environment.press);
                    $("#morning-event-block").append("<br />");
                    $("#morning-time-block, #morning-event-block").append("<hr>");

                    $("#morning-time-block").append(allEvents[k].time);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append(allEvents[k].item);
                    $("#morning-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");
                }
                else {
                    $("#morning-time-block").append(allEvents[k].time);
                    $("#morning-time-block").append("<br />");
                    $("#morning-event-block").append(allEvents[k].item);
                    $("#morning-event-block").append("<br />");
                    if(k < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[k+1].segment && startDateString == allEvents[k+1].date)
                            $("#morning-time-block, #morning-event-block").append("<hr>");
                }

                $("#morning-headache-status").text("Headache Status: No Headache");
            }

        }


    }
    else {
        headacheTimeSegment = "Late Night";
        previousSegments.push("Evening", "Afternoon");
        $("#morning-segment").hide();
        $("#morning-segment").append("<br />");
        $("#afternoon-segment").append("<br />");
        $("#evening-segment").append("<br />");
        $("#late-segment").append("<br />");

        $("#evening-segment").insertAfter("#afternoon-segment");
        $("#late-segment").insertAfter("#evening-segment");

        var previousDate = new Date(startDateString);
        previousDate.setDate(previousDate.getDate()-1);
        var yesterdayDate = previousDate.getDate();

        if(yesterdayDate < 10)
            yesterdayDate = "0" + yesterdayDate;

        var prevDateString = month + "/" + yesterdayDate + "/" + year;

        var dateString = headacheStart.getMonth()+1 + "/" + headacheStart.getDate() + "/" + headacheStart.getFullYear();
        $("#late-time-segment h4").text(dateString + ": " + headacheTimeSegment).show();
        $("#evening-time-segment h4").text((previousDate.getMonth()+1 + "/" + previousDate.getDate() + "/" + previousDate.getFullYear()) + ": " + previousSegments[0]).show();
        $("#afternoon-time-segment h4").text((previousDate.getMonth()+1 + "/" + previousDate.getDate() + "/" + previousDate.getFullYear()) + ": " + previousSegments[1]).show();

        for (var l = 0; l < allEvents.length; l++)
        {
            //&& (headacheEnd > new Date(allEvents[i].date + " " + allEvents[i].time))
            if(startDateString == allEvents[l].date && headacheTimeSegment == allEvents[l].segment)
            {
                $("#late-segment").show();
                if(allEvents[l].item == "Headache Started") {
                    $("#late-time-block").append(allEvents[l].time.slice(0,2)+":00 AM");
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("Temp: " + allEvents[l].environment.temp);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Rel Hum: " + allEvents[l].environment.hum);
                    $("#late-event-block").append("<br />");
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("Wind: " + allEvents[l].environment.wind);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<br />");
                    $("#late-event-block").append("Pressure: " + allEvents[l].environment.press);
                    //$("#late-event-block").append("<br />");
                    $("#late-time-block, #late-event-block").append("<hr>");

                    $("#late-time-block").append("<span></span>");
                    $("#late-time-block span").append(allEvents[l].time).css("font-weight", "bold");
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append("<span></span>");
                    $("#late-event-block span").append(allEvents[l].item).css("font-weight", "bold");
                    $("#late-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[l+1].segment && startDateString == allEvents[l+1].date)
                            $("#late-time-block, #late-event-block").append("<hr>");

                }
                else
                {
                    $("#late-time-block").append(allEvents[l].time);
                    $("#late-time-block").append("<br />");
                    $("#late-event-block").append(allEvents[l].item);
                    $("#late-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(headacheTimeSegment == allEvents[l+1].segment && startDateString == allEvents[l+1].date)
                            $("#late-time-block, #late-event-block").append("<hr>");
                }

               // if((new Date(endDateString)).getHours() >= 0 && (new Date(endDateString)).getHours() <= 3)
                    $("#late-headache-status").text("Headache Ended: " + endDateString);
               // else
               //     $("#late-headache-status").text("Headache Status: Ongoing");
            }

            if(prevDateString == allEvents[l].date && previousSegments[0] == allEvents[l].segment)
            {
                $("#evening-segment").show();

                if($("#evening-time-block, #evening-event-block").text() == "") {
                    $("#evening-time-block").append(allEvents[l].time.slice(0, 2) + ":00 PM");
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("Temp: " + allEvents[l].environment.temp);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Rel Hum: " + allEvents[l].environment.hum);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Wind: " + allEvents[l].environment.wind);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append("<br />");
                    $("#evening-event-block").append("Pressure: " + allEvents[l].environment.press);
                    $("#evening-event-block").append("<br />");
                    $("#evening-time-block, #evening-event-block").append("<hr>");

                    $("#evening-time-block").append(allEvents[l].time);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append(allEvents[l].item);
                    $("#evening-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[l+1].segment && (new Date(prevDateString) == new Date(allEvents[l+1].date)))
                            $("#evening-time-block, #evening-event-block").append("<hr>");
                }
                else {
                    $("#evening-time-block").append(allEvents[l].time);
                    $("#evening-time-block").append("<br />");
                    $("#evening-event-block").append(allEvents[l].item);
                    $("#evening-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(previousSegments[0] == allEvents[l+1].segment && (new Date(prevDateString) == new Date(allEvents[l+1].date)))
                            $("#evening-time-block, #evening-event-block").append("<hr>");
                }

                $("#evening-headache-status").text("Headache Status: No Headache");
            }

            if(prevDateString == allEvents[l].date && previousSegments[1] == allEvents[l].segment)
            {
                $("#afternoon-segment").show();

                if($("#afternoon-time-block, #afternoon-event-block").text() == "")
                {
                    $("#afternoon-time-block").append(allEvents[l].time.slice(0, 2) + ":00 PM");
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("Temp: " + allEvents[l].environment.temp);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Rel Hum: " + allEvents[l].environment.hum);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Wind: " + allEvents[l].environment.wind);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-event-block").append("Pressure: " + allEvents[l].environment.press);
                    $("#afternoon-event-block").append("<br />");
                    $("#afternoon-time-block, #afternoon-event-block").append("<hr>");

                    $("#afternoon-time-block").append(allEvents[l].time);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append(allEvents[l].item);
                    $("#afternoon-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[l+1].segment && (new Date(prevDateString) == new Date(allEvents[l+1].date)))
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");
                }
                else {
                    $("#afternoon-time-block").append(allEvents[l].time);
                    $("#afternoon-time-block").append("<br />");
                    $("#afternoon-event-block").append(allEvents[l].item);
                    $("#afternoon-event-block").append("<br />");
                    if(l < allEvents.length - 1)
                        if(previousSegments[1] == allEvents[l+1].segment && (new Date(prevDateString) == new Date(allEvents[l+1].date)))
                            $("#afternoon-time-block, #afternoon-event-block").append("<hr>");
                }

                $("#afternoon-headache-status").text("Headache Status: No Headache");
            }

        }

    }

}


function getWeatherData(month, date, time){

    $.mobile.loading("show");

    if(month < 10)
        month = "0" + month;

    if(date < 10)
        date = "0" + date;

    var fetching = {
        loaded_weather : false,
        data_weather : null
    };

    // Function executed when each of the four AJAX requests returns, regardless
    // of whether they succeeded or not.  Passed to this is the type of entity
    // completed and the response from the server, or null if the call failed.
    var completeLoad = function(inType, inResponse) {

        // Record that this entity type was loaded and the server's response.
        fetching["loaded_" + inType] = true;
        fetching["data_" + inType] = inResponse;

        //alert(JSON.stringify(inResponse));
        // When all four have completed then it's time to get to work.
        if (fetching.loaded_weather) {

            // If we got back data for all four entity types then we're good to go.
            if (fetching.data_weather) {

                var types = [ "weather" ];
                for (var i = 0; i < types.length; i++) {
                    var typ = types[i];
                    var dat = fetching["data_" + typ];
                    var len = dat.length;
                    var lst = window.localStorage;
                    for (var j = 0; j < len; j++) {
                        var obj = dat[j];
                        lst.setItem(typ + "_" + obj._id, JSON.stringify(obj));
                    }
                }
            }
        }
        else{

            // One or more entities were not fetched, which we take to mean there's
            // a connectivity problem, so let the user know what's up.  Whatever
            // data is in localStorage will be used for this run.
            showConnectivityMsg();
        }

        // To conserve memory, erase the temporary load structure.
        fetching = null;
        weatherObject.datetime = JSON.stringify(inResponse[0]["DateTime"]);
        weatherObject.year = JSON.stringify(inResponse[0]["Year"]);
        weatherObject.month = JSON.stringify(inResponse[0]["Month"]);
        weatherObject.date = JSON.stringify(inResponse[0]["Day"])
        weatherObject.time = JSON.stringify(inResponse[0]["Time"])
        weatherObject.temperature = JSON.stringify(inResponse[0]["Temp"]) + " Deg Cel";
        weatherObject.wind = JSON.stringify(inResponse[0]["WindSpd"]) + " km/h";
        weatherObject.pressure = JSON.stringify(inResponse[0]["StnPress"]) + " kPa";
        weatherObject.humidity = JSON.stringify(inResponse[0]["RelHum"]) + "%";


        // Unmask screen and we're done here.
        $.mobile.loading("hide");
    }

    var httpMethod = "get";

    $.ajax({ url : ajaxURLPrefix + "/weather/" + month + date + time,  type: httpMethod, async: false})
        .done(function(inResponse) { completeLoad("weather", inResponse);})
        .fail(function(inXHR, inStatus) { completeLoad("weather", null);});

}

/*
function checkTriggerMenu(){

    var numberOfTriggers =

    $("#flip-sleep").on("change", function(){
        if($("#flip-sleep").val() == "off"){
            $('div[data-role="navbar"] ul li a#sleepduration').hide();
        }
        else {
            //$("#flip-sleep").val("NG").flipswitch("refresh");
            $('div[data-role="navbar"] ul li a#sleepduration').show();
        }
    });
}

function showSelectedTriggerPage(){
        $('#sleeprecord').hide();
        $('#exerciserecord').hide();
        $('#stressrecord').hide();
        $('#coffeerecord').hide();

        $('div[data-role="navbar"] ul li a#sleepduration').on('click', function () {
            //alert("div E clicked");
            $('#sleeprecord').show();
            $('#exerciserecord').hide();
            $('#stressrecord').hide();
            $('#coffeerecord').hide();

        });

        $('div[data-role="navbar"] ul li a#exercisework').on('click', function () {
            //alert("div E clicked");
            $('#sleeprecord').hide();
            $('#exerciserecord').show();
            $('#stressrecord').hide();
            $('#coffeerecord').hide();

        });

        $('div[data-role="navbar"] ul li a#stresslevel').on('click', function () {
            //alert("div E clicked");
            $('#sleeprecord').hide();
            $('#exerciserecord').hide();
            $('#stressrecord').show();
            $('#coffeerecord').hide();

        });

        $('div[data-role="navbar"] ul li a#coffeeintake').on('click', function () {
            //alert("div E clicked");
            $('#sleeprecord').hide();
            $('#exerciserecord').hide();
            $('#stressrecord').hide();
            $('#coffeerecord').show();

        });
}*/
