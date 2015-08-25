var app = window.app || {};

$('.rating-selector').on('click', function (event) {
  var currentRating = $(event.currentTarget).data('rating');
  app.toogleSelector(currentRating);
});

app.toogleSelector = function(currentRating) {
  var oldRating     = $('.rating-selector.active').last().data('rating');
  var bomba         = $('.rating-selector').has('span.icon-bomba');
  var estrelas      = $('.rating-selector').has('span.icon-estrela');

  if (currentRating == 0) {
    if (bomba.hasClass('active')) {
      bomba.removeClass('active');
    } else {
      estrelas.removeClass('active');
      bomba.addClass('active');
    }

  } else {
    bomba.removeClass('active');
    estrelas.removeClass('active');

    if (currentRating != oldRating) {
      for(var i=1; i<=currentRating; i++)
        $('.rating-selector').eq(i).addClass('active');
    }
  }

};

app.mockComments = function(nome, comentario, img, estrela){
  if(img == null){
    img = 'data:image/gif;base64,R0lGODlhMgAyAIACANTU1P7+/iwAAAAAMgAyAAACfYyPqcvtD6OctNqLs958gw90FkiS4lOm4Mmobsgi7xsfMx3fOKu7da/6AVO5YaloXJ2SRx7z43zCRFLosjr1YLPa6lUafSKZY2MtQD6jh2obsG14w9e6Of1ml7fN6nSZHebXtTW4ZUVhODORWOfACJjwKCgpdkfJdpmpqVIAADs=';
  }
  if($('.abril-comentarios-widget ol').length > 0){
    $('ol').attr('data-page','1').first().prepend('<li><div><span class="abril-comentarios-avatar"><img src="'+img+'" alt="'+nome+'"></span><strong>'+nome+' </strong><abbr>há 1 minuto</abbr><span class="abril-comentarios-voto rating"><span class="icon-estrela rating-stars stars-'+estrela+'"></span></span></div><p>'+comentario+'</p></li>');
  }else{
    $('h2.subtitle').text('Avaliações');
    $('.abril-comentarios-widget').append('<ol data-page="1"><li><div><span class="abril-comentarios-avatar"><img src="'+img+'" alt="'+nome+'"></span><strong>'+nome+' </strong><abbr>há 1 minuto</abbr><span class="abril-comentarios-voto rating"><span class="icon-estrela rating-stars stars-'+estrela+'"></span></span></div><p>'+comentario+'</p></li></ol>');
  }
}

app.avaliar = function() {
  if (!app.getAbrilIdParams()) {
    app.loginLogout();
    return;
  }
  $("#enviarComentario").prop("disabled",true);
  var recurso_id, recurso_tipo, slug;
  if (app.estabelecimento) {
    recurso_tipo = 'estabelecimento';
    recurso_id = app.estabelecimento.id;
    slug = app.estabelecimento.slug;
  } else if (app.atracao) {
    recurso_tipo = 'atracao';
    recurso_id = app.atracao.id;
    slug = app.atracao.slug;
  }

  var requestParams = {
    abril_id: app.getAbrilIdParams().personId,
    nome: app.getAbrilIdParams().personName,
    email: app.getAbrilIdParams().personEmail,
    avatar: app.getAbrilIdParams().avatar,
    voto: $('.rating-selector.active').last().data('rating'),
    comentario: $('#comment-input').val(),
    recurso_id: recurso_id,
    recurso_tipo: recurso_tipo,
    url_origem: 'http://vejasp.abril.com.br/' + recurso_tipo + '/' + slug,
    ip: '10.10.10.10'
  };

  app.loadByUrl({
    url: app.vejaspApiUrl + '/rating/avaliar',
    type: 'POST',
    data: requestParams,
    dataType: 'json',
  }, function(data){
    app.closeModal();
    app.mockComments(requestParams.nome, requestParams.comentario, requestParams.avatar, requestParams.voto);
  }, function(xhr, type){
    $("#enviarComentario").prop("disabled",false);
    alert('Erro ao processar sua avaliação, verifique se todos os campos foram preenchidos corretamente!');
  });
};