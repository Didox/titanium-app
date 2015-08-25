var Comentarios = {
  page      : 0,
  perPage   : 3,
  apiKey    : 'f519f1f9d885a49e22cfb0897f507827',
  // $key = chave da api, $rsc = recurso, $ppg = comentários por página
  baseUrl   : app.annotationsApiUrl + '/$key/comentarios/$rsc&per_page=$ppg',
  wrp       : null,
  loading   : null,
  xhrActive : false,
  sOffset   : 200,
  init      : function(_rsc, _wrp){
    this.baseUrl = this.baseUrl.replace('$key', this.apiKey).replace('$rsc', _rsc).replace('$ppg', this.perPage);
    this.wrp = $(_wrp);
    this.loading = $("<div class='abril-comentarios-loading'></div>");
    this.wrp.after(this.loading);
    this.more();
    $(window).on('scroll.comentarios', function(){Comentarios.scrollHandler();});
  },
  scrollHandler: function(e){
    if(this.xhrActive) return true;
    var wScroll = $(window).scrollTop(),
        wHeight = $(window).height(),
        bHeight = $(document.body).height();
    if(wScroll + wHeight + this.sOffset >= bHeight) this.more();
  },
  more: function(){
    this.xhrActive = true;
    this.page++;
    this.loading.show();

    app.loadByUrl({
      url: Comentarios.baseUrl+'&pw='+Comentarios.page
    }, function(data){
      var $newcomments = $(data);
      $newcomments.find("li>div").each(function(k, el){
        if(!$(el).find('.abril-comentarios-avatar').length){
          $(el).prepend('<span class="abril-comentarios-avatar user-no-photo"></span>');
        }
      });
      $newcomments.find(".abril-comentarios-voto").each(function(k, el){
        var nota = $(el).text().substr(0,1),
            icon = nota != 0 ? 'estrela' : 'bomba';
        $(el).addClass('rating').html('<span class="icon-'+icon+' rating-stars stars-'+nota+'"></span>');
      });
      $newcomments.find(".respostas").each(function(k, el){
        var $btn = $('<a href="#" class="abril-comentarios-respostas-btn">Respostas ('+$(el).find('ol').data('totalrespostas')+')</a>');
        $btn.on('click',function(e){
          e.preventDefault();
          $(this).parent().toggleClass('respostas-open');
        });
        $(el).prepend($btn);
      });

      Comentarios.xhrActive = false;
      Comentarios.wrp.append($newcomments);
      Comentarios.loading.hide();

      if(Comentarios.wrp.children().last().is('ol')) $(window).off('scroll.comentarios');
    }, function(xhr, type){
      console.log(arguments);
    });

  }
};