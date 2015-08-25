var app = window.app || {};

Date.prototype.monthNames = [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ];
Date.prototype.daysNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
Date.prototype.formataAteData = function() {
  return  "Até " + this.getDate() + " de " + this.monthNames[this.getMonth()];
};

Date.prototype.formataData  = function(tipo){
  return  this.getDate() + " de " + this.monthNames[this.getMonth()];
};

Date.prototype.diaMesExtenso = function() {
  return  this.getDate() + " de " + this.monthNames[this.getMonth()];
};

Date.prototype.diaSemanaExtenso = function() {
  return this.daysNames[this.getDay()];
};

Date.prototype.futureDate = function() {
  var now = new Date();
  if(this.getTime() > now.getTime()){
      return true;
  }
  return false;
};

app.showProgramacao = function(slug){
  $('#programacao-botao, .abrir-modal').hide();
  var url = app.vejaspApiUrl + "/estabelecimentos/"+slug+"/eventos?transformacao_imagem=app_mobile_110xauto";
  
  app.loadByUrl({
    type: 'GET',
    url: url,
    dataType: 'json',
  }, function(data){
    app.renderEventoEstabelecimento(data.resultado,slug);
    //app.pageviewAnalytics("eventos/"+slug,"Eventos");
  }, function(xhr, type){
    if(conexao){
      alert('Evento não encontrado.');
    }
  });
};

app.showSalas = function(slug){
  $('.abrir-modal').hide();
  var url = app.vejaspApiUrl + "/atracoes/"+slug+"/eventos";
  
  app.loadByUrl({
    type: 'GET',
    url: url,
    dataType: 'json',
  }, function(data){
    app.renderEventoAtracao(data.resultado,slug);
    //app.pageviewAnalytics("eventos/"+slug,"Eventos");
  }, function(xhr, type){
    if(conexao){
      alert('Evento não encontrado.');
    }
  });
};

app.renderEventoEstabelecimento = function(eventos,slug){

  var html = "";

  $(eventos).each(function(i, evento){
    var cinema = "";
    if(evento.atracao.tipo_atracao != "Filmes"){
      if(app.notEmpty(evento.atracao.eventos)){
        $(evento.atracao.eventos).each(function(i,ev){
          if(app.notEmpty(ev.periodo.fim)){
            var dataFinal = app.parseData(ev.periodo.fim);
            html += "<h3>"+dataFinal.formataAteData()+"</h3>";
          }
        });
      }
    } else {
      cinema = "cinema";
    }

    if (app.notEmpty(evento.atracao.ratings.media_das_notas)) {
      typeClassRating = evento.atracao.ratings.media_das_notas===0 ? "icon-bomba" : "icon-estrela";
      nota_media = Math.round(evento.atracao.ratings.media_das_notas);
      quantidade_avaliacoes = evento.atracao.ratings.quantidade_de_votos;
      txt_avaliacoes = quantidade_avaliacoes > 1 ? "avaliações" : "avaliação";
    } else {
      typeClassRating = "icon-estrela";
      nota_media = "none";
      quantidade_avaliacoes = "Sem";
      txt_avaliacoes = "avaliação";
    }

    html += "<div class='atracao "+cinema+"'>";
    if(app.notEmpty(evento.atracao.url_imagem_solicitada)){
      html += "<div class='atracao-poster'>";
      html += "<img src='" + evento.atracao.url_imagem_solicitada + "' alt='poster' class='atracao-poster'>";
      if(evento.atracao.tipo_atracao == "Filmes"){
        $('#programacao .separator').hide();
      }
      html += "</div>";
    }
    html += "<div class='atracao-descricao'>";

    if(evento.atracao.tipo_atracao == "Filmes"){
      $('.modal #programacao .modal-title div').html("PROGRAMAÇÃO DA SEMANA");

      if(evento.status_exibicao == "pré-estreia"){
        html += "<p class='badge pre-release'>Pré-estreia</p>";
      }
      else if(evento.status_exibicao == "estreia"){
        html += "<p class='badge release'>Estreia</p>";
      }

      if(app.notEmpty(evento.atracao.genero)){
        html += "<p class='categorias'>" + evento.atracao.genero + "</p>";
      }
    }
    else{
      if(app.notEmpty(evento.atracao.tipo_atracao)){
        html += (app.notEmpty(evento.atracao.genero)) ? "<p class='categorias'>" + evento.atracao.tipo_atracao + " > " + evento.atracao.genero + "</p>" : "<p class='categorias'>" + evento.atracao.tipo_atracao + "</p>";
      }
    }

    if(app.notEmpty(evento.atracao.nome)){
      html += "<p class='titulo'><a href='javascript:app.openInternalLink(\'atracao.html?slug="+evento.atracao.slug+"\')'>"+evento.atracao.nome+"</a></p>";
    }


    if(app.notEmpty(evento.atracao.ficha_tecnica.censura)){
      html += "<p class='categorias'>"+evento.atracao.ficha_tecnica.censura;
      if(app.notEmpty(evento.atracao.ficha_tecnica.duracao)){
        html += " - "+evento.atracao.ficha_tecnica.duracao+" min";
      }
      html += "</p>";
    }

    if (app.notEmpty(evento.atracao.avaliacao_editorial)) {
      typeClassAvaliacao = evento.atracao.avaliacao_editorial===0 ? "icon-bomba" : "icon-bola-estrela";
      html += "<p class='rating rating-vejasp rating-small'>";
      html += "<span class='"+typeClassAvaliacao+" rating-stars stars-"+evento.atracao.avaliacao_editorial+"'></span><span class='total-votes total-votes'>VEJA SP</span>";
      html += "</p>";
    }

    html += "<p class='rating rating-small'>";
    html += "<span class='"+typeClassRating+" rating-stars stars-" + nota_media + "'></span><a href='#' class='total-votes'>(" + quantidade_avaliacoes + " " + txt_avaliacoes + ")</a>";
    html += "</p>";

    $.each(evento.atracao.eventos, function(i, ev) {
      $.each(ev.ingressos, function(index, ingresso){
        if (app.notEmpty(ingresso.preco) && app.notEmpty(ingresso.descricao)) {
          html += "<p class='preco'><b>"+ingresso.descricao+":</b> R$ "+app.moeda(ingresso.preco)+"</p>";
        }else if(ingresso.descricao === 'Grátis'){
          html += "<p class='preco'><b>Preço:</b> Grátis</p>";
        }
      });
    });

    if (app.notEmpty(evento.tipo)) {
      var efeitos = "- ";
      $(evento.efeitos).each(function(i, efeito){
        efeitos += efeito + ", ";
      });
      efeitos = efeitos.substring(0, efeitos.length-2);

      html += "<p style='text-transform:capitalize'>"+evento.tipo+" "+efeitos+"</p>";
    }

    if(app.notEmpty(evento.atracao.eventos)){
      $(evento.atracao.eventos).each(function(i,ev){
        if(i===0 && evento.atracao.tipo_atracao == "Filmes" && app.notEmpty(ev.periodo.inicio) && app.notEmpty(ev.periodo.fim)){
          html += "<p><strong>Período:</strong> De "+app.parseData(ev.periodo.inicio).diaMesExtenso()+" a "+app.parseData(ev.periodo.fim).diaMesExtenso()+"</p>";
        }
        html += "<p>";
        if (app.notEmpty(ev.sala)) {
          html += "<b>"+ev.sala+" - "+ev.tipo+"</b>";
        }
        if(app.notEmpty(ev.periodo.horario)){
          html += ev.periodo.horario;
        }
        html += "</p>";
        if(app.notEmpty(ev.observacoes)){
          html += "<p><b>Observações:</b> "+ev.observacoes+"</p>";
        }
      });

    }

    html += "</div>";
    html += "</div>";
  });

  $('#salas-de-cinema .modal-content, #programacao .modal-content').append(html);

  app.setupModal(slug);


  if(!eventos || eventos.length < 1){
    $('#programacao-botao, .abrir-modal').hide();
    return;
  }
  $('#programacao-botao, .abrir-modal').show();

};
app.parseData = function(data){
  if(!data) return false;
  var dataP = data.split("-");
  return new Date(dataP[0], dataP[1] - 1, dataP[2]);
};

app.renderEventoAtracao = function(eventos,slug){
  $('#atracao .options').hide();
  if(!eventos || eventos.length < 1){
    $('#atracao .abrir-modal').hide();
    $('#atracao').css('padding', '0!important');
    $('#atracao').css('padding', '0!important');
    $('#atracao .wrapper').css('margin-top', '20px!important');
    return;
  }

  var html = "";
  var dataFinal = null;
  var dataInicio = null;
  $(eventos).each(function(i, evento){
    dataInicio = app.parseData(evento.estabelecimento.eventos[0].periodo.inicio);
    if(dataFinal !== null && dataFinal < app.parseData(evento.estabelecimento.eventos[0].periodo.fim)){
      dataFinal = app.parseData(evento.estabelecimento.eventos[0].periodo.fim);
    }
    else if(dataFinal === null){
      dataFinal = app.parseData(evento.estabelecimento.eventos[0].periodo.fim);
    }

    html += "<div class='folder'>";
    html += "<a href='' class='folder-title'><span class='folder-title'>" + evento.estabelecimento.nome + "</span></a>";
    html += "<div class='folder-description'>";
    html += "<p>" + evento.estabelecimento.endereco.tipo_logradouro + " " + evento.estabelecimento.endereco.logradouro + ", " + evento.estabelecimento.endereco.numero + " - " + evento.estabelecimento.endereco.bairro + " - " + evento.estabelecimento.endereco.cidade + " - " + evento.estabelecimento.endereco.estado;
    if(app.notEmpty(evento.estabelecimento.telefones)){
      html += " - Tel.: " + app.mascaraTelefone(evento.estabelecimento.telefones.principal);
    }
    html += "</p>";

    if (app.notEmpty(evento.estabelecimento.ratings.media_das_notas)) {
      typeClassRating = evento.estabelecimento.ratings.media_das_notas===0 ? "icon-bomba" : "icon-estrela";
      nota_media = Math.round(evento.estabelecimento.ratings.media_das_notas);
      quantidade_avaliacoes = evento.estabelecimento.ratings.quantidade_de_votos;
      txt_avaliacoes = quantidade_avaliacoes > 1 ? "avaliações" : "avaliação";
    } else {
      typeClassRating = "icon-estrela";
      nota_media = "none";
      quantidade_avaliacoes = "Sem";
      txt_avaliacoes = "avaliação";
    }

    html += "<p class='rating rating-small'>";
    html += "<span class='"+typeClassRating+" rating-stars stars-" + nota_media + "'></span><span class='total-votes no-votes'>(" + quantidade_avaliacoes + " " + txt_avaliacoes + ")</span>";
    html += "</p>";

    $.each(evento.estabelecimento.eventos, function(i, ev) {
      $.each(ev.ingressos, function(index, ingresso){
        if (app.notEmpty(ingresso.preco) && app.notEmpty(ingresso.descricao)) {
          html += "<p class='preco'><b>"+ingresso.descricao+":</b> R$ "+app.moeda(ingresso.preco)+"</p>";
        }else if(!app.notEmpty(ingresso.preco) && ingresso.descricao === 'Grátis'){
          html += "<p class='preco'><b>Preço:</b> Grátis</p>";
        }
      });
    });

    html += "<a href='javascript:void(0);' onclick=\"app.eventAnalytics('Atração','clique','mais-sobre-local-"+slug+"',0);app.openInternalLink('estabelecimento.html?slug="+ evento.estabelecimento.slug +"');\">+ sobre o local</a>";

    var eventoEstab = evento.estabelecimento.eventos;
    if(app.notEmpty(eventoEstab)){
      $(eventoEstab).each(function(i,s){

        if(app.notEmpty(s.sala) || app.notEmpty(s.periodo) && app.notEmpty(s.periodo.horario)){
          html += "<div class='separator-dotted'></div>";
        }

        html += "<div class='folder-title'>";
        if (app.notEmpty(s.sala)) {
          html += "<b>" + s.sala + " - "+s.tipo+"</b> ";
        }
        html += "</div>";

        if (app.notEmpty(s.periodo) && app.notEmpty(s.periodo.horario)) {
          html += "<span>" + s.periodo.horario + "</span>";
        }

      });
    }

    html += "</div>";
    html += "</div>";
    html += "</div>";
  });

  $('#salas-de-cinema .modal-content').append(html);

  if(!dataInicio && dataFinal){
    $('#salas-de-cinema .separator').html(dataFinal.formataAteData());
    $('#atracao .options').show();
  }

  if(dataInicio && !dataFinal){
    $('#salas-de-cinema .separator').html("A partir de " + dataInicio.formataData());
    $('#atracao .options').show();
  }

  if(dataInicio && dataFinal){
    if(+dataInicio === +dataFinal){
      $('#salas-de-cinema .separator').html("Em "+dataFinal.formataData());
      $('#atracao .options').show();
    }
    else if(dataInicio.futureDate()){
      $('#salas-de-cinema .separator').html("De "+dataInicio.formataData()+" a "+dataFinal.formataData());
      $('#atracao .options').show();
    }else if(!dataInicio.futureDate()){
      $('#salas-de-cinema .separator').html(dataFinal.formataAteData());
      $('#atracao .options').show();
  }else{
    $('#atracao .options').hide();
  }
  }

  if ($('#atracao .options').css('display') == "none") {
    $('#atracao').css('padding', '20px 0 20px');
  }

  $('.abrir-modal').show();

  app.setupModal(slug);
};
