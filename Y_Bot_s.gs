//run in 23-24
function setTriggersAM() {
  removeTriggers();
  var time = new Date();
  time.setDate(time.getDate() + 1);
  for (var i = 0; i < 12; i++) {
    time.setHours(i);
    time.setMinutes(0);
    ScriptApp.newTrigger('tweet').timeBased().at(time).create();
  }
}

//run in 11-12
function setTriggersPM() {
  removeTriggers();
  var time = new Date()
  for (var i = 12; i < 24; i++) {
    time.setHours(i);
    time.setMinutes(0);
    ScriptApp.newTrigger('tweet').timeBased().at(time).create();
  }
}

//Func for delete a trigger
function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "tweet") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

//Variables for authentication
var apikey = 'APIキー';
var apisecret='秘密鍵';
var tokenurl = "https://api.twitter.com/oauth/access_token";
var reqtoken = "https://api.twitter.com/oauth/request_token";
var authurl = "https://api.twitter.com/oauth/authorize"; 
var endpoint2 = "https://api.twitter.com/2/tweets";  //v2 endpoint
var endpoint = "https://api.twitter.com/2/tweets/search/recent"
var appname = "アプリ名";

//Func for authentication check
function checkOAuth(serviceName) {
  return OAuth1.createService(serviceName)
    .setAccessTokenUrl(tokenurl)
    .setRequestTokenUrl(reqtoken)
    .setAuthorizationUrl(authurl)
    .setConsumerKey(apikey)
    .setConsumerSecret(apisecret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties());
}

//Authentication callback
function authCallback(request) {
  var service = checkOAuth(request.parameter.serviceName);
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('認証が正常に終了しました');
  } else {
    return HtmlService.createHtmlOutput('認証がキャンセルされました');
  }
}

function pickMessage() {
  var s = getTableFromSheet();
  var txt
  var d = new Date();
  var h = d.getHours();
  var y = d.getDay();

  var lst = [26,26,30,16,29,5,9,24,3,5,24,13,29,13,13,22,3,9,20,20,20,7,16,1,22,10,16,17,7,27];
  var random = weightedPick(lst);
  // if(y == 0 || y == 6){
  //   if(h == 7 || h == 8 || h == 9 || h == 17 || h == 18 || h == 19){
  //     txt = s.getRange(random+33,h+2).getValue();
  //   }
  //   else{
  //     txt = s.getRange(random+2,h+2).getValue();
  //   }
  // }
  // else{
  txt = s.getRange(random+2,h+2).getValue();
  // }
  Logger.log(txt);
  return txt;
}

function getTableFromSheet() {
  const SHEET_ID = "シートID";
  const SHEET_NAME = "base";

  var spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadSheet.getSheetByName(SHEET_NAME);
  return sheet
}

function weightedPick(a){
  var totalWeight = 0;
  var pick = 0;
  for(var i = 0; i < 30; i++) {
    totalWeight += a[i];
  }
  var rnd = Math.random()*totalWeight
  for(var i = 0; i < 30; i++) {
    if(rnd < a[i]) {
      pick = i;
      break;
    }
    rnd -= a[i];
  }
  return pick;
}

function selfIntroduction(){
  var s = getTableFromSheet();
  var txt;
  var lst = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
  var random = weightedPick(lst);
  txt = s.getRange(random+2,26).getValue();

  return txt;
}

function selfIntroductionTweet(){
  //token verification
  var service = checkOAuth(appname);
  var picked = selfIntroduction();
  Logger.log(picked)

  //Message
  var message = {
    text: picked
  }

  //Request Options
  var options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify(message)
  }

  //Request execution
  var response = JSON.parse(service.fetch(endpoint2, options));

  //Request Results
  Logger.log(response)
}

//Tweet
function tweet(){
    //token verification
    var lock = LockService.getScriptLock();
    var service = checkOAuth(appname);
    var picked = pickMessage();

    if (lock.tryLock(10)) {
      //Message
      var message = {
        text: picked
      }

      //Request Options
      var options = {
        "method": "post",
        "muteHttpExceptions" : true,
        'contentType': 'application/json',
        'payload': JSON.stringify(message)
      }

      //Request execution
      var response = JSON.parse(service.fetch(endpoint2, options));

      //Request Results
      Logger.log(response)
      lock.releaseLock();
    }
 
}
// query_params = {'query': 'from:hoge', 'tweet.fields': 'author_id', 'max_results': 10}
// function tst(){
//   var service = checkOAuth(appname);
//   var d = new Date();
//   var h = d.getHours();
//   var url = "https://api.twitter.com/2/tweets/search/recent";
//   var options = {
//     "method": "get",
//     "muteHttpExceptions" : true,
//     'query': 'from:hoge', 
//     'max_results': 15,
//     "headers": {
//       "authorization": "Bearer [ここにBearer ID]",
//     },
//   };
//   var response = JSON.parse(service.fetch(url, options));
//   Logger.log(response);  
//   Logger.log(d);
// }