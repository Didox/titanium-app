var app = window.app || {};

app.filmePage       = 1;
app.perPage         = 18;
app.sOffset         = 200;
app.alreadyLoading  = false;
app.loadEverything  = false;

app.loadSalas = function(){

}

app.loadFilmes = function(more) {
  if(app.loadEverything) return;
  var carregandoHtml = '<p class="carregando">Carregando...</p>';
  if(!more) $('#cinema').append(carregandoHtml);
  else $('#listaCartaz').append(carregandoHtml);
  app.alreadyLoading = true;
  var url = app.vejaspApiUrl + "/atracoes/ativas?pw="+ app.filmePage +"&per_page="+ app.perPage +"&editoria_padrao=Cinema&order=status,nome&transformacao_imagem=app_mobile_110xauto";
  
  app.loadByUrl({
    type: 'GET',
    url: url,
    dataType: 'json'
  }, function(data){
    if(!more){
      app.renderFilmes(filmes);
    }
    else{
      app.renderMoreFilmes(filmes);
    }
    $('#cinema .carregando').remove();
    app.filmePage += 1;
    app.alreadyLoading = false;
    if($('#listaEstreias li, #listaCartaz li').size() >= filmes.total_resultados){
      app.loadEverything = true;
    }
  }, function(xhr, type){
    console.log('Erro ao buscar filmes em cartaz.');
  });
};

app.htmlRating = function(filme) {
  if(app.empty(filme)) return "";

  if(app.notEmpty(filme.ratings.media_das_notas)) {
    if(filme.ratings.media_das_notas===0) nota_media = "bomba";
    else nota_media = Math.round(filme.ratings.media_das_notas);
    quantidade_avaliacoes = filme.ratings.quantidade_de_votos;
  }
  else{
    nota_media = "none";
    quantidade_avaliacoes = "";
  }
  if(app.notEmpty(filme.avaliacao.nota)){
    if(filme.avaliacao.nota===0) nota_media_vejasp = "bomba";
    else nota_media_vejasp = filme.avaliacao.nota;
  }
  else nota_media_vejasp = "none";
  var avaliacoesHtml = '<span class="avaliacoes">';
  avaliacoesHtml += '<span class="avaliacao vejaSp">';
  avaliacoesHtml += '<span class="estrelas estrela-'+ nota_media_vejasp +'"></span>';
  avaliacoesHtml += '<span class="avaliadoPor">Veja SP</span>';
  avaliacoesHtml += '</span>';
  avaliacoesHtml += '<span class="avaliacao usuario">';
  avaliacoesHtml += '<span class="estrelas estrela-' + nota_media + '"></span>';
  if(quantidade_avaliacoes !== ''){
    avaliacoesHtml += '<span class="avaliadoPor">('+ quantidade_avaliacoes +')</span>';
  }
  avaliacoesHtml += '</span>';
  avaliacoesHtml += '</span>';
  return avaliacoesHtml;
};

app.renderItemLista = function(filme) {
  if(app.empty(filme)) return "";
  var imagem = app.notEmpty(filme.url_imagem_capa) ? '<img src="'+ filme.url_imagem_capa +'" alt="'+ filme.nome +'">' : '';
  var htmlItemCartaz = '<li>';
  htmlItemCartaz += '<a href="javascript:app.openInternalLink(\'atracao.html?slug=' + filme.slug + '\')">';
  htmlItemCartaz += '<span class="categoria"  onclick="app.eventAnalytics(\'Cinema\',\'clique\',\'selo-status-grid\',0)">' + (filme.status === '' ? 'Em cartaz' : filme.status) + '</span>';
  htmlItemCartaz += '<span class="imagem" onclick="app.eventAnalytics(\'Cinema\',\'clique\',\'foto-card-grid\',0)">' + imagem + '</span>';
  htmlItemCartaz += '<span class="titulo" onclick="app.typeView();">'+ filme.nome +'</span>';
  htmlItemCartaz += app.htmlRating(filme);
  htmlItemCartaz += '</a>';
  htmlItemCartaz += '</li>';
  return htmlItemCartaz;
};

app.typeView = function(){
  if($("#listaEstreias").hasClass("lista")){
    app.eventAnalytics('Cinema','clique','titulo-card-lista',0);
  }else{
    app.eventAnalytics('Cinema','clique','titulo-card-grid',0);
  }
};

app.renderFilmes = function(filmes) {
  if(app.notEmpty(filmes) && app.notEmpty(filmes.resultado)){
    var htmlItemEstreia = '';
    var htmlItemCartaz = '';
    var avaliacoesHtml = '<div class="cards estreias">';
    avaliacoesHtml += '<p class="titulo">Pré-estreias e estreias</p>';
    avaliacoesHtml += '<ul id="listaEstreias"></ul>';
    avaliacoesHtml += '</div>';
    avaliacoesHtml += '<div class="cards emCartaz">';
    avaliacoesHtml += '<p class="titulo">Em cartaz</p>';
    avaliacoesHtml += '<ul id="listaCartaz"></ul>';
    avaliacoesHtml += '</div>';
    $('#cinema').append(avaliacoesHtml);
    $(filmes.resultado).each(function(i,filme){
      if(filme.status !== ''){
        htmlItemEstreia += app.renderItemLista(filme);
      }
      else{
        htmlItemCartaz += app.renderItemLista(filme);
      }
    });
    $('#listaEstreias').html(htmlItemEstreia);
    $('#listaCartaz').html(htmlItemCartaz);
  }
};

app.renderMoreFilmes = function(filmes) {
  if(app.notEmpty(filmes) && app.notEmpty(filmes.resultado)){
    var htmlItemCartaz = '';
    $(filmes.resultado).each(function(i,filme){
      htmlItemCartaz += app.renderItemLista(filme);
    });
    $('#listaCartaz').append(htmlItemCartaz);
  }
};

app.scroll = function(){
  if(app.alreadyLoading) return;
  var wScroll = $(window).scrollTop(),
    wHeight = $(window).height(),
    bHeight = $(document.body).height();
  if(wScroll + wHeight + app.sOffset >= bHeight) app.loadFilmes(true);
};

app.iniciarCinema = function(){
  app.loadFilmes(false);
  $('#cinema .alternar input').click(function(){
    $('#cinema .cards ul').toggleClass('lista');
  });
};

app.toogleCinema = function() {
  var checked = $('#cinema .alternar input').prop('checked');
  $('#cinema .alternar input').prop('checked', !checked);
  $('#cinema .alternar input').trigger('change');
  return checked;
}

app.seleciona = function(){
  $('#cinema .alternar input').on('change', function(event) {
    if (event.target.checked) {
      $('#listaEstreias').hide();
      $('.emCartaz').hide();
      $('#listaSalas').show();
      $('#filmes-btn').removeClass('selecionado');
      $('#salas-btn').addClass('selecionado');
      $('.icon-filtro').show();
    } else {
      $('#filmes-btn').addClass('selecionado');
      $('#salas-btn').removeClass('selecionado');
      $('#listaSalas').hide();
      $('#listaEstreias').show();
      $('.emCartaz').show();
      $('.icon-filtro').hide();
    }
  });
}

$(document).ready(function(){
  app.iniciarCinema();
  app.seleciona();
  $(window).on('scroll.filmes', app.scroll);
});