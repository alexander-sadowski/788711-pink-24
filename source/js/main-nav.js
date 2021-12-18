var page = document.querySelector('.page');
var navMain = document.querySelector('.main-nav');
var navToggle = document.querySelector('.main-nav__toggle');

page.classList.remove('no-js');
navMain.classList.remove('main-nav--opened');

navToggle.onclick = function() {
  navMain.classList.toggle('main-nav--opened');
};
