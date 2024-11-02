
$('.filtro').click(function () {
  $('.form-lateral').toggleClass('_open');
  $('.filtro').toggleClass('_open');
});

$('.select-opcao').click(function(){

  $('#opcoes-compras').css({'background-color': 'transparent', 'color': '#fff'});
  $('#opcoes-alugar').css({'background-color': 'transparent', 'color': '#fff'});

  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(aux).css({'background-color': '#fff', 'color': 'black'});

});

$('#quartos div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(".quarto").css('background-color', 'transparent');

  $(aux).css('background-color', '#877b7b');
})

$('#suite div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(".suite").css('background-color', 'transparent');

  $(aux).css('background-color', '#877b7b');
})

$('#banheiro div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(".banheiro").css('background-color', 'transparent');

  $(aux).css('background-color', '#877b7b');
})

$('#vagas div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(".vaga").css('background-color', 'transparent');

  $(aux).css('background-color', '#877b7b');
})
