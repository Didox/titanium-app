window.VEJASP    = window.VEJASP || {};
var VEJASP = window.VEJASP;
BSC.context = app.bscHost;
BSC.minified = "";
BSC.libc = false;
BSC.prod = true;
var $ = $ || {};
var slugs = new Array();
    slug = "";

/////////////////////////////////////////////////// VEJASP ////////////////////////////////////////////////////////////////////////

VEJASP = {
  adicionaEventosFiltrosAnalytics:function(){
    $("#bsc_navigators a").each(function(){
      var navegador = $.trim($(this).text().replace(/ \(.*\)/, ""));
      if(navegador !== "" && $(this).attr('href') !== "") {
        var fixAndroidCaractere =  $(this).parent().hasClass('title') ? "" : "app.fixAndroidCaractere();";
        $(this).attr('onclick', "app.eventAnalytics('Busca','clique','filtros-"+decodeURIComponent(navegador.toLowerCase().replace(" ", "-").replace("- ×",""))+"',0);_gaq.push(['SITE._trackEvent','app-pagina-busca','filtros']);app.showLoading();" + fixAndroidCaractere);
      }
    });
  },
  fixHrefVazio:function(){
    $("#bsc_navigators a").each(function(){ if($(this).attr("href") == ""){ $(this).attr("href", "#"); } }); //fix elemento href vazio
  }
};


/////////////////////////////////////////////////// VEJASP.Publicidade ////////////////////////////////////////////////////////////////////////
VEJASP.Publicidade = {
  Render:function(){
    var target =  app.getParameterByNameBSC('category-meta_nav') || app.getParameterByNameBSC('rotulos_controlados-meta_nav') || 'busca';

    target     = decodeURI(target);
    var j=0;
    $("#bsc_resultado .attraction, #bsc_resultado .establishment").each(function(i,v){
      if(((i+1) % 3) === 0){
        j=j+1;
        $(v).append(app.getHtmlPublicidade("leaderboard"+j,target));
      }
    });
  }
};

/////////////////////////////////////////////////// VEJASP.Filtros ////////////////////////////////////////////////////////////////////////

VEJASP.Filtros = {
  showHideCombo:function(){
    $(VEJASP.BSC.navegadores).each(function(){
      if(eval("VEJASP.Filtros.openCombo." + this)){
        $(".bsc_nav_" + this).attr('style','display: block!important');
        $(".bsc_nav_" + this).prev().addClass("ativado");
      }
      else $(".bsc_nav_" + this).attr('style','display: none!important');
    });
  },
  openCombo: {},
  hideEspecialidades:function(){
    if($(".bsc_source_atracao_genero").size() > 0){
      $(".bsc_source_sub_category").hide();
    }
  },
  getParameterByName:function(name,href){
    Vhash = href!=null ? href : location.hash;
    Vhash = Vhash.substring(1);
    Vitems = Vhash.split("&");
    var result;
    $.each(Vitems, function( i, item ) {
      Vsplited = href!=null ? item.split(/\:|\=/) : item.split(/\:|\=|%3A/);
      if (Vsplited[0] === name) {
        result = Vsplited[1];
        return;
      }
    });
    return result;
  },
  getLocationByName:function(name){
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.href);
    return match ? match[1] : null;
  },
  printTerm:function(){
    var category = VEJASP.Filtros.getParameterByName("category-meta_nav");
    var groupCategory = VEJASP.Filtros.getParameterByName("rotulos_controlados-meta_nav");
    if(typeof category != "undefined"){
      return decodeURIComponent(category);
    }else if(typeof groupCategory != "undefined"){
      return decodeURIComponent(groupCategory);
    }else{
      return '';
    }
  },
  limparFiltros:function(){
    var filtros = "";
    $(VEJASP.BSC.navegadores).each(function(i,v){
      filtros += "(&" + v + ".*)|";
    });
    filtros = filtros.substring(0, filtros.length -1);
    var filtrosRegex = new RegExp(filtros);
    window.location.hash = window.location.hash.replace(filtrosRegex, '');
  },
  showFiltros:function(){
    $("#bsc_nav_category").css('height','auto');
    app.scrollTop(0);
    $("#header-filtro").css("display", "block");
    $("#bsc_navigators").css("display", "block");
    $("header #header").css("display", "none");
    $("#bsc_lat, #bsc_info").hide();
  },
  hideFiltros:function(){
    $("#header-filtro").css("display", "none");
    $("#bsc_navigators").css("display", "none");
    $("header #header").css("display", "block");
    $("#bsc_lat, #bsc_info").show();
    app.hideLoading();
  },
  openClosePertoDeMim: function(){
    app.showLoading();
    var params = app.getParams();

    if(window.location.href.indexOf("latitude") === -1){
      params = params ? params.join('&') : '';
      app.pertoDeMim(params);
      app.hideLoading();
    }else{
      var storelat  = app.getParameterByName('latitude');
      var storelong = app.getParameterByName('longitude');
      app.storeGeo(storelat, storelong);
      var p = [];
      $.each(params, function(i, v){ if(!v.match(/latitude/) && !v.match(/longitude/)) p.push(v);});
      window.location.href = 'busca.html#&' + p.join('&');
    }
  },
  filterAvaliados: function(){
    var params = app.getParams();
    var p = [];
      if(app.notEmpty(params)){
        $.each(params, function(i, v){p.push(v);});
      }
      if(window.location.href.indexOf("avaliado_vejasp") === -1){
        window.location.href = 'busca.html#&' + p.join('&') + '&avaliado_vejasp=true';
      }else{
        window.location.href = window.location.href.replace('&avaliado_vejasp=true', '');
      }
  },
  filtroAltura:function(){
    var bodySize = $(document).height() + $("header").outerHeight() + 250;
    var filtrosSize = $('.filtros').outerHeight() + $("header").outerHeight() + 250;
    $('#mobileModalFiltros').attr('style', 'display:block!important;height:'+ ( bodySize > filtrosSize ? bodySize : filtrosSize ) +'px');
  },
  preparaFiltros:function(){
    VEJASP.Filtros.showHideCombo();
  },
  resultadoPertoDeMim:function(){
    if(window.location.hash.match(/category-meta_nav:Food Trucks/) === null && window.location.hash.indexOf("latitude") != -1){
      if($(".bscNoResult").text().indexOf("perto de mim") == -1){
        if($(".bscNoResult").text().indexOf("Nenhum") == -1){
          var html = $(".bscNoResult").text().replace(/Resultados para /g, '');
          $(".bscNoResult").html("<b>" + html + "</b> <span class='perto-de-mim'>perto de mim</span>");
        }
        else{
          var html = $(".bscNoResult").html();
          $(".bscNoResult").html(html + " <span class='perto-de-mim'>perto de mim</span>");
        }
      }
    }
  },
  noResultAvaliadoVejaSP:function(){
    if(window.location.hash.indexOf("avaliado_vejasp") != -1){
      var total = BSC.resultObj.total_results;
      if(total == 0){
        var avaliados = " <br>avaliados por VEJASP";
        if($(".bscNoResult").html().indexOf(avaliados) == -1){
          $(".bscNoResult").append(avaliados);
        }
      }
    }

    VEJASP.Filtros.resultadoPertoDeMim();
  },
  showBtClearFilter:function(){
    if(window.location.hash.indexOf("_nav") !== -1){
      $('.btClearFilter').show();
    }else{
      $('.btClearFilter').hide();
    }
  },
  botoes: function(){
    var nextLink = "";
        previousLink = "";
        filtrosHeight = $("#bsc_resultado").height();
    $('#bsc_resultado>div').each(function(k, div){
      var url = $(div).data('url');
      $(div).find('a').attr('href', url);
    });
    $('#bsc_paginador a').click(function(){
      app.scrollTop(0);
    });
    $("#bsc_paginador a").click(function(){
      var content = $(this).attr("href");
      var numero  = VEJASP.Filtros.getParameterByName("pg",content);
      app.eventAnalytics('Busca','clique','pagina-'+numero+'-busca',0);
    });
    if(typeof $("#bsc_paginador .bt-previous-page a").attr("href") != "undefined"){
      previousLink = $("#bsc_paginador .bt-previous-page a").attr("href");
      previousLink = previousLink.replace(/.*\/busca/,"busca").replace("#?","#");
      $("#bsc_paginador .bt-previous-page a").attr("href",previousLink);
    }
    if(typeof $("#bsc_paginador .bt-next-page a").attr("href") != "undefined"){
      nextLink = $("#bsc_paginador .bt-next-page a").attr("href");
      nextLink = nextLink.replace(/.*\/busca/g,"busca").replace("#?","#");
      $("#bsc_paginador .bt-next-page a").attr("href",nextLink);
    }
    if($("#bsc_navigators .buttons").size() == 0){
      $("#bsc_navigators").append('<div class="buttons "></div>');
      var btnLimpar = window.location.hash.match(/category-meta_nav.*?meta_nav/) !== null ? '<a href="javascript:VEJASP.Filtros.limparFiltros()" class="btClearFilter" onclick="app.eventAnalytics(\'Busca\',\'clique\',\'bt-limpar\',0);">Limpar</a>' : '';
      $("#bsc_navigators .buttons").append(btnLimpar);
      var btnFiltrar = '<a href="javascript:VEJASP.Filtros.hideFiltros();" class="btCloseFilter" onclick="app.eventAnalytics(\'Busca\',\'clique\',\'bt-filtrar\',0);">Filtrar</a>';
      $("#bsc_navigators .buttons").append(btnFiltrar);

      $("#bsc_navigators").prepend('<div class="buttonsTop"></div>');
      if(decodeURI(window.location.hash).match(/category-meta_nav:Food Truck/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Peças/) === null &&
          decodeURI(window.location.hash).match(/rotulos_controlados-meta_nav:Infantil/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Shows/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Exposições/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Espetáculos de dança/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Concertos/) === null &&
          decodeURI(window.location.hash).match(/category-meta_nav:Liquidações/) === null){
        var comGps = location.hash.indexOf("latitude") !== -1 ? 'com-gps' : '';
        $(".buttonsTop").prepend('<a href="javascript:VEJASP.Filtros.openClosePertoDeMim()" class="botaoPertoDeMim '+comGps+'" onclick="app.eventAnalytics(\'Busca\',\'clique\',\'filtro-perto-de-mim\',0);">Perto de mim</a>');
      }
      var avaliados_vejasp = location.hash.indexOf("avaliado_vejasp") !== -1 ? 'avaliados_vejasp' : '';
      if(app.temAvaliados()){
        $("#bsc_navigators .buttonsTop").append('<a href="javascript:VEJASP.Filtros.filterAvaliados()" class="botaoAvaliados '+avaliados_vejasp+'" onclick="app.eventAnalytics(\'Busca\',\'clique\',\'filtro-avaliado-vejasp\',0);">Avaliado por VEJASP</a>');
      }
    }
    app.hideLoading();
  }
};

/////////////////////////////////////////////////// VEJASP.BSC ////////////////////////////////////////////////////////////////////////

VEJASP.BSC = {
  navegadores: ["sub_category", "neighborhood", "anos_vencedor_comer_beber", "preco_medio", "atracao_genero", "editorial_rating"],
  categoryFoundResultsTemplate: '<p class="resultsExib">Encontramos <strong>[res]</strong> sugestão para você</p>',
  foundResultsTemplate        : '<p class="resultsExib">Encontramos <strong>[res]</strong> sugestão para você</p>',
  searchWithBlankKeywordSupport:function(){
    BSC.tmpl.foundResults = this.keyword === '' ?  VEJASP.BSC.categoryFoundResultsTemplate : VEJASP.BSC.foundResultsTemplate;
    var h = this.hits,
        atualPage = this.atualPage,
        param = this.requestQuery();
    this.loadScript(param, function(){});
    this.fqParams = [];
    this.regularParams = [];
  },
  removeEmptyP: function(){
    $('p.title').each(function(i,v){if($(v).text() == ""){$(v).remove();}}); //fix elemento vazio
  },
  extendParseNavLink:function(item, link, type){
    var setLink = {},
    check = false,
    sep = (BSC.ajaxMode === true)? "#" : "?";
    type = type + ":" + item.name;
    type = "&" + encodeURI(type);
    var orig = type;
    if(link.indexOf(type) !== -1) {
      type= "";
      check = true;
    }
    if(link.indexOf(sep) === -1)
      link += sep;
    link = link.replace(orig, "").replace(/\?|#/g, sep);
    link = (link+type).replace(/&&/g, "&");
    link = link.replace(/##/g, "#");
    link = link.replace(/#\?/g, "#");
    link = link.replace(this.findUrlParam("pg"), "");
    setLink = {
      "link" : link,
      "check": check,
      "name" : item.name,
      "total_results" : item.total_results
    };
    return setLink;
  },
  extendBSCCode:function(){
    BSC.search            = VEJASP.BSC.searchWithBlankKeywordSupport;
    BSC.parseNavLink      = VEJASP.BSC.extendParseNavLink;
    BSC.specialFunctions.push(VEJASP.BSC.renderSearchEntry);
  },
  setupCore:function(){
    BSC.hits     = 10;
    BSC.servlet  = "vejasp";
    BSC.ajaxMode = true;
    BSC.didYouMeanAtivo = true;
    $.extend(BSC, {
      buttonGenerate: function(v, link){
        var tmp = this.tmpl.linkButton;
        var clearLink = link.replace(/\?/g, "").replace(/&$/g, "");
        clearLink = clearLink.replace(/.*\/busca/g,"busca");
        var prefix = '';
        if (link.indexOf('#') === -1){prefix = '#';}
        tmp =  tmp.replace(/\[url\]/g, clearLink + prefix + "&pg="+v).replace(/\[val\]/g, v);
        return tmp;
      }
    });
    var deepMerging = true;
    $.extend(deepMerging, BSC.tmpl, {
      foundResults: '',
      linkButton:   '<div class="bt-page"><a href="[url]" class="bsc_pag_[val] bsc_ajax" onclick="_gaq.push(["SITE._trackEvent","app-pagina-busca","paginacao-numero"])">[val]</a></div>',
      paginate: {
        numberOfPages: 2,
        next:          '<div class="bt-next-page"><a class="bsc_prox bsc_ajax" href="[url]" onclick="_gaq.push(["SITE._trackEvent","app-pagina-busca","paginacao-proximo"])">Próximo</a></div>',
        prev:          '<div class="bt-previous-page"><a class="bsc_ant bsc_ajax" href="[url]" onclick="_gaq.push(["SITE._trackEvent","app-pagina-busca","paginacao-anterior"])">Anterior</a></div>',
        pageAtual:     'current-page'
      }
    });
  },
  setupNavigators:function(){
    BSC.navShowOnly         = 10000;
    BSC.tmpl.navs.title     = '<p class="title"><a href="[link]" class="[title]">[title]</a></p>';
    BSC.tmpl.navs.container = '<div class="[specialMarks] establishments" [style]>[content]</div>';
    BSC.tmpl.navs.listItem  = '<li><a href="[link]" class="bsc_ajax [class]">[name] ([total]) <span class="close">×</span></a></li>';
    BSC.tmpl.navs.list      = '<ul id="bsc_nav_[source]" class="bsc_nav_[source] [class] bsc_list area"> [content] </ul>';
    BSC.tmpl.navs.preco     = '<ul id="bsc_nav_[source]" class="bsc_nav_[source] [class] bsc_list"> [content] </ul>';
    BSC.tmpl.navs.precoItem = '<li><a href="[link]" class="bsc_ajax [class] bsc_classification_[unique]">R$ [name] preco <span>([total])</span> [mark]  ([total])</a></li>';
    BSC.setNavTemplates.preco =  function(obj){
      var content = obj.title + obj.preco;
      obj = obj.container .replace(/\[content\]/g, content).replace(/\[class\]/g, "bsc_list_regular");
      return obj;
    };
    BSC.setNavTemplates.precoItem = function(obj){
      obj = obj.precoItem;
      return obj;
    };

    BSC.filterPrimarySet = function(){
      if(location.hash.indexOf("category-meta_nav") != -1){
        var text = $('a.bsc_ajax.selected').first().text().replace(/\((.+)$/, '');
        $('a.bsc_ajax.selected').first().text(text);
      }
    };

    BSC.navigators = [
      this.createListNavigator('category'),
      this.createListSubNavigator('Vencedores do Comer & Beber','anos_vencedor_comer_beber','category'),
      this.createListSubNavigatorPreco('Preço','preco_medio','category'),
      this.createListSubNavigator('Bairros','neighborhood','category'),
      this.createListSubNavigator('Avaliação do Crítico','editorial_rating','category'),
      this.createListSubNavigator('Especialidades','sub_category','category'),
      this.createListSubNavigator('Gênero','atracao_genero','category'),
      this.createListNavigator('materia_tipo')
    ];
    BSC.reord = {
      "bsc_nav_category" : [
        "Restaurantes",
        "Bares",
        "Comidinhas",
        "Food Truck",
        "Cinemas",
        "Filmes",
        "Teatros",
        "Peças",
        "Crianças",
        "Shows",
        "Exposições",
        "Infantil",
        "Baladas",
        "Festas",
        "Dança",
        "Vinhos",
        "Esportes",
        "Liquidações",
        "Concertos",
        "Passeios",
        "Pets",
        "Bufês",
        "Spas",
        "Salões de beleza",
        "Lojas",
        "Motel",
        "Hotéis",
        "Academias",
        "Institutos de educação",
        "Casas de show",
        "Espaços para eventos",
        "Serviços de delivery",
        "Saúde",
        "Estúdios de tatuagem",
        "Espetáculos de dança",
        "Cursos",
        "Serviços"
      ],
      "bsc_nav_editorial_rating" : ["5", "4", "3", "2", "1", "0"],
      // "bsc_nav_sub_category" : ["atracao_genero", "editorial_rating"]
    };
  },
  createListNavigator:function(source){
    return {
      title:  '',
      source: source,
      type:   'list',
      target: 'default'
    };
  },
  createListSubNavigator:function(title,source,subOf){
    return {
      title:   title,
      source:  source,
      type:    'sub',
      subOf:   subOf,
      target : 'default'
    };
  },
  createListSubNavigatorPreco:function(title,source,subOf){
    return {
      title:   title,
      source:  source,
      type:    'preco',
      subOf:   subOf,
      target : 'default'
    };
  },
  createListSubNavigatorRange:function(title,source,subOf){
    return {
      title:  title,
      source: source,
      type:   'range',
      subOf:  subOf,
      target: 'default',
      start:  70,   // valor inicial. É recomendado sempre ser zero.
      end:    175,  // valor máximo a ser exibido
      gap:    35    // diferença entre um valor e seu anterior
    };
  },
  setupCallbacks:function(){
    BSC.before(function(){
      if (/estabelecimento_tipo-meta_nav:|atracao_tipo-meta_nav:/.test(location.hash)) {
        location.hash = location.hash.replace(/estabelecimento_tipo-meta_nav:|atracao_tipo-meta_nav:/, "category-meta_nav:");
      }
      app.showLoading();
      $('#loading-spinner').attr('style','display: block!important');
      if(!app.isAndroid()){
        app.replaceDoisPontos();
      }
    });
    BSC.after(function(){
      VEJASP.BSC.bscShowFiltros();
      VEJASP.BSC.setMobileRouteUrl();
      VEJASP.BSC.displayKeyword();
      VEJASP.BSC.renderTotals();
      VEJASP.Filtros.noResultAvaliadoVejaSP();
      BSC.filterPrimarySet();
    });
  },
  setMobileRouteUrl:function(){
    $("#bsc_resultado .establishment .barra li a.botaoComoChegar").unbind("click");
    $("#bsc_resultado .establishment .barra li a.botaoComoChegar").click(function(e) {
      var aceitar = confirm("Deseja ir para o aplicativo de mapas?");
      if(aceitar === true){
        e.preventDefault();
        var href = $(this).attr("href");
        var mobileUrl = $(this).data('mobile-url');
        if(userCoordinates){
          mobileUrl += '&saddr=' + userCoordinates;
        }
        var url = href.replace(/(url=)([^\&]*)/, "$1" + encodeURIComponent(mobileUrl));
        location.href = url;
      }else{
        return false;
      }
    });
  },
  displayKeyword:function(){
    var keyword = decodeURIComponent(BSC.keyword);
    $('.qu').val('');
    $('#bsc_info > h1, #bsc_resultado > b').html(keyword);
  },
  renderTotals:function(){
    var total = BSC.resultObj.total_results,
        last  = BSC.actualPage * BSC.hits,
        first = (last - BSC.hits) + 1;
    last = (last > total) ? total : last;
    termSearch = typeof BSC.resultObj.query === 'object' ? VEJASP.Filtros.printTerm() : BSC.resultObj.query;
    if(total == 1){
      if(termSearch) $('.resultsExib').html("<p class='bscNoResult'>Resultados para <b>"+decodeURIComponent(termSearch)+"</b></p>Encontramos <strong>" + total + "</strong> sugestão para você");
      $("header h3").text(termSearch);
      $("#bsc_ddm").hide();
    }else if(total > 1){
      if(termSearch) $('.resultsExib').html("<p class='bscNoResult'>Resultados para <b>"+decodeURIComponent(termSearch)+"</b></p>Encontramos <strong>" + total + "</strong> sugestões para você");
      $("header h3").text(termSearch);
      $("#bsc_ddm").hide();
    }else{
      var infoHTML = $("#bsc_resultado").html().match(/.*(<\/b>)/)[0].replace("foi encontrado ","");
      $(".resultsExib").html("");
      var mensagemHTML =  $('<div/>').append($("#bsc_resultado .err")).html();
      mensagemHTML += "<div class='bsc_novabusca_container'><button class='bsc_novabusca'>NOVA BUSCA</button></div>";
      $(".bscNoResult").html("");
      $("#bsc_info").append(infoHTML).addClass('bscNoResult');

      var clearTerm = decodeURIComponent(termSearch);
      if($(".bscNoResult").html().indexOf(clearTerm) == -1){
        $(".bscNoResult").append("<b>"+clearTerm+"</b>");
      }

      $("#bsc_resultado").html(mensagemHTML).css('min-height',($(document).height() - $('#bsc_resultado').offset().top) + 'px');
      if(!$("#bsc_ddm").text().length) $("#bsc_ddm").hide();
      $("#bsc_paginador").hide();
      $('.bsc_novabusca').click(function(){
          $('.bscForm').show();
          $('.qu').focus();
      });

      app.hideLoading();
    }
    $(document.body).removeAttr('style');
  },
  template:function(container){
    return Mustache.compile($(container).html());
  },
  renderSearchEntry:function(_, resultObj){
    return VEJASP.BSC.template('#search-results-template')(new Models.SearchResult(resultObj));
  },
  bscFixSelectedNav:function(){
    $(".bsc_ajax").each(function(){
      if( $(this).attr("href") == undefined && $(this).text().indexOf("(") != -1 ){
        $(this).addClass("selected");
        $(this).text('teste');
      }
    });
  },
  showPriceRange:function(){
    var range = [
      {de:'R.*?0 preco', para: 'Grátis'},
      {de:'R.*?2 preco', para: '$$$$ - de R$ 71,00 a R$ 105,00'},
      {de:'R.*?1 preco', para: '$ - até R$ 70,00'},
      {de:'R.*?3 preco', para: '$$$$$$ - de R$ 106,00 a R$ 175,00'},
      {de:'R.*?4 preco', para: '$$$$$$$$ - acima de R$ 175,00'}
    ];
    $(".bsc_nav_preco_medio a").each(function(){
      var preco_html = this;
      $(range).each(function(){
        if( $(preco_html).html().match(new RegExp(this.de)) != null ){
          var valor =  $(preco_html).html().replace(new RegExp(this.de), this.para).replace("<span>","<span class='count'>").replace(new RegExp(/( x)/)," <span class='close'>x</span>");
          $(preco_html).html(valor);
        }
      });
    });
  },
  showRating:function(){
    $(".bsc_nav_editorial_rating a").each(function(){
      var elements = $(this).html().match(/^([0-9])(\s\([0-9]+\))/);
      if (elements && elements.length > 1) {
        var rating = parseInt(elements[1]);
        stars = '<span id="rating-filter" class="rating rating-vejasp rating-small"><span class="icon-bola-estrela rating-stars stars-' + rating + '"></span></span>';
        var valor = $(this).html().replace(new RegExp('^[0-9]'), stars);
        $(this).html(valor);
      }
    });
  },

  descOrderComerBeberSubNav:function(){
    var anos = [];
    $(".bsc_nav_anos_vencedor_comer_beber li").each(function(){ anos.push($(this)); });
    $(".bsc_nav_anos_vencedor_comer_beber").html("");
    $(anos.sort(function(a, b){
      return (parseInt(b.text()) - parseInt(a.text()));
    })).each(function(){
      $(".bsc_nav_anos_vencedor_comer_beber").append("<li>" + this.html() + "</li>");
    });
  },

  ascOrderGeneroAtracao:function(){
    var generos = [];
    $(".bsc_nav_atracao_genero li").each(function(){ generos.push($(this)); });
    $(".bsc_nav_atracao_genero").html("");
    $(generos.sort(function(a, b){
      return ($(b).text()) < ($(a).text()) ? 1 : -1;
    })).each(function(){
      $(".bsc_nav_atracao_genero").append("<li>" + this.html() + "</li>");
    });
  },

  bscShowFiltros:function(){
    VEJASP.BSC.bscFixSelectedNav();
    VEJASP.Filtros.preparaFiltros();
    VEJASP.BSC.showPriceRange();
    VEJASP.BSC.showRating();
    VEJASP.BSC.descOrderComerBeberSubNav();
    VEJASP.BSC.ascOrderGeneroAtracao();
    //VEJASP.Filtros.hideEspecialidades(); - Hoje irá mostrar todas as especialidades, pois existem atracoes que são comidinhas, exemplo: food-truck ou feiras
    VEJASP.adicionaEventosFiltrosAnalytics();
    VEJASP.fixHrefVazio();
    app.unfixAndroidCaractere();


    $(VEJASP.BSC.navegadores).each(function(){
      var nav = this;

      var clickCombo = " " +
        "$('.bsc_source_" + nav + " .title').unbind(); \n" +
        "$('.bsc_source_" + nav + " .title').attr('data', '" + nav + "').addClass('" + nav + "'); \n" +
        "$('.bsc_source_" + nav + " .title').on('click', function(e){ \n" +
        "  e.preventDefault(); \n" +
        "  var $elenBsc = $(this); \n" +

        "  $('p.title:not(.' + $elenBsc.attr('data') + ')').removeClass('ativado'); \n" +
        "  $('p.title:not(.' + $elenBsc.attr('data') + ')+ul').attr('style','display:none'); \n" +

        "  $(VEJASP.BSC.navegadores).each(function(){ " +
        "    if(this !== $elenBsc.attr('data')){ \n" +
        "      eval('VEJASP.Filtros.openCombo.\' + this + \' = false;'); \n" +
        "    } \n" +
        "  }); \n" +

        "  if($('.bsc_nav_" + nav + "').attr('style').indexOf('block') == -1){ \n" +
        "    $(this).addClass('ativado'); \n" +
        "    $('.bsc_nav_" + nav + "').attr('style','display:block'); \n" +
        "    VEJASP.Filtros.openCombo." + nav + " = true; \n" +
        "  } \n" +
        "  else{ \n" +
        "    $(this).removeClass('ativado'); \n" +
        "    $('.bsc_nav_" + nav + "').attr('style','display:none'); \n" +
        "    VEJASP.Filtros.openCombo." + nav + " = false; \n" +
        "  } \n" +

        "  app.hideLoading(); \n" +
        "}); \n";
      eval(clickCombo);

      $(".bsc_source_" + nav + " .title a span").remove();
      var size = $(".bsc_nav_" + this + ' .selected').size();
      if(size > 0){
        //$(".bsc_source_" + nav + " .title a").append(" <span>(" + size + ")</span>");
      }

      app.scrollTop(0);

      VEJASP.Filtros.botoes();
      VEJASP.BSC.removeEmptyP();

      if(app.isAndroid()){
        // fixAndroid show
        if($("#header-filtro").css("display").indexOf("block") !== -1){
          VEJASP.Filtros.hideFiltros();
          VEJASP.Filtros.showFiltros();
        }
      }

      if($(".dados").size() > 0 && window.location.hash.match(/category-meta_nav:Food Truck/) === null && decodeURI(window.location.hash).match(/category-meta_nav:Liquidações/) === null){
        $('.icon.filter').show();
      } else {
        $('.icon.filter').hide();
        VEJASP.Filtros.hideFiltros();
      }

      app.hideLoading();
    });
  }
};

///////////////////////////////////////// BSC Configs ///////////////////////////////////////////////////

BSC.minified = '';
BSC.plug({
  navigators: true,
  subNavigators: true,
  range: true,
  ordenate: true
});

BSC.ready(function(){
  VEJASP.BSC.extendBSCCode();
  VEJASP.BSC.setupCore();
  VEJASP.BSC.setupNavigators();
  VEJASP.BSC.setupCallbacks();
  BSC.fqParams.push("(type-meta_nav:\"estabelecimento\"%20OR%20type-meta_nav:\"atracao\")");
  BSC.regularParams.push("f.preco_medio-meta_nav.facet.sort=false");
  BSC.regularParams.push("f.anos_vencedor_comer_beber-meta_nav.facet.sort=false");

  latitude = VEJASP.Filtros.getLocationByName('latitude');
  longitude = VEJASP.Filtros.getLocationByName('longitude');

    if(location.hash.indexOf("avaliado_vejasp=true") !== -1){
      BSC.fqParams.push("(avaliado_vejasp-meta_nav:\"1\")");
    }

  if(latitude === null || longitude === null){
    if (
      (location.hash.indexOf("ordenacao_nome=true") !== -1) &&
      (location.hash.indexOf("geo=false") !== -1 || location.hash.indexOf("geo") === -1)
    ) {
      BSC.regularParams.push("s=title_nav%20asc");
    }
  }
  else{
    BSC.regularParams.push("geo=true");
    BSC.regularParams.push('g_lat=' + VEJASP.Filtros.getLocationByName('latitude'));
    BSC.regularParams.push('g_long=' + VEJASP.Filtros.getLocationByName('longitude'));
    BSC.regularParams.push('g_radius=6378100');
    BSC.regularParams.push('s=geo_distance asc');
  }

  BSC.executeAfter = function() {
    app.replaceDoisPontos();
    VEJASP.Filtros.showBtClearFilter();
    VEJASP.Filtros.resultadoPertoDeMim();
    app.hideLoading();
    VEJASP.Publicidade.Render();
  };
});

$(VEJASP.BSC.navegadores).each(function(){
  eval("VEJASP.Filtros.openCombo." + this + " = false;" );
});
var vtitulo = VEJASP.Filtros.getParameterByName("titulo_filtro");
if (vtitulo) {
  $(".tituloFiltros").html(decodeURI(vtitulo));
}

/////////////////////////////////////////////////////////////// document ready ////////////////////////////////////////////////////////////////////////
app.unfixAndroidCaractere();

$(document).ready(function(){
  if(location.hash.indexOf("qu=") !== -1){
    $('span.logo').text('Busca');
  }
  $("head").append("<link rel='stylesheet' href='http://vejasp.abrilm.com.br/stylesheets/app-publicidade.css?v="+new Date().getTime()+"'>");
  if(app.isAndroid()){
    $("head").append("<link rel='stylesheet' href='HTML/css/header-style-android.css'>");
  }

  location.hash = location.hash.replace(/(geo\=)(true|false)/, "");
  function isTouchDevice(){
    return (typeof(window.ontouchstart)!='undefined')?true:false;
  }
  var clickEvent = isTouchDevice() ? 'touchstart' : 'click';
  $(".abril-id-container .abrilid-btn").on(clickEvent,function(e){
    e.preventDefault();
    $('.menuLateral').removeClass('ativar');
  });
  $(".botaoLimparFiltros").on(clickEvent,function(e){
    e.preventDefault();
    var geoHash = location.hash.match(/geo\=(true|false)/) !== null ? location.hash.match(/geo\=(true|false)/)[0] : "";
    location.hash = $(this).attr('href') + '&' + geoHash;
  });
});
