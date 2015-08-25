window.RESTORANDO = window.RESTORANDO || {};
var RESTORANDO = window.RESTORANDO;
var app = window.app;

RESTORANDO = {

  /**
  * Local variables
  *
  **/
  restaurant_id: null,

  date:function(){
    return $('#dates-list li a.selected').data('date');
  },
  diners:function(){
    return $('#diners-list li a.selected').text();
  },
  time:function(){
    return $('#times-list li a.selected').data('time');
  },
  campaign:function(){
    return $('#times-list li a.selected').data('campaign');
  },
  inputParam:function(param){
    return $('#input-' + param).attr('value');
  },
  setupLabels:function(){
    diners = this.diners();

    if (diners > 1 )
      labelDiners = diners + " pessoas";
    else
      labelDiners = diners + " pessoa";

    $('.label-diners').text( labelDiners );
    $('.label-date').text( $('#dates-list li a.selected').text() );
    $('.label-time').text( this.time() );
  },

  /**
  * Verify if establishment has reference at Restorando
  *
  **/
  verify:function(slug){
    $.getJSON(app.vejaspApiUrl+'/restorando/restaurants/'+slug+'/alexandria', function(data){
      RESTORANDO.restaurant_id = data.restaurant.id;

      $('.restaurant-name').text( data.restaurant.name );

      $('#restorando input').on('keyup', function(){
        RESTORANDO.validPersonalData();
      });

      RESTORANDO.loadLocalStorage();

      $('#reservar-mesa-botao').show();
      $('#reservar-mesa-botao a').on('click', RESTORANDO.show );
    });
  },

  /**
  * Setup Restorando and show modal
  *
  **/
  show:function(){
    this.loadOptions();

    this.goToStep(0);
    $('.combo-list').hide();
    $('#selectors li a').removeClass('selected');
    $('#restorando .title').removeClass('ativado');
    $('#selectors-button').prop( 'disabled', true );
    $('#confirmation-comments').hide();
    $('#estabelecimento, header').hide();

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    $('#restorando').css({
      'display': 'block',
      'height': h + 'px',
      'width': w + 'px'
    });
  },

  /**
  * Close Restorando window
  *
  **/
  close:function(){
    $('#restorando').hide()
    $('#estabelecimento, header').css('display', 'block');
  },

  /**
  * Go to a step by index
  *
  **/
  goToStep:function(index){
    var steps = $('.step')
    steps.hide();
    $(steps.get(index)).show();
  },

  /**
  * Load options based on restaurant restrictions
  *
  **/
  loadOptions:function(slug){
    slug = RESTORANDO.restaurant_id;
    $.getJSON(app.vejaspApiUrl+'/restorando/restaurants/'+slug+'/restrictions', function(data){
      unavailables = data.booking_restrictions.unavailable_dates;
      min_diners = data.booking_restrictions.min_party_size;
      max_diners = data.booking_restrictions.max_party_size;

      $('#dates-list').children().remove();
      $('#diners-list').children().remove();

      var date = new Date();
      for(var i=0; i<15; i++){
        date.setDate(date.getDate() + 1);
        dateISO = date.toISOString().split('T')[0];
        dateLabel = date.diaSemanaExtenso() + ", " + date.diaMesExtenso();
        if (unavailables.indexOf(dateISO) == -1) {
          $('#dates-list').append('<li><a href="javascript:;" onclick="javascript:RESTORANDO.toogleSelector(event)" data-date="'+dateISO+'">'+dateLabel+'</a></li>')
        }
      }

      for(var qtt=min_diners; qtt<=max_diners; qtt++){
        $('#diners-list').append('<li><a href="javascript:;" onclick="javascript:RESTORANDO.toogleSelector(event)">'+qtt+'</a></li>')
      }

    });
  },

  /**
  * Load personal user data by local storage
  *
  **/
  loadLocalStorage:function(){

    if (!localStorage['restorando'])
      return;

    var storage = JSON.parse( localStorage['restorando'] );

    $('#input-first_name').val( storage.customer_first_name );
    $('#input-last_name').val( storage.customer_last_name );
    $('#input-email').val( storage.customer_email );
    $('#input-phone').val( storage.customer_phone );

    this.validPersonalData();
  },

  /**
  * Toogle selector combo
  *
  **/
  toogleCombo:function(event){
    var parent = $(event.target).parent();
    var div = parent.parent()
    var opened = parent.hasClass('ativado')

    if (opened) {
      parent.removeClass('ativado');
      div.children('ul').hide()
    } else {
      parent.addClass('ativado');
      div.children('ul').show();
    }
  },

  /**
  * Tootle selector option
  *
  **/
  toogleSelector:function(event){
    var obj = $(event.target);
    var selected = obj.hasClass('selected');

    if(selected)
      obj.removeClass('selected');
    else
      obj.addClass('selected');

    selected = !selected;

    obj.parent().parent().children().each(function(){
      if (selected && !$(this.children[0]).hasClass('selected'))
        $(this).hide();
      else
        $(this).show();
    });

    $("#selectors-button").prop( "disabled", true );

    if (obj.parent().hasClass('time') && selected) {
      this.setupLabels();
      $("#selectors-button").prop( "disabled", false );
    } else {
      this.loadTimes();
    }
  },

  /**
  * Load times based on date and diners selectors
  *
  **/
  loadTimes:function(){
    if (!this.date() || !this.diners()) {
      $('#times-list').hide();
      $('#times-list').children().remove();
      $('#times-selector .title').removeClass('ativado');
      return;
    }

    var params = '?date=' + this.date() + '&diners=' + this.diners();
    var url = app.vejaspApiUrl+'/restorando/restaurants/'+this.restaurant_id+'/availabilities'+params;
    $.getJSON(url, function(data){
      $('#times-list').children().remove();
      data.availability.times.forEach(function(opt){
        var timeLabel = opt.time;
        var timeData = opt.time;
        var campaign = opt.campaign_id;

        if (opt.discount)
          timeLabel += " (" + opt.discount + "%)";

        $('#times-list').append('<li class="time"><a href="javascript:;" onclick="javascript:RESTORANDO.toogleSelector(event)" data-time="'+timeData+'" data-campaign="'+campaign+'">'+timeLabel+'</a></li>')
      });
      $('#times-selector .title').addClass('ativado');
      $('#times-list').show();
    });
  },

  /**
  * Valid personal data, if ok book-button enable
  *
  **/
  validPersonalData:function() {
    var valid = false;

    if ($('#input-first_name').val()
        && $('#input-last_name').val()
        && $('#input-email').val()
        && $('#input-phone').val() )
      valid = true;

    $('#book-button').prop('disabled', !valid);
  },

  /**
  * Book a reservation
  *
  **/
  book:function(e){

    e.preventDefault();

    this.goToStep(2);

    requestParams = {
      'restaurant_id': this.restaurant_id,
      'date': this.date(),
      'time': this.time(),
      'diners': this.diners(),
      'comments': this.inputParam('comments'),
      'customer[email]': this.inputParam('email'),
      'customer[first_name]': this.inputParam('first_name'),
      'customer[last_name]': this.inputParam('last_name'),
      'customer[phone]': this.inputParam('phone')
    }

    if (parseInt( this.campaign() ))
      requestParams['campaign_id'] = this.campaign();

    localStorage['restorando'] = JSON.stringify({
      customer_first_name: this.inputParam('first_name'),
      customer_last_name: this.inputParam('last_name'),
      customer_email: this.inputParam('email'),
      customer_phone: this.inputParam('phone')
    });

    app.loadByUrl({
      type: 'POST',
      url: app.vejaspApiUrl + '/restorando/reservations',
      data: requestParams,
      dataType: 'json'
    }, function(data){
      var reservation = data.reservation;
      var customer = reservation.customer;
      var bookDate = new Date(reservation.datetime);
      var time = bookDate.getHours() + ":" + bookDate.toTimeString().split(":")[1];

      $('#book-date').text( bookDate.diaSemanaExtenso() + ", " + bookDate.diaMesExtenso() + " às " + time );
      $('#book-diners').text( reservation.diners + " pessoas" );
      $('#book-reservation_number').text( reservation.reservation_number );
      $('#book-customer_name').text( customer.first_name + " " + customer.last_name );
      $('#book-customer_email').text( customer.email );
      $('#book-customer_phone').text( customer.phone );

      if (reservation.comments.length) {
        $('#book-comments').text( reservation.comments );
        $('#confirmation-comments').show()
      }

      RESTORANDO.goToStep(3);
    }, function(xhr, type){
      $('#errors-list').children().remove();

      var errors = JSON.parse(xhr.responseText).errors;

      errors.forEach(function(error) {
        $('#errors-list').append('<li>' + error + "</li>");
      });

      RESTORANDO.goToStep(4);
    });
  }
}