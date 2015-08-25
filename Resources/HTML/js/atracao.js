var app = window.app || {};

app.loadAtracao = function() {
  var data;
  var slug = app.getParameterByName('slug');
  var url = app.vejaspApiUrl + "/atracoes/" + slug + "?transformacao_imagem=" + app.transformacao_imagem;
  
  app.loadByUrl({
    url: url,
    type: 'GET',
    dataType: 'json'
  }, function(data){
    app.atracao = data;
    app.renderAtracao(data);
  }, function(xhr, type){
    if(conexao){
      alert('Atração não encontrada.');
      app.backWindow();
    }
  });

  $("#atracao").css('min-height', $(window).height() - $('#atracao').offset().top);

  $('.submenu ul li a').click(function(e) {
    e.preventDefault();
    $('.submenu ul li a').removeClass("ativo");
    $('.infos .resenhas, .infos .avaliacoes').hide();
    $('.infos .' + $(this).attr("class")).show();
    $(this).addClass("ativo");
    return false;
  });

  app.showSalas(slug);
  return true;
};

app.getHtmlVideo = function(video,video_imagem) {
    return "<iframe width='320' height='190' src='"+video+"' frameborder='0' allowfullscreen onclick='app.eventAnalytics(\"Atração\",\"clique\",\"video-estab\",0);'></iframe>";
};

app.renderAtracao = function(atracao) {
  var image = "";
  var video = "";
  var data = "";
  var info = "";
  var d = new Date(atracao.data_ultima_atualizacao);
  var tipo = "";
  var autor = "";
  var resenha = "";
  var descricao = "";
  var typeClassRating = "";
  var nota_media = "";
  var typeClassAvaliacao = "";
  var nota_media_vejasp = "";
  var quantidade_avaliacoes = "";
  var txt_avaliacoes = "";

  if (app.notEmpty(atracao.video)) {
    video = app.getHtmlVideo(atracao.video,atracao.video_imagem);
  }else if (app.notEmpty(atracao.youtube_video)) {
    if (app.notEmpty(atracao.youtube_video)) {
      try{
        video_url = app.getYoutubeVideoHtml5(atracao.youtube_video);
        if(video_url !== ""){
          video_imagem = app.notEmpty(atracao.url_imagem_solicitada) ? atracao.url_imagem_solicitada : app.getYoutubeImagem(video_url);
          video = app.getHtmlVideo(video_url, video_imagem);
        }
      }
      catch(e){
        alert(e.message);
      }
    }
  }

  if (app.notEmpty(atracao.resenha_atual)) {
    autor = atracao.resenha_atual.critico;
    resenha = atracao.resenha_atual.texto;
  }
  if (app.notEmpty(atracao.descricao_atual)) {
    descricao = atracao.descricao_atual.texto;
  }

  if(app.notEmpty(atracao.avaliacao_editorial) && app.notEmpty(atracao.avaliacao_editorial.nota)){
    typeClassAvaliacao = atracao.avaliacao_editorial.nota===0 ? "icon-bomba" : "icon-bola-estrela";
    nota_media_vejasp = atracao.avaliacao_editorial.nota;
  }else{
    nota_media_vejasp = "none";
  }

  if (app.notEmpty(atracao.ratings) && app.notEmpty(atracao.ratings.media_das_notas)) {
    typeClassRating = atracao.ratings.media_das_notas===0 ? "icon-bomba" : "icon-estrela";
    nota_media = atracao.ratings.media_das_notas===0 ? 0 : Math.round(atracao.ratings.media_das_notas);
    quantidade_avaliacoes = atracao.ratings.quantidade_de_votos;
    txt_avaliacoes = quantidade_avaliacoes > 1 ? "avaliações" : "avaliação";
  } else {
    typeClassRating = "icon-estrela";
    nota_media = "none";
    quantidade_avaliacoes = "Sem";
    txt_avaliacoes = "avaliação";
  }
  count = 0;

  image = app.htmlParaConteudoRelacionado(atracao.conteudos_relacionados);

  if (app.notEmpty(atracao.avaliado_redacao)) {
    data += "<p class='rated-by-veja'>Avaliado por Veja SP</p>";
  }
  if (app.notEmpty(atracao.tipo_atracao)) {
    if(atracao.tipo_atracao.toLowerCase() == "filmes"){ 
      $("#programacao-botao").show();
    }
    data += (app.notEmpty(atracao.genero_atracao)) ? "<p class='categorias'>" + atracao.tipo_atracao + " > " + atracao.genero_atracao + "</p>" : "<p class='categorias'>" + atracao.tipo_atracao + "</p>";
  }
  data += "<h1 id='atracao-nome'>" + atracao.titulo + "</h1>";
  data += "</p>";
  data += "<p class='ratings'>";
  if (nota_media_vejasp!=="none") {
    data += "<span class='rating rating-vejasp rating-small'>";
    data += "<span class='"+typeClassAvaliacao+" rating-stars stars-"+nota_media_vejasp+"''></span>";
    data += "<span class='tagvejasp'>VEJASP</span>";
    data += "</span>";
  }
  data += "<span class='rating rating-small jsRating'>";
  data += "<span class='"+typeClassRating+" rating-stars stars-"+nota_media+"'></span>";
  data += "<span class='total-votes'>"+quantidade_avaliacoes+" "+txt_avaliacoes+"</span>";
  data += "</span>";
  data += "</p>";

  info += "<div class='resenhas'>";
  if (app.notEmpty(autor)) {
    info += "<h2 class='subtitle'>Resenha por " + autor + "</h2>";
  }
  if (app.notEmpty(resenha)) {
    info += "<div class='resenha'><p>" + app.TransformLinks(resenha) + "</p></div>";
  }
  if (app.notEmpty(descricao)) {
    info += "<div class='descricao'><p>" + app.TransformLinks(descricao) + "</p></div>";
  }

  var diretores = "";
  $.each(atracao.participantes.diretores, function(k, v) {
    diretores += v.nome + ", ";
  });

  if (app.notEmpty(diretores) && app.notEmpty(atracao.ficha_tecnica)) {
    info += "<div class='fichaTecnica'>";
    info += "<p class='titulo'>Ficha técnica</p>";
    info += "<p class='detalhes'>";
    if (app.notEmpty(diretores)) {
      diretores = diretores.substring(0, diretores.length - 2);
      info += "<strong>Direção:</strong> " + diretores + "<br>";
    }
    if (app.notEmpty(atracao.ficha_tecnica)) {
      if (app.notEmpty(atracao.ficha_tecnica.duracao))
        info += "<strong>Duração:</strong> " + atracao.ficha_tecnica.duracao + " minutos<br>";
      if (app.notEmpty(atracao.ficha_tecnica.censura))
        info += "<strong>Recomendação:</strong> " + atracao.ficha_tecnica.censura + "<br>";
      if (app.notEmpty(atracao.ficha_tecnica.pais))
        info += "<strong>Pais/Ano:</strong> " + atracao.ficha_tecnica.pais + "/" + atracao.ficha_tecnica.ano;
    }
    info += "</p>";
    info += "</div>";
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

  if (quantidade_avaliacoes) {
    info += "<h2 class='subtitle'>";
    info += (typeof quantidade_avaliacoes == "number" ? quantidade_avaliacoes + " " + txt_avaliacoes : "Não há opiniões");
    if (typeof nota_media == "number")
      info += "<div class='rating'><span aria-describedby='users-rating-" + nota_media + "' class='rating-stars stars-" + nota_media + " update' href='#'></span></div>";

    info += "</h2>";
    info += "<div class='abril-comentarios-widget'></div>";

    if (typeof quantidade_avaliacoes == "number")
      $('a.avaliacoes').html($('a.avaliacoes').html() + " (" + quantidade_avaliacoes + ")");
  }

  info += "</div>";

  if (video != "") {
    image_transform = "<div class='video-estab'>" + video + "</div>";
  } else {
    image_transform = '<div class="imagem-estab">' + image + '</div>';
  }

  app.pageviewAnalytics("atracoes/"+atracao.slug,atracao.titulo+" - Atração");

  $(".midia-atracao").html(image_transform);
  app.VideoHtml = $(".video-estab").html();

  $(".detalhes").append(data);
  $(".infos").append(info);

  if(typeof quantidade_avaliacoes == 'number') Comentarios.init(atracao.id, '.abril-comentarios-widget');

  if (!resenha && !descricao) {
    $('.submenu .resenhas').hide();
    $('.submenu ul li a').removeClass("ativo");
    $('.submenu ul li a.avaliacoes').addClass("ativo");
    $('.infos .avaliacoes').show();
  }

  $(".award a").click(function(e) {
    e.preventDefault();
    $(this).parent().toggleClass("award-open");
  });

  app.setupSwipeGallery();
  $('.m-carousel').on('afterSlide', function(p){
    app.eventAnalytics('Atração','clique','galeria-foto-'+p._args[1]+'-'+atracao.slug+'-atracao',0);
  });

  $('.rating-open').on('click', function (event) {
    var currentRating = $(event.currentTarget).data('rating');
    app.toogleSelector(currentRating);
    app.openModal('#avaliar');
  });
};