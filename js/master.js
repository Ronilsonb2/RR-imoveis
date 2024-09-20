$('#nav-bar-toggle').click(function () {
  $('.menu-line').toggleClass('_open');
  $('.nav-bar').toggleClass('_open');
})

$('.nav-bar li').click(function(){ 
  $('.menu-line').removeClass('_open');
  $('.nav-bar').removeClass('_open');
});

window.addEventListener('scroll', function(e) {
  $('.menu-line').removeClass('_open');
  $('.nav-bar').removeClass('_open');
});


function initPosition(){
  let headerHeight = $('.header').height();
  $('.banner-logo').css('margin-top', headerHeight);
  // $('.qtd-imoveis-disponiveis').css('margin-top', headerHeight + 25);


  // $('.content-100').css('margin-top', headerHeight);

  setTimeout(function(){$('#body').addClass('_open'); }, 300);
}

$(document).ready(function() {
  setTimeout(function(){initPosition(); }, 500);
});
// Responsivo

if($(window).width() > 1000){
  $('.destaques-ofertas').slick({
    dots: true,
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    slidesToShow: 3,
    slidesToScroll: 3
  });
}
else{
  $('.destaques-ofertas').slick({
    dots: true,
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    slidesToShow: 1,
    slidesToScroll: 1
  });
}

  $('.carousel').slick({
    dots: true,
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    slidesToShow: 1,
    slidesToScroll: 1
  });


