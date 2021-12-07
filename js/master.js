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

let headerHeight = $('.header').height();
console.log("Height do header: " + headerHeight);

window.onload = function () {
  $('.banner-logo').css('margin-top', headerHeight + 25);
  $('.qtd-imoveis-disponiveis').css('margin-top', headerHeight + 25);
};
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


