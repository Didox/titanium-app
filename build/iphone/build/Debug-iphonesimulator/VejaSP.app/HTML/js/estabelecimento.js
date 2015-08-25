var app = window.app || {};
var RESTORANDO = window.RESTORANDO;

app.loadEstabelecimento = function() {
  var data;
  var slug = app.getParameterByName('slug');
  var url = app.vejaspApiUrl + "/estabelecimentos/"+slug+"?transformacao_imagem=" + app.transformacao_imagem;

  app.loadByUrl({
    type: 'GET',
    url: url,
    dataType: 'json',
  }, function(data){
    app.renderEstabelecimento(data);
  }, function(xhr, type){
    if(conexao){
      alert('Estabelecimento não encontrado.');
      app.backWindow();
    }
  });
  
  $('.submenu ul li a').click(function(e){
    e.preventDefault();
    $('.submenu ul li a').removeClass("ativo");
    $('.infos .resenhas, .infos .avaliacoes, .infos .mais-infos').hide();
    $('.infos .'+$(this).attr("class")).show();
    $(this).addClass("ativo");
    return false;
  });

  $("#estabelecimento").css('min-height', $(document).height() - $('#estabelecimento').offset().top + 'px');

  app.showProgramacao(slug);
  RESTORANDO.verify(slug);

  return true;
};

app.getHtmlVideo = function(video,video_imagem) {
  if(app.isAndroid()){
    return "<a href='#' onclick='app.eventAnalytics(\"Estabelecimento\",\"clique\",\"video-estab\",0);app.openVideo(\"" + video + "\")'><img src='" + video_imagem + "'><a href='#' onclick='app.eventAnalytics(\"Estabelecimento\",\"clique\",\"video-estab\",0);app.openVideo(\"" + video + "\")' class='tocar'>Tocar</a></a>";
  }else{
    return "<iframe width='320' height='190' src='"+video+"' frameborder='0' allowfullscreen onclick='app.eventAnalytics(\"Estabelecimento\",\"clique\",\"video-estab\",0);'></iframe>";
  }
};

app.forwardLetsPark = function() {
  var lat = app.estabelecimento.geo.latitude;
  var lng = app.estabelecimento.geo.longitude;

  app.openLetsPark('lat=' + lat + '&lng=' + lng);
};

app.renderEstabelecimento = function(estabelecimento) {
  var image = "";
  var video = "";
  var data = "";
  var info = "";
  var d = new Date(estabelecimento.data_ultima_atualizacao);
  var tipo = "";
  var autor = "";
  var resenha = "";
  var tipo_estabelecimento = "";
  var especialidade = "";
  var conteudos_relacionados = "";
  var nota_media = "";
  var quantidade_avaliacoes = "";
  var txt_avaliacoes = "";
  var avaliado_vejasp = "";
  var premios = "";
  var typeClassAvaliacao = "";
  var nota_media_vejasp = "";

  app.estabelecimento = estabelecimento;

  if (app.notEmpty(estabelecimento.video)) {
    video = app.getHtmlVideo(estabelecimento.video,estabelecimento.video_imagem);
  }else if (app.notEmpty(estabelecimento.youtube_video)) {
    try{
      video_url = app.getYoutubeVideoHtml5(estabelecimento.youtube_video);
      if(video_url !== ""){
        video_imagem = app.notEmpty(estabelecimento.url_imagem_solicitada) ? estabelecimento.url_imagem_solicitada : app.getYoutubeImagem(video_url);
        video = app.getHtmlVideo(video_url, video_imagem);
      }
    }
    catch(e){
      alert(e.message);
    }
  }


  $.each(estabelecimento.marcas, function(k, v) {
    if (v.marca === "VejaSP") {
      tipo_estabelecimento = v.tipo_estabelecimento;
      especialidade = v.especialidade;
      if (typeof v.resenha_atual != "undefined") {
        autor = v.resenha_atual.critico;
        resenha = v.resenha_atual.texto;
      }
      if (typeof v.descricao_atual != "undefined") {
        descricao = v.descricao_atual.texto;
      }
      conteudos_relacionados = v.conteudos_relacionados;
      premios = v.premios;
      if(app.notEmpty(v.ratings.media_das_notas)) {
        typeClassRating = v.ratings.media_das_notas===0 ? "icon-bomba" : "icon-estrela";
        nota_media = Math.round(v.ratings.media_das_notas);
        quantidade_avaliacoes = v.ratings.quantidade_de_votos;
        txt_avaliacoes = quantidade_avaliacoes > 1 ? "avaliações" : "avaliação";
      }else{
        typeClassRating = "icon-estrela";
        nota_media = "none";
        quantidade_avaliacoes = "Sem";
        txt_avaliacoes = "avaliação";
      }
      count = 0;
      avaliado_vejasp = v.avaliado_redacao;
      if(app.notEmpty(v.avaliacao_editorial) && app.notEmpty(v.avaliacao_editorial.nota)){
        typeClassAvaliacao = v.avaliacao_editorial.nota===0 ? "icon-bomba" : "icon-bola-estrela";
        nota_media_vejasp = v.avaliacao_editorial.nota;
      }else{
        nota_media_vejasp = "none";
      }
    }
  });

  image = app.htmlParaConteudoRelacionado(conteudos_relacionados);
  data += (estabelecimento.status_estabelecimento.fechado == "fechado") ? "<p class='estabelecimento-fechado'>ESTABELECIMENTO FECHADO</p>" : "";
  data += (avaliado_vejasp && estabelecimento.status_estabelecimento.fechado != "fechado") ? "<p class='avaliado-vejasp'>AVALIADO POR VEJA SP</p>" : "";
  if (app.notEmpty(tipo_estabelecimento) && app.notEmpty(especialidade)){
    data += "<p class='categorias'>" + tipo_estabelecimento + " > " + especialidade + "</p>";
  }else if(app.notEmpty(tipo_estabelecimento)){
    data += "<p class='categorias'>" + tipo_estabelecimento + "</p>";
  }
  data += (app.notEmpty(estabelecimento.nome)) ? "<h1 id='estabelecimento-nome'>" + estabelecimento.nome + "</h1>" : "<h1 id='estabelecimento-nome'>" + estabelecimento.slug.replace(/-/g, ' ') + "</h1>";
  data += "<p class='endereco'>";
  if(tipo_estabelecimento != "Food Truck"){
    data += estabelecimento.endereco.tipo_logradouro + " " + estabelecimento.endereco.logradouro + ", " + estabelecimento.endereco.numero + " - " + estabelecimento.endereco.bairro + " - " + estabelecimento.endereco.cidade + " - " + estabelecimento.endereco.estado + " ";
  } else {
    $('#como-chegar-botao').hide();
  }
  if(estabelecimento.telefones.principal){
    data += "<a href='tel:+55" + estabelecimento.telefones.principal.replace("-", "") + "' onclick='app.eventAnalytics(\"Estabelecimento\",\"clique\",\"numero-telefone-estab\",0);'><b>" + app.mascaraTelefone(estabelecimento.telefones.principal) + "</b></a>";
  }
  data += "</p>";

  data += "<div class='rating rating-small jsRating'>";
  if (nota_media_vejasp!=="none") {
    data += "<span class='rating rating-vejasp rating-small'>";
    data += "<span class='"+typeClassAvaliacao+" rating-stars stars-"+nota_media_vejasp+"''></span>";
    data += "<span class='tagvejasp'>VEJASP</span>";
    data += "</span>";
  }
  data += "<p aria-describedby='users-rating-" + nota_media + "' class='"+typeClassRating+" rating-stars stars-" + nota_media + " update'></p>";
  data += "<p aria-describedby='users-rating-" + nota_media + "' class='total-votes'>" + quantidade_avaliacoes + " " + txt_avaliacoes + "</p>";
  data += "</div>";

  info += "<div class='resenhas'>";
  if(app.notEmpty(autor)){
    info += "<h2 class='subtitle'>Resenha por " + autor + "</h2>";
  }
  if(app.notEmpty(resenha)){
    info += "<div class='resenha'>" + app.TransformLinks(resenha) + "</div>";
  }
  if(app.notEmpty(descricao)){
    info += "<div class='descricao'>" + app.TransformLinks(descricao) + "</div>";
  }

  info += "</div>";

  info += "<div class='avaliacoes'>";
  info += "<ul class='rating'>"
    + "<li class='label'>avalie:</li>"
    + "<li><a href='#' class='rating-open' data-rating='0'><span class='icon-bomba'></span></a></li>"
    + "<li><a href='#' class='rating-open' data-rating='1'><span class='icon-estrela'></span></a></li>"
    + "<li><a href='#' class='rating-open' data-rating='2'><span class='icon-estrela'></span></a></li>"
    + "<li><a href='#' class='rating-open' data-rating='3'><span class='icon-estrela'></span></a></li>"
    + "<li><a href='#' class='rating-open' data-rating='4'><span class='icon-estrela'></span></a></li>"
    + "<li><a href='#' class='rating-open' data-rating='5'><span class='icon-estrela'></span></a></li>"
    + "</ul>";

  if(quantidade_avaliacoes){
    info += "<h2 class='subtitle'>";
    info += (typeof quantidade_avaliacoes == "number" ? quantidade_avaliacoes + " " + txt_avaliacoes : "Não há opiniões");
    var icon = nota_media != 0 ? 'estrela' : 'bomba';
    if(typeof nota_media == "number")
      info += "<div class='rating'><span aria-describedby='users-rating-" + nota_media + "' class='icon-"+icon+" rating-stars stars-" + nota_media + " update' href='#'></span></div>";
    info += "</h2>";

    info += "<div class='abril-comentarios-widget'></div>";

    if(typeof quantidade_avaliacoes == "number")
      $('a.avaliacoes').html($('a.avaliacoes').html()+" ("+quantidade_avaliacoes+")");
  }

  info += "</div>";



  info += "<div class='mais-infos'><h2 class='subtitle'>Informações e serviços</h2>";
  info += "<p class='checadas'>Informações checadas em <b>" + [d.getDate(), app.getMesExtenso(d.getMonth()), d.getFullYear()].join('.') + ".</b></p>";

  if (estabelecimento.preco.maximo || estabelecimento.preco.minimo){
    info += "<div class='price info-area'>";
    info += "<div class='info-label'><span class='info-icon icon-preco maximum'></span></div>";
    if(estabelecimento.preco.maximo && estabelecimento.preco.minimo)
      info += "<div class='info-description'><p> de  <span>R$ " + app.moeda(estabelecimento.preco.minimo) + "</span> a <span> R$ "+ app.moeda(estabelecimento.preco.maximo) + "</span></p></div></div>";
    else
      info += "<div class='info-description'><p><span>R$ " + ( estabelecimento.preco.minimo ? app.moeda(estabelecimento.preco.minimo) : app.moeda(estabelecimento.preco.maximo) ) + "</span></p></div></div>";
  }

  if(estabelecimento.horario_de_funcionamento != ""){
    info += "<div class='info-area'><div class='info-label'><span class='info-icon icon-horario maximum'></span></div>";
    info += "<div class='info-description'>"+estabelecimento.horario_de_funcionamento.replace(/\b([A-ü])+/g,"<b>$&</b>");
    if(estabelecimento.horario_de_funcionamento_observacao) info += "<p class='info-description-obs'>Obs.: " + estabelecimento.horario_de_funcionamento_observacao + "</p>";
    info += "</div></div>";
  }

  var formas_pagamento = (function (){
    var tem_cartao=false;
    $.each(estabelecimento.pagamentos, function(k,v){
      if(v!= null){
        if(v.tipo!="cartao_credito" && v.tipo!="cartao_debito" && v.tipo!="outros_pagamentos"){
          tem_obs = true;
        }
      }
    });
    return tem_cartao;
  })();

  var tem_obs = (function (){
    var tem_obs=false;
    $.each(estabelecimento.pagamentos, function(k,v){
      if(v!= null){
        if(v.tipo!="cartao_credito" && v.tipo!="cartao_debito" && v.tipo!="outros_pagamentos"){
          tem_obs = true;
        }
      }
    });
    return tem_obs;
  })();

  if(formas_pagamento){
    info += "<div class='info-area'><div class='info-label'><span class='info-icon icon-cartao adjustment'></span></div>";
    info += "<div class='info-description'>";
    $.each(estabelecimento.pagamentos, function(k,v){
      if(v.tipo==="cartao_credito" || v.tipo==="cartao_debito"){
        tipo = v.nome;
        if(v.opcoes.length > 0){
          info += "<p>"+tipo+":<br>";
          $.each(v.opcoes, function(k,v){
            info += "<span class='card "+v.replace(" ","-").toLowerCase()+"' title='"+v+"'>"+v+"</span>";
          });
          info += "</p>";
        }
      } else if(v.tipo==="outros_pagamentos") {
        tipo = v.nome;
        if(v.opcoes.length > 0){
          info += "<p>Aceita ";
          var opcoes = v.opcoes;
          $.each(opcoes, function(k,v){
            if(k > 0 && opcoes[k+1])
              info += ", ";
              else if (k > 0)
                info += " e ";
            info += v.toLowerCase();
          });
          info += ".</p>";
        }
      }
    });
    if(tem_obs){
      info += "<p class='info-description-obs'>Obs.:";
      $.each(estabelecimento.pagamentos, function(k,v){
        if(v.tipo!="cartao_credito" && v.tipo!="cartao_debito" && v.tipo!="outros_pagamentos"){
          info += " " + v.nome;

          var t = [];
          if(v.valor == 0) t.push("gratuito");
          else if(v.valor) t.push("R$ " + app.moeda(v.valor));
          if(v.observacoes) t.push(v.observacoes);
          if(t.length > 0){
            info += " (";
            $.each(t, function(q, w){ if(q>0) info+=" - "; info+=w; });
            info += ")";
          }

          info += ".";
        }
      });
      info += "</p>";
     }
    info += "</div></div>";
  }
  if(estabelecimento.servicos.length > 0){
    info += "<div class='info-area'><div class='info-label'><span class='info-icon icon-mais-info adjustment'></span></div>";
    info += "<div class='info-description'><p>";
    $.each(estabelecimento.servicos, function(k,v){
      if(k > 0 && estabelecimento.servicos[k+1])
        info += ", ";
      else if (k > 0)
        info += " e ";
      info += " " +v.nome;

      var t = [];
      if(v.valor == 0) t.push("gratuito");
      else if(v.valor) t.push("R$ " + app.moeda(v.valor));
      if(v.capacidade) t.push(v.capacidade);
      if(v.site) t.push("<a href='#' onclick='app.openUrl(\""+v.site+"\");'>"+v.site+"</a>");
      v.telefones = v.telefones.map(function(x){return "<a href='tel:+55"+x.replace("-", "")+"'>"+x+"</a>";});
      t = t.concat(v.telefones);
      if(v.observacoes) t.push(v.observacoes);
      if(t.length > 0){
        info += " (";
        $.each(t, function(q, w){ if(q>0) info+=" - "; info+=w; });
        info += ")";
      }
    });
    info += "</p></div></div>";
  }

  var websites = [];
  if(app.notEmpty(estabelecimento.websites)){
    $.each(estabelecimento.websites.sites, function(k,w){ if(w.length) websites.push(w);});
  }

  if(websites.length){
    info += "<div class='info-area'><div class='info-label'><span class='info-icon icon-site medium'></span></div>";
    info += "<div class='info-description'>";
      $.each(websites, function(k,v){info += "<p><a href='#' onclick=\"app.eventAnalytics(\'Estabelecimento\',\'clique\',\'link-externo-estab\',0);app.openUrl('"+v+"');\"><b>"+v.replace('http://','')+"</b></a></p>";});
    info += "</div></div>";
  }

  var tem_premio = (function(){
    for(var i = 0; i < premios.length; i++){
      if(premios[i].premiacao === "Comer & Beber") return true;
    }
    return false;
  })();
  if(tem_premio){
    info += "<h3>Comer & Beber</h3>";
    premios.sort(function(a,b){
      return b.ano - a.ano; //ordençao dos premios por ano
    });
    $.each(premios, function(i, premio){
      if(premio.premiacao === "Comer & Beber"){
        info += "<div class='award' data-ano='"+premio.ano+"'>";
        info += "<a href='#' onclick=\"app.eventAnalytics(\'Estabelecimento\',\'clique\',\'aba-comer-beber\',0);\"><span class='award-title'>"+ premio.ano + " - " + premio.participacao + "</span>";
        info += $.each(premio.categorias, function(i, categoria){"Categoria " + categoria;}) + "</a>";
        if(app.notEmpty(premio.resenha)){
          info += "<p class='award-description'>"+ premio.resenha + "<span class='award-autor'>"+premio.critico+"</span></p>";
        }
        info += "</div>";
      }
    });
  }
  info += "</div>";
  if (video != "") {
    image_transform = "<div class='video-estab'>" + video + "</div>";
  } else {
    image_transform = '<div class="imagem-estab">'+image+'</div>';
  }

  app.pageviewAnalytics("estabelecimentos/"+estabelecimento.slug,estabelecimento.nome+" - Estabelecimento");

  $(".midia-estab").html(image_transform);
  app.VideoHtml = $(".video-estab").html();

  $(".detalhes").append(data);
  $(".infos").append(info);

  if(typeof quantidade_avaliacoes == 'number') Comentarios.init(estabelecimento.id, '.abril-comentarios-widget');

  if(!resenha && !descricao){
    $('.submenu .resenhas').hide();
    $('.submenu ul li a').removeClass("ativo");
    $('.submenu ul li a.mais-infos').addClass("ativo");
    $('.infos .mais-infos').show();
  }

  $("#como-chegar-botao a").attr("href", "javascript:app.openMap(" + estabelecimento.geo.latitude + ", " + estabelecimento.geo.longitude + ", '" + estabelecimento.nome + "')");

  $(".award a").click(function(e) {
    e.preventDefault();
    $(this).parent().toggleClass("award-open");
  });

  app.setupSwipeGallery();
  $('.m-carousel').on('afterSlide', function(p){
    app.eventAnalytics('Estabelecimento','clique','galeria-foto-'+p._args[1]+'-'+estabelecimento.slug+'-estab',0);
  });

  $.getJSON(app.vejaspApiUrl + '/letspark/around?lat=' + estabelecimento.geo.latitude + '&lng=' + estabelecimento.geo.longitude, function(data){
    if (data.around > 0)
      $('#onde-estacionar-botao').show();
  });

  $('.rating-open').on('click', function (event) {
    var currentRating = $(event.currentTarget).data('rating');
    app.toogleSelector(currentRating);
    app.openModal('#avaliar');
  });

};