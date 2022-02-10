
$('.filtro').click(function () {
  $('.form-lateral').toggleClass('_open');
  $('.filtro').toggleClass('_open');
});

$('.select-opcao').click(function(){

  $('#opcoes-compras').css('background-color', '#fff');
  $('#opcoes-alugar').css('background-color', '#fff');

  let id = ($(this).attr('id'));
  let aux = ("#"+id);

  $(aux).css('background-color', '#fff');

  $(aux).css('background-color', '#f0eae3');

});


$('#quartos div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);
  console.log("o id clicado foi:"+ aux);

  $(".quarto").css('background-color', '#fff');

  $(aux).css('background-color', '#cc5f56');
})

$('#suite div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);
  console.log("o id clicado foi:"+ aux);

  $(".suite").css('background-color', '#fff');

  $(aux).css('background-color', '#cc5f56');
})

$('#banheiro div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);
  console.log("o id clicado foi:"+ aux);

  $(".banheiro").css('background-color', '#fff');

  $(aux).css('background-color', '#cc5f56');
})

$('#vagas div').click(function(){
  let id = ($(this).attr('id'));
  let aux = ("#"+id);
  console.log("o id clicado foi:"+ aux);

  $(".vaga").css('background-color', '#fff');

  $(aux).css('background-color', '#cc5f56');
})
