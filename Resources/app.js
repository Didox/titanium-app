//Flurry
// var Flurry = require('ti.flurry');
// var flurryAPIKey = (Ti.Platform.osname == "iphone") ? 'Q9DNLYYUARWVE88PDYRX' : 'FX2XGFN2C4JF4CHYM2XR';
// Flurry.initialize(flurryAPIKey);

// Notifications
if (Ti.Platform.osname == "iphone"){
  Titanium.Network.registerForPushNotifications({
    types:[
    Titanium.Network.NOTIFICATION_TYPE_BADGE,
    Titanium.Network.NOTIFICATION_TYPE_ALERT,
    Titanium.Network.NOTIFICATION_TYPE_SOUND
    ],
    success: successCallback,
    error: errorCallback,
    callback: messageCallback
  });

  function successCallback(e) {
    var request = Titanium.Network.createHTTPClient({
       onload: function(e) {
         if (request.status != 200 && request.status != 201) {
           request.onerror(e);
           return;
          }
       },
       onerror: function(e) {
         Ti.API.info("Push Notifications registration with Parse failed. Error: " + e.error);
       }
    });

    var params = {
      'deviceType': 'ios',
      'deviceToken': e.deviceToken,
      'channels': ['']
    };

   // Register device token with Parse
   request.open('POST', 'https://api.parse.com/1/installations', true);
   request.setRequestHeader('X-Parse-Application-Id', '8IXHdO6ZYggCxTUZURo6aTdUFqUe30DOqbZOpLLm');
   request.setRequestHeader('X-Parse-REST-API-Key', 'XouOhwa7l2XWsDak9QzjEMdaDKwIvQMnPrkHK8Wz');
   request.setRequestHeader('Content-Type', 'application/json');
   request.send(JSON.stringify(params));
 }

  // error callBack
  function errorCallback(e) {
   Ti.API.info("Error during registration: " + e.error);
 }

  // message callBack
  function messageCallback(e) {
  //// this if we want to show the notification when the app is open
  //  var message;
  //
  //  if (e['data']['aps'] != undefined) {
  //    if (e['data']['aps']['alert'] != undefined) {
  //      if (e['data']['aps']['alert']['body'] != undefined) {
  //        message = e['data']['aps']['alert']['body'];
  //      } else {
  //        message = e['data']['aps']['alert'];
  //      }
  //    } else {
  //      message = 'No Alert content';
  //    }
  //  } else {
  //    message = 'No APS content';
  //  }
  //  alert(message);
}
} else {
  var Cloud = require('ti.cloud');
  var CloudPush = require('ti.cloudpush');

  CloudPush.debug = true;
  CloudPush.showTrayNotificationsWhenFocused = true;
  CloudPush.focusAppOnPush = false;

  var deviceToken = null;

  // Initialize the module
  CloudPush.retrieveDeviceToken({
    success: deviceTokenSuccess,
    error: deviceTokenError
  });

  function loginCloudUser(){
    Cloud.Users.login({
      login: 'test@example.com',
      password: 'fuinha'
    }, function (e) {
      if (e.success) {
        Cloud.PushNotifications.subscribe({
          channel: 'alert',
          device_token: deviceToken,
          type: 'gcm'
        }, function (e) {
          if (e.success) {
            Ti.API.info('Subscribed for Push Notification!');
          } else {
            Ti.API.info('Subscribe error:' + ((e.error && e.message) || JSON.stringify(e)));
          }
        });

      } else {
        Ti.API.info('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
      }
    });
  }
  // Save the device token for subsequent API calls
  function deviceTokenSuccess(e) {
    deviceToken = e.deviceToken;
    loginCloudUser();
  }
  function deviceTokenError(e) {
    Ti.API.info('Failed to register for push notifications! ' + e.error);
  }
  // Process incoming push notifications
  CloudPush.addEventListener('callback', function (evt) {
    Ti.API.info(evt.payload);
  });
  // Triggered when the push notifications is in the tray when the app is not running
  CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
    Ti.API.info('Tray Click Launched App (app was not running)');
  });
  // Triggered when the push notifications is in the tray when the app is running
  CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
    Ti.API.info('Tray Click Focused App (app was already running)');
  });
}
// END NOTIFICATIONS

var confirmGPS = "";
var conexao = true;
// var eventExecute = (Ti.Platform.osname == "iphone" ? "load" : "beforeload");

function createWindow(exitOnClose){
  var winConfig = "";
  if (Ti.Platform.osname == "iphone"){
    winConfig = Ti.UI.createWindow({
      title: 'Veja São Paulo',
      selectedBackgroundColor: '#000',
      statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
      exitOnClose: exitOnClose,
      fullscreen: false,
      modal: true,
      navBarHidden: true,
      statusBarHidden: true,
      backgroundColor: '#333'
    });
  } else {
    winConfig = Ti.UI.createWindow({
      title: 'Veja São Paulo',
      selectedBackgroundColor: '#000',
      exitOnClose: exitOnClose,
      fullscreen: false,
      modal: true,
      navBarHidden: true,
      statusBarHidden: true,
      backgroundColor: '#333'
    });
  };

  return winConfig;
}

var getCurrentPosition = function(webViewParam){
  Ti.Geolocation.getCurrentPosition(function(e){
    if (e.error){
      if(!conexao) return;
      conexao = false;
      webViewParam.evalJS("conectado = false");
      var confirm = Titanium.UI.createAlertDialog({
        message: 'Sem acesso ao serviço de localização.\nVerifique se está ativado.',
        buttonNames: ['OK']
      });
      if (!confirmGPS){
        confirm.show();
        confirm.addEventListener('click', function(e){
          if(e.index === 0){
            try{
              confirmGPS = "true";
            }
            catch(err){
              alert(err.message);
            }
          }
        });
      }
      return;
    }
    conexao = true;
    webViewParam.evalJS("conectado = true");
    var longitude = e.coords.longitude;
    var latitude = e.coords.latitude;
    var altitude = e.coords.altitude;
    var heading = e.coords.heading;
    var accuracy = e.coords.accuracy;
    var speed = e.coords.speed;
    var timestamp = e.coords.timestamp;
    var altitudeAccuracy = e.coords.altitudeAccuracy;
    webViewParam.evalJS("app.jsonLocation('" + latitude + "','" + longitude + "')");
  });
}

var win = createWindow(true);

win.addEventListener('android:back',function(e){
  var dialog = Ti.UI.createAlertDialog({
    buttonNames: ['Sim', 'Não'],
    message: 'Você sairá do aplicativo. Deseja continuar?'
  });
  dialog.addEventListener('click', function(e){
    if (e.index === 0){
      win.close();
      Titanium.Android.currentActivity.finish();
    }
  });
  dialog.show();
});

var webview = Ti.UI.createWebView({
  title: 'Veja São Paulo',
  url: 'index.html',
  willHandleTouches:false,
  enableZoomControls:false,
  backgroundColor: '#333'
});

webview.addEventListener('load', function() {
  var url = webview.getUrl();
  if(url.indexOf("http://") != -1){
    webview.goBack();
    Ti.Platform.openURL(url);
  }
});

if (Ti.Platform.osname == 'android'){
  Ti.Gesture.addEventListener('orientationchange', function(e) {
    Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
  });
}

webview.addEventListener('beforeload', function(){
  getCurrentPosition(webview);
});

win.add(webview);
win.open();

Ti.App.addEventListener('openLetsPark', function(e) {
  var geo = e.geo;
  var url = 'letspark://letsparkApp/map?' + geo;

  if (Ti.Android){
    try {
      Ti.API.info('Trying to Launch via Intent');
      var intent = Ti.Android.createIntent({
          action: Ti.Android.ACTION_VIEW,
          data: url

      });
      Ti.Android.currentActivity.startActivity(intent);
    } catch (e){
      instalarLetsPark();
    }
  } else {
    if (Ti.Platform.canOpenURL(url)){
      openURL(url);
    } else {
      instalarLetsPark();
    }
  }
});

var instalarLetsPark = function() {
  var confirm = Titanium.UI.createAlertDialog({
    message: "Para encontrar uma vaga, você precisa ter o aplicativo LetsPark. Quer fazer o download?",
    buttonNames: ['Ok', 'Agora não']
  });
  confirm.show();
  confirm.addEventListener('click', function(e){
    if(e.index === 0) {
      if (Ti.Android)
        Ti.Platform.openURL('https://play.google.com/store/apps/details?id=br.com.letspark.app&referrer=utm_source%3Dveja%26utm_medium%3Dapp');
      else
        Ti.Platform.openURL('https://itunes.apple.com/br/app/lets-park/id695606122?mt=8');
    }
  });
};

var openURL = function(url, message) {
  if(message == undefined) message = 'Você sairá do aplicativo. Deseja continuar?';
  var confirm = Titanium.UI.createAlertDialog({
    message: message,
    buttonNames: ['Sim', 'Não']
  });
  confirm.show();
  confirm.addEventListener('click', function(e){
    if(e.index === 0){
      try{
        Ti.Platform.openURL(url);
      }
      catch(err){
        alert(err.message);
      }
    }
  });
}

Ti.App.addEventListener('openUrl', function(e) {
  var url = e.url;
  var message = e.message;
  openURL(url, message);
});

Ti.App.addEventListener('openWindow', function(e) {
  try{
    openWindow(e.url);
  }
  catch(e){
    alert(e.message);
  }
});

Ti.App.addEventListener('closeWindow', function(e) {
  try{
    closeWindow();
  }
  catch(e){
    alert(e.message);
  }
});

Ti.App.addEventListener('backToHome', function(e) {
  try{
    backToHome();
  }
  catch(e){
    alert(e.message);
  }
});

Ti.App.addEventListener('openVideo', function(e) {
  try{
    playVideo(e.url);
  }
  catch(e){
    alert(e.message);
  }
});

Ti.App.addEventListener('networkOffAlert', function(e) {
  try{
    networkOffAlert();
  }
  catch(e){
    alert(e.message);
  }
});

// Ti.App.addEventListener('trackEvent', function(e) {
//   Flurry.logEvent(e.action,
//     { category: e.category,
//       label: e.label,
//       value: e.value
//     }
//   );
// });

var networkOffAlert = function(){
  if(!Titanium.Network.online){
    if(!conexao) return;
    conexao = false;
    webview.evalJS("conectado = false");
    Ti.UI.createAlertDialog({
      message: 'Você está sem conexão de internet',
      ok: 'Ok',
      title: 'Sem conexão'
    }).show();
    return;
  }
  conexao = true;
  webview.evalJS("conectado = true");
};

Ti.App.addEventListener('openMap', function(e) {
  var longitude = e.longitude,
  latitude = e.latitude,
  estabelecimento = e.estabelecimento;
  var confirm = Titanium.UI.createAlertDialog({
    message: 'Você sairá do aplicativo. Deseja continuar?',
    buttonNames: ['Sim', 'Não']
  });
  confirm.show();
  confirm.addEventListener('click', function(e){
    if(e.index === 0) {
      getLocation(function(l){
        var myLocation = "0,0";
        if(!l.error){
          myLocation = l.coords.longitude+','+l.coords.latitude;
        }

        var url = "http://maps.google.com?daddr="+latitude+","+longitude+"&saddr="+myLocation;
        if (Ti.Android) {
          url = "geo:"+myLocation+"?q="+latitude+","+longitude;
        } else {
          url = "maps:q="+latitude+","+longitude;//+"&saddr=Current%20Location";
        }

        Ti.Platform.openURL(url);
      });
    }
  });
});

var currentWindow = [];
var closeWindow = function(){
  if(currentWindow.length > 0 != null){
    var winClose = currentWindow.pop();
    if(winClose != undefined && winClose != null){
      winClose.close();
    }
  }
}

var backToHome = function(){
  while(currentWindow.length > 0){
    var winClose = currentWindow.pop();
    if(winClose != undefined && winClose != null){
      setTimeout(function(){
        winClose.close();
      },200);
    }
  }
}

var webViews = [];

var openWindow = function(url){
  try{
    var vidWin = createWindow(false);
    vidWin.addEventListener('android:back',function(e){ vidWin.close(); });
    var urlWebView = (Ti.Platform.osname === "iphone" ? 'blank.html' : url); // fix bug iphone
    var webviewInternal = Ti.UI.createWebView({
      title: 'Veja São Paulo',
      url: urlWebView,
      willHandleTouches:false,
      enableZoomControls:false,
      backgroundColor: '#333'
    });

    webviewInternal.addEventListener('load', function() {
      var internaUrl = webviewInternal.getUrl();

      if(internaUrl.indexOf("blank.html") != -1){ // fix bug iphone
        webviewInternal.evalJS('window.location.href="'+ url +'"');
      }

      if(internaUrl.indexOf("http://") != -1){
        webviewInternal.goBack();
        Ti.Platform.openURL(internaUrl);
      }
    });

    webviewInternal.addEventListener('beforeload', function(){
      getCurrentPosition(webviewInternal);
      //webview.evalJS("app.setAbrilIdParams('" + abrilIdParams + "')");
    });

    webViews.push(webviewInternal);

    vidWin.add(webviewInternal);
    vidWin.open();
    currentWindow.push(vidWin);
  }
  catch(e){
    alert(e.message);
  }
};

var playVideo = function(url){
  try{
    if(Ti.Platform.osname === "iphone" && url.indexOf("youtube") === -1){
      var closeButton = Ti.UI.createButton({
        title:"FECHAR",
        top:"0dp",
        right:"10dp",
        backgroundColor:"#fff",
        width:"70dp",
        height:"30dp",
        borderRadius:"5",
        color:"#000",
        opacity:"0.6"
      });
      closeButton.font = {fontWeight:"bold"};

      closeButton.addEventListener('click', function() {
        videoPlayer.hide();
        videoPlayer.release();
        videoPlayer = null;
        vidWin.close();
      });

      var vidWin = Titanium.UI.createWindow({
        backgroundColor:'#000',
        exitOnClose: true,
        fullscreen: true,
        modal: true,
        navBarHidden: true,
        statusBarHidden: true
      });

      var videoPlayer = Titanium.Media.createVideoPlayer({
        url:url,
        autoplay:true,
        fullscreen:false,
        backgroundColor:'#000',
        mediaControlStyle:Titanium.Media.VIDEO_CONTROL_DEFAULT,
        scalingMode:Titanium.Media.VIDEO_SCALING_ASPECT_FIT
      });

      vidWin.add(videoPlayer);
      vidWin.add(closeButton);
      vidWin.open();
    }
    else{
      Ti.Platform.openURL(url);
    }
  }
  catch(e){
    alert(e.message);
  }
};

var getLocation = function(functionCallBack) {
  Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
  Titanium.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
  Titanium.Geolocation.distanceFilter = 10;
  Titanium.Geolocation.getCurrentPosition(functionCallBack);
};


var urlVerify = 'http://stage.cm.vejasp.api.abril.com.br/verify/' + Ti.App.version;
var xhr = Ti.Network.createHTTPClient({
  onload: function() {
    json = JSON.parse(this.responseText);
    if (json.message.length) {
      alert(json.message);
    }
  }
});
xhr.open('GET', urlVerify);
xhr.send();

// ========================================== Read Cookie Abrilid ==========================================
var abrilIdParams = null;

Ti.App.addEventListener('openAbrilId', function(e) {
  var url = e.url;
  Ti.API.info(url);

  var abrilIdWin = createWindow(false);

  var webviewAbrilId = Ti.UI.createWebView({
    title: 'Abril ID',
    url: url,
    top:'50dp',
    willHandleTouches:false,
    enableZoomControls:false,
    backgroundColor: '#333'
  });
  var loadAbrilID = Ti.UI.createLabel({
    text: "  Carregando... ",
    color: 'white',
    font: { fontSize:'15dp', fontFamily:'Ubuntu-Bold' },
    backgroundColor: '#333',
    top: '50dp',
    left: 0,
    height:'100%',
    width: '100%',
    verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
  });
  webviewAbrilId.addEventListener('load',function(e) {
    setTimeout(function(){
      var cookie = webviewAbrilId.evalJS("document.cookie");
      if(cookie && cookie.indexOf("aapgPersonCookie") != -1){
        abrilIdParams = JSON.stringify({
          personId: webviewAbrilId.evalJS("JSON.parse($.cookie('aapgPersonCookie')).personId"),
          personName: webviewAbrilId.evalJS("JSON.parse($.cookie('aapgPersonCookie')).personName"),
          personEmail: webviewAbrilId.evalJS("JSON.parse($.cookie('aapgPersonCookie')).personEmail"),
          personAvatar: webviewAbrilId.evalJS("JSON.parse($.cookie('aapgPersonCookie')).avatar"),
        });
        webview.evalJS("app.setAbrilIdParams('" + abrilIdParams + "')");
        setTimeout(function(){
          abrilIdWin.close();
        },200);
      }
      if(url.indexOf('deslogar') != -1) {
      	Ti.Network.createHTTPClient().clearCookies("http://vejasp.abril.com.br");
      	Ti.Network.createHTTPClient().clearCookies("https://facebook.com");
      	Ti.Network.createHTTPClient().clearCookies("http://facebook.com");
        abrilIdParams = null;
        webview.evalJS("app.setAbrilIdParams(null);");
        setTimeout(function(){
          abrilIdWin.close();
        },700);
      }
    },300);
  });
  webviewAbrilId.addEventListener('beforeload',function(e) {
  	Ti.API.info('URL: ' + e.url);
  	if(e.url.indexOf('signin') == -1 && e.url.indexOf('login-app') != -1){
      abrilIdWin.add(loadAbrilID);
    }
  });
  
  var labelTopPadding = Ti.UI.createLabel({
    backgroundColor: '#db2027',
    top: 0,
    left: 0,
    height:'10dp',
    width: '100%'
  });
  
  var labelTop = Ti.UI.createLabel({
    text: "  Voltar ",
    color: 'white',
    font: { fontSize:'15dp', fontFamily:'Ubuntu-Bold' },
    backgroundColor: '#db2027',
    top: '10dp',
    left: 0,
    height:'40dp',
    width: '100%',
    backgroundPaddingTop: '20px',
    backgroundPaddingLeft: '10dp',
    verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
  });

  labelTop.addEventListener('click', function(e) {
    setTimeout(function(){
      abrilIdWin.close();
    },200);
  });

  abrilIdWin.add(webviewAbrilId);
  abrilIdWin.add(labelTopPadding);
  abrilIdWin.add(labelTop);
  abrilIdWin.open();
});

// ========================================== Read Cookie Abrilid ==========================================
