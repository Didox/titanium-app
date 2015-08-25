var app = window.app || {};

var latitude  = '0';
var longitude = '0';
app.jsonLocation = function(lat, lng){
  latitude  = lat;
  longitude = lng;
  var jsonData = '{"latitude":'+latitude+',"longitude":'+longitude+'}';
  return jsonData;
};
app.jsonLocation(latitude, longitude);

//GOOGLE ANALYTICS
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','/HTML/js/ga.js','ga');

ga('create', 'UA-26172108-9', {
  'storage': 'none'
});
app.setAbrilIdParams = function(params){
  if (params)
    localStorage['abrilId'] = params;
  else
    localStorage.removeItem('abrilId');

  app.defineAbrilIdButtonText();
};

app.getAbrilIdParams = function(){
  if (!localStorage['abrilId'])
    return null;

  return JSON.parse( localStorage['abrilId'] );
};

app.defineAbrilIdButtonText = function(){
  if(app.getAbrilIdParams()) {
    $('.login .text').text( 'logout' );
    $('.login .icon-button').addClass( 'icon-logout' )
    $('.login .icon-button').removeClass( 'icon-login' )
  } else {
    $('.login .text').text( 'login' );
    $('.login .icon-button').addClass( 'icon-login' )
    $('.login .icon-button').removeClass( 'icon-logout' )
  }
}

app.transformacao_imagem = 'app_mobile_320x170';
app.annotationsAPIKey = 'f519f1f9d885a49e22cfb0897f507827';
var aw_abrilid;

app.isAndroid = function() {
  return navigator.userAgent.match(/Android/i);
};

app.isIphone = function() {
  return navigator.userAgent.match(/iPhone/i);
};

app.isMobile = function(){
  if(
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ){ return true; }
  else { return false; }
};

app.renderPublicidade = function(position,area,target){
  if($("footer").size() > 0){
    $("footer").append(app.getHtmlPublicidade(position,area,target));
  }
};

app.getHtmlPublicidade = function(position,area,target){
   if(target === null){
    var target =  app.getParameterByNameBSC('category-meta_nav');
   }
  return '<div class="publicidade"><iframe name="publicidade" src="http://vejasp.abril.com.br/publicidade-customizada/app-vejasp?posicao='+position+'&area='+area+'&target='+target+'" width="320" height="50"></iframe></div>';
};

app.getYoutubeVideoHtml5 = function(tag){
  var video_url = tag.match(/www.*?(\"|\')/);
  if(video_url === null) return '';

  video_url = video_url[0].replace(/\"|'/g,'');
  video_url = video_url.indexOf("http") === -1 ? "http://" + video_url : video_url;
  video_url = video_url.indexOf("?") === -1 ? video_url + "?html5=1" : video_url + "&html5=1";
  return video_url;
};

app.getYoutubeImagem = function(youtube_url){
  var id_video = youtube_url.split('/');
  id_video = id_video[id_video.length - 1].split('?');
  id_video = id_video[0];
  return video_imagem = "http://img.youtube.com/vi/"+ id_video + "/hqdefault.jpg";
};

app.fixAndroidCaractere = function(){
  if(app.isAndroid()){
    if(window.location.hash.indexOf(":") !== -1){
      window.location.hash = window.location.hash.replace(/:/g, '%3A');
    }
  }
};

app.unfixAndroidCaractere = function(){
  if(app.isAndroid()){
    app.replaceDoisPontos();
  }
};

app.replaceDoisPontos = function(){
  window.location.hash = window.location.hash.replace(/%3A/g, ':');
};

app.closeFilter = function(){
  $('.bscForm').hide();
  $('.bsc_history').hide();
  $('.wrapper').show();
}

app.ActionsFindButton = function(){
  var bscHistory = {
    entries: [],
    sKey: 'bsc_history',
    separator: '::',
    limit: 3,
    start: function(){
      var string = localStorage[this.sKey];
      this.entries = string ? string.split(this.separator).slice(-this.limit) : [];
      return this.entries;
    },
    push: function(entrie){
      if(entrie != ''){
        this.entries = this.arrayRemove(this.entries, entrie);
        this.entries.push(entrie);
        this.entries = this.entries.slice(-this.limit);
        localStorage[this.sKey] = this.entries.join(this.separator);
      }
      return this.entries;
    },
    get: function(){
      var r = [];
      for(var i=this.entries.length-1; i>=0; i--) r.push(this.entries[i]);
      return r;
    },
    clear: function(){
      delete localStorage[this.sKey];
      return this.entries = [];
    },
    arrayRemove: function (arr) {
      var what, a = arguments, L = a.length, ax;
      while (L > 1 && arr.length) {
          what = a[--L];
          while ((ax= arr.indexOf(what)) !== -1) {
              arr.splice(ax, 1);
          }
      }
      return arr;
    }
  };
  bscHistory.start();

  var historyHTML = '';
  $.each(bscHistory.get(), function(i, v){ historyHTML+='<a href="#" class="bsc_history_go" onclick="app.closeFilter();app.openInternalLink(\'busca.html?#qu='+encodeURIComponent(v)+'\');app.eventAnalytics(\'Topo\',\'clique\',\'palavra-historico\',0);">'+v+'</a>'; });
  if(historyHTML) $('.bsc_history').append(historyHTML);
  else $('.bsc_history').remove();

  $('.find').click(function(){
    app.scrollTop(0);
    $('.bscForm').show();
    $('.qu').focus();
  });

  $('.bsc_history_go').on('click', function(){
    $('.wrapper').hide();
  });

  $('.qu').on('blur',function(){
    if($(this).val().length) $('.bscInputWrapper').addClass('filled');
    else $('.bscInputWrapper').removeClass('filled');
    window.setTimeout(function(){
      app.closeFilter();
    }, 150);
  }).on('keydown',function(){
    $('.bscInputWrapper').addClass('filled');
  });

  $('.bscForm button[type=reset]').click(function(){
      app.closeFilter();
      $('.bscInputWrapper').removeClass('filled');
  });
  $('.qu').on('focus.history', function(e){
      e.preventDefault();
      $('.bsc_history').show();
      $('.bsc_history').height($(document.body).height() - $(".bsc_history").offset().top);
  });
  $('.bsc_history_close').on('click', function(e){
    e.preventDefault();
    $('.bsc_history').remove();
  });
  $('.bscForm').on('submit', function(e){
    app.eventAnalytics('Topo','clique','palavra-historico',0);
    var query = $('.qu').val();
    bscHistory.push($('.qu').val());
    app.closeFilter();
    app.openInternalLink('busca.html?#qu='+query);
    return false;
  });
};

app.TransformLinks = function(texto){
  if(app.empty(texto)) return texto;
  var links = texto.match(/\<a.*?<\/a>/g);
  if(app.notEmpty(links)){
    $.each(links, function(i, l) {
      var hrefs = l.match(/href.*?("|').*?("|')/g);
      if(app.notEmpty(hrefs)){
        $.each(hrefs, function(i, h) {
          if(h.length > 4){
            var transLink = h.replace(/\'/g, '"');
            if(transLink.indexOf("estabelecimento") != -1){
              transLink = transLink.replace(/href=\".*estabelecimento\//g, 'href="estabelecimento.html?slug=');
              texto = texto.replace(h, transLink);
            }
            else if(transLink.indexOf("atracao") != -1){
              transLink = transLink.replace(/href=\".*atracao\//g, 'href="atracao.html?slug=');
              texto = texto.replace(h, transLink);
            }
            else{
              transLink = transLink.replace('href="', 'href="javascript:app.openUrl(\'');
              transLink = transLink.substring(0, transLink.length-1) + '\')"';
              texto = texto.replace(h, transLink);
            }
          }
        });
      }
    });
  }

  return texto;
};

app.selectItem = function(tipo, view){
  app.eventAnalytics("Home","clique",tipo+'-'+view,0);
};

app.openInternalLink = function(url) {
  url = url.replace(/:/g,'%3A');
  app.openWindow(url);
};

app.backWindow = function() {
  app.showLoading();
  app.closeWindow();
};

app.showLoading = function(){
  $(".carregando").show();
};

app.hideLoading = function(moveTop){
  moveTop = moveTop == undefined ? true : false;
  $(".carregando").hide();
  if(moveTop) app.scrollTop(0);
};

app.temAvaliados = function(){
  var href = decodeURIComponent(window.location.href);
  if(href.indexOf("Liquidações") !== -1 || href.indexOf("Hotéis") !== -1){
    return false;
  }
  return true;
};

//Salva a lat e long em localstorage
app.storeGeo = function(lat, longi){
  if(app.notEmpty(lat) && app.notEmpty(longi)){
    localStorage['geo'] = JSON.stringify({latitude:lat, longitude:longi});
  }
};

app.pertoDeMim = function(params, pagina) {
  var pagina = pagina || 'busca.html#';
  var params = params != null ? '&'+params : '';
  var geo = JSON.parse(app.jsonLocation(latitude,longitude));
  var busca = pagina+params;
  if (!geo.latitude == 0){
    busca = pagina+'&latitude='+geo.latitude+'&longitude='+geo.longitude+params;
  }
  //Se não tiver latitude e longitude consome do cache storeGeo
  if (geo.latitude == null || geo.longitude == null){
    ///////////////// usar para testar no browser do computador ////////////////////
    //geo = {latitude:'-23.5475000', longitude:'-46.6361100'};
    ////////////////////////////////////////////////////////////////////////////////
    geo = JSON.parse(localStorage['geo']);
    busca = 'busca.html#&latitude='+geo.latitude+'&longitude='+geo.longitude+params;
  }
  busca = busca.replace(/:/g, '%3A');
  app.openInternalLink(busca);
};

app.htmlParaConteudoRelacionado=function(conteudosRelacionados){
  var imagens=[];
  if(conteudosRelacionados.length>0){
    $.each(conteudosRelacionados,function(i,conteudosRelacionados){
      if(imagens.length>=10) return false;
      if(conteudosRelacionados.tipo_recurso=='galeria_multimidia'){
        $.each(conteudosRelacionados.midias,function(i,midias){
          if(imagens.length>=10) return false;
          if(app.notEmpty(midias.url_solicitada)){
            imagens.push('<img src="'+midias.url_solicitada+'" alt="'+midias.titulo+'">');
          }
        });
      }
      if(conteudosRelacionados.tipo_recurso=='imagem'){
        if(app.notEmpty(conteudosRelacionados.url_solicitada)){
          imagens.push('<img src="'+conteudosRelacionados.url_solicitada+'" alt="'+conteudosRelacionados.titulo+'">');
        }
      }
    });
  }
  if(imagens.length==0) return '';
  if(imagens.length==1) return imagens[0];
  var carousel='<div class="m-carousel"><ul class="m-carousel-inner">';
  $(imagens).each(function(i,imagens){
    carousel+='<li>'+imagens+'</li>';
  });
  carousel+='</ul></div>';
  return carousel;
};

app.loadScript = function(_src, callback){
  var js = document.createElement("script");
  js.type = "text/javascript";
  js.src = _src;
  js.onload = callback;
  document.body.appendChild(js);
  return js;
};

app.notEmpty = function(str) {
  return str !== undefined && str !== "undefined" && str !== "" && str !== null && str !== 'null';
};

app.empty = function(str) {
  return !app.notEmpty(str);
};

app.openUrl = function(url) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openUrl',{url: url});
  }catch(e){
    alert(e.message);
  }
};

app.openLetsPark = function(geo) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openLetsPark',{geo: geo});
  }catch(e){
    alert(e.message);
  }
};

app.openUrlMensagem = function(url, mensagem) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openUrl',{url: url, message: mensagem});
  }catch(e){
    alert(e.message);
  }
};

app.openWindow = function(url) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openWindow',{url: url});
  }
    catch(e){
      alert(e.message);
    }
};

app.backToHome = function(url) {
  app.showLoading();
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('backToHome');
  }
    catch(e){
      alert(e.message);
    }
};

app.closeWindow = function(url) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('closeWindow');
  }
    catch(e){
      alert(e.message);
    }
};

app.openVideo = function(url) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openVideo',{url: url});
  }
    catch(e){
      alert(e.message);
    }
};

app.openMap = function(latitude, longitude, estabelecimento){
  var Ti = window.parent.Ti;
  Ti.App.fireEvent('openMap',{latitude:latitude,longitude:longitude,estabelecimento:estabelecimento});
};

app.carouselAutoControls = function(){
	var $carouselControls = $('<div class="m-carousel-controls m-carousel-bulleted"></div>').appendTo('.m-carousel');
	var $carouselItem = $('.m-carousel-inner').find('li');
  if($carouselItem.length > 1){
    for(var i = 1; i <= $carouselItem.length; i++){
        $('<a href="#" data-slide="'+i+'">'+i+'</a>').appendTo($carouselControls);
    }
  }
	$('.m-carousel-inner').find('li').first().addClass('m-active');
	$('.m-carousel-controls').find('a').first().addClass('m-active');
};

app.backToItemSlide = function(){
  var slide = window.location.href.match(/&slide/);
  if(slide != null && slide.length > 0){
    app.pageviewAnalytics("index","Home (Slide)");
    $("#swift-menu").addClass("active-menu");
    $('#switch .switch-cursor').css({width:'68px',left:'72px'});
    var tipo = window.location.href.match(/tipo=.*?&/);
    if(tipo != null && tipo.length > 0){
      tipo = tipo[0].replace(/tipo=/, '').replace(/&/, '');
      $('.m-carousel-inner li a').each(function(i,v){
        var match = $(this).attr('href').match(/'.*?'/);
        if(match){
          if(match[0].indexOf(tipo) != -1){
            $('.m-carousel-bulleted a').each(function(k,v){
              if(k === i){
                $(v).trigger('click');
              }
            });
            return false;
          }
        }
      });
    }
  }else{
    app.pageviewAnalytics("index","Home (Grid)");
    $('#switch a').removeClass('switch-active');
    $('#switch-grid').addClass('switch-active');
    $("#swift-menu").addClass("out-menu");
    $("#grid-menu").addClass("active-menu");
  }
};

var originalPosition = 0;
app.setupSwipemenu = function() {
  $('.m-carousel').carousel();
  app.carouselAutoControls();
  $('.switch-cursor').width($('.switch-active').width());
  $('.switch-cursor').offset({left: $('.switch-active').offset().left});

  var switcHandler = function(e){
    e.preventDefault();
    $('.switch-cursor').width($(this).width());
    $('.switch-cursor').offset({left: $(this).offset().left});
    $('.switch-active').removeClass('switch-active');
    $(this).addClass('switch-active');
    var hash = this.hash;

    $('.active-menu').addClass('out-menu').removeClass('active-menu');
    $(hash).addClass('active-menu').removeClass('out-menu');
  };

  $('#switch-grid, #switch-slide').on('click', switcHandler);

  $('#switch').on('touchstart', function(e){
    originalPosition = e.pageX;
  });

  $('#switch').on('touchend', function(e){
    var cursorPosition = $('.switch-cursor').offset().left;
    var leftSwipe = $('.switch').offset().left;

    if(cursorPosition > leftSwipe){
      $('#switch-grid').trigger('click');
    }
    else{
      $('#switch-slide').trigger('click');
    }
  });

  $('#switch').on('touchmove', function(e){
    var touchmove = e.pageX - originalPosition;
    var leftSwipe = $('.switch').offset().left - 100;
    var areaSwipe = leftSwipe + 110;
    if(touchmove >= leftSwipe && touchmove <= areaSwipe){
      $('.switch-cursor').css({'position':'absolute','left':touchmove});
    }
  });

  $('#switch-grid').on('swipeLeft', function(){
    setTimeout(function(){
      $('#switch-slide').trigger('click');
    }, 100);
  });

  $('#switch-slide').on('swipeRight', function(){
    setTimeout(function(){
      $('#switch-grid').trigger('click');
    }, 100);
  });

  $('#swift-menu a,#grid-menu a').on('tap', function(e){
    $(this).find('.icon-home').addClass('blink');
  });
  $('.icon-home').on('webkitAnimationEnd', function(e){
    $(this).removeClass('blink');
  });

  app.backToItemSlide();
};

app.setupSwipeGallery = function() {
  $('.m-carousel').carousel();
  app.carouselAutoControls();
};

app.openModal = function(el){
  $(el).find('.modal-content').css('height', ($(window).height() - 40) + 'px');
  $(el).parent().addClass('modal-open');
};

app.closeModal = function(){
  $('.modal').removeClass('modal-open');
};

app.VideoHtml = null;

app.setupModal = function(slug){
  $('.abrir-modal').click(function(e){
    e.preventDefault();
    app.openModal(this.hash);
    if(!app.isAndroid() && app.notEmpty(app.VideoHtml)){
      $(".video-estab").html(app.VideoHtml);
    }
    //app.pageviewAnalytics("eventos/"+slug,"Eventos");
  });
  $('.modal-close').click(function(e){
    app.closeModal(this.hash);
  });
  $('.folder a.folder-title').click(function(e){
    e.preventDefault();
    $(this).parent().toggleClass('folder-open');
  });
};

app.openMorePages = function() {
  var lis = document.getElementsByTagName("li");
  var lisHide = [];
  for (var i = 0; i < lis.length; i++) {
    if (lis[i].className.indexOf("hide") != -1) {
      lisHide.push(lis[i]);
    }
  }

  var lastItem = (lisHide.length > 10 ? 10 : lisHide.length);
  for (var i = 0; i < lastItem; i++) {
    lisHide[i].className = lisHide[i].className.replace("hide", "");
  }

  if (lastItem < 10) {
    document.getElementById("pagging").style.display = "none";
  }
};

app.getMesExtenso = function(mes) {
  arrayMes = new Array(12);
  arrayMes[0] = "jan";
  arrayMes[1] = "fev";
  arrayMes[2] = "mar";
  arrayMes[3] = "abr";
  arrayMes[4] = "mai";
  arrayMes[5] = "jun";
  arrayMes[6] = "jul";
  arrayMes[7] = "ago";
  arrayMes[8] = "set";
  arrayMes[9] = "out";
  arrayMes[10] = "nov";
  arrayMes[11] = "dez";

  return arrayMes[mes];
};

app.moeda = function(n){
  return String(parseFloat(n).toFixed(2)).replace(/\.(\d\d)$/,',$1');
};

app.getParameterByName = function(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.href);

  return match ? match[1] : null;
};

app.getParameterByNameBSC = function(name) {
  var match = RegExp('[?&]' + name + ':([^&]*)').exec(window.location.href);

  return match ? match[1] : null;
};

app.getParams = function(){
  var p = window.location.href.match(/[?&#]([^?&#]+)/g);
  return p ? p.map(function(v){return v.replace(/[?&#]/, '');}) : null;
};

app.mascaraTelefone = function(v) {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

app.scrollTop = function(index){
  window.scrollTo(index,0);
};

app.pageviewAnalytics = function(page,title){
  ga('send', 'pageview', {'page': page});
};

app.eventAnalytics = function(category,action,label,value){
  ga('send', 'event', category, action, label);

  Ti.App.fireEvent('trackEvent',
    { category: category,
      action: action,
      label: label,
      value: value
    }
  );
};

app.networkOffAlert = function(){
  if(Ti !== undefined){
    Ti.App.fireEvent('networkOffAlert');
  }
};

app.fixHeaderStyleIOS = function(){
  if(!app.isAndroid()){
    $("head").append("<link rel='stylesheet' href='HTML/css/header-style-ios.css'>");
  }
};


$(document).ready(function(){
  app.ActionsFindButton();
  app.renderPublicidade();
  app.fixHeaderStyleIOS();
  //fastclick
  FastClick.attach(document.body);

  app.defineAbrilIdButtonText();
});

app.GetCurrentLocation = function(){
  if(app.empty(localStorage['geoLocation'])){
    localStorage['geoLocation'] = JSON.stringify({latitude:'-23.5546901', longitude:'-46.6364633', opDefault:true, date: new Date().getTime()});
  }

  var geo = JSON.parse(localStorage['geoLocation']);
  if(geo.date > new Date().getTime()) return;
  else geo.opDefault = true;
  if(!geo.opDefault) return;
  try{
    console.warn('carregando GPS');
    app.showLoading();
    (function getUserCoordinates() {
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition(
        function(position){
          geo.latitude = position.coords.latitude;
          geo.longitude = position.coords.longitude;
          geo.opDefault = false;
          var minutes = 5;
          geo.date = new Date(new Date().getTime() + minutes*60000).getTime();
          localStorage['geoLocation'] = JSON.stringify(geo);
          app.hideLoading();
        },
        function(error){
          console.warn('ERROR(' + error.code + '): ' + error.message);
          return true;
        },
        options
      );
    }());
  }
  catch(e){}

  if(geo.opDefault){
    if(app.isMobile()){
      setTimeout(function(){
        app.GetCurrentLocation();
      },2000);
    }
  }
};

app.loginLogout = function() {
  if(app.getAbrilIdParams())
    app.openAbrilId( app.logoutAbrilId );
  else
    app.openAbrilId( app.loginAbrilId );
};

app.openAbrilId = function(url) {
  try{
    var Ti = window.parent.Ti;
    Ti.App.fireEvent('openAbrilId',{url: url});
  }catch(e){
    alert(e.message);
  }
};

try{
  var Ti = {
    _event_listeners: [],
    createEventListener: function(listener) {
      var newListener = { listener: listener, systemId: -1, index: this._event_listeners.length };
      this._event_listeners.push(newListener);
      return newListener;
    },
    getEventListenerByKey: function(key, arg) {
      for (var i = 0;i < this._event_listeners.length; i++) {
        if (this._event_listeners[i][key] == arg) {
          return this._event_listeners[i];
        }
      }
      return null;
    },
    API: TiAPI,
    App: {
      addEventListener: function(eventName, listener){
        var newListener = Ti.createEventListener(listener);
        newListener.systemId = TiApp.addEventListener(eventName, newListener.index);
        return newListener.systemId;
      },
      removeEventListener: function(eventName, listener){
        if (typeof listener == 'number') {
          TiApp.removeEventListener(eventName, listener);
          var l = Ti.getEventListenerByKey('systemId', listener);
          if (l !== null) {
            Ti._event_listeners.splice(l.index, 1);
          }
        } else {
          l = Ti.getEventListenerByKey('listener', listener);
          if (l !== null) {
            TiApp.removeEventListener(eventName, l.systemId);
            Ti._event_listeners.splice(l.index, 1);
          }
        }
      },
      fireEvent: function(eventName, data){
        TiApp.fireEvent(eventName, JSON.stringify(data));
      }
    },
    executeListener: function(id, data){
      var listener = this.getEventListenerByKey('index', id);
      if (listener !== null) {
        listener.listener.call(listener.listener, data);
      }
    }
  };
  var Titanium = Ti;
}catch(e){}

app.networkOffAlert();

app.loadByUrl = function(params, callbackSucess, callbackError){
  var geturl = $.ajax({
    url: 'http://auth.vejinhas.api.abril.com.br/',
    success: function(data) {
      var token;
      console.log(data)
      body = data.split("\n");
      for(i=0; i<body.length; i++){
        if(body[i].length > 140 && body[i].match(/%.*?[a-zA-Z].*?[0-9]/) != null){
          token = body[i].replace("X-Token-Abril:", "").trim();
          break;
        }
      }

      if(token != undefined){
        $.ajax({
          url: params.url,
          type: params.type || null,
          data: params.data || null,
          dataType: params.dataType || null,
          headers: {
            'X-Token-Abril': token
          },
          success: function(data) {
            callbackSucess.call(null, data);
          },
          error: function(xhr, type) {
            callbackError.call(xhr, type);
          },
        });
      }
      else{
        alert('Erro capturar token.');
      }
    },
    error: function(xhr, type) {
      alert('Erro ao autenticar api, tente novamente mais tarde.');
    }
  });
}
