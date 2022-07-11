function yz_roll_banner(){
  $('.boxImgWrap').append($('.boxImgWrap img:first').clone());
  // console.log($('.boxImgWrap img').width($('.yz_boxWrap').width()));
  $('.boxImgWrap img').width($('.yz_boxWrap').width());
  $('.boxImgWrap').width($('.boxImgWrap img').length*$('.yz_boxWrap').width());
  var i = 0;
  // roll function
  function banner(){
    $('.boxImgWrap').stop().animate({'left':-i*600+'px'},500);
    if(i==$('.boxImgWrap img').length-1){
      i=0;
      $('.boxImgWrap').animate({'left':'0px'},1);
    }
    $('.boxBottomNav a').eq(i).css('background-color','#f00').siblings().css('background-color','rgba(200,200,200,0.5)');
  }
  // bottom nav
  $('.yz_boxWrap').append('<div class="boxBottomNav"><div></div></div>');
  for(var j=0;j<$('.boxImgWrap img').length-1;j++){
    $('.boxBottomNav div').append('<a href="javascript:void(0);"></a>');
  }
  $('.boxBottomNav a').click(function(){
    i=$(this).index();
    banner();
  })
  // next/prev button
  $('.yz_boxWrap').append('<div class="nav prev"><</div><div class="nav next">></div>');
  $('.yz_boxWrap').hover(function(){
    $('.nav').stop().fadeToggle();
  });
  $('.prev').click(function(){
    if(i==0){
      i=$('.boxImgWrap img').length-1;
      $('.boxImgWrap').css('left',-i*600+'px');
    }
    i--;
    banner();
  })
  $('.next').click(function(){
    i++;
    banner();
  })
  // auto play
  banner();
  var timer = setInterval(function(){
    i++;
    banner();
  },4000);
  $('.yz_boxWrap').hover(function(){
    clearInterval(timer);
  },function(){
    timer = setInterval(function(){
      i++;
      banner();
    },4000);
  })
}