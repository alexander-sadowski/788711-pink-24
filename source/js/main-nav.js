let page = document.querySelector('.page');
let navMain = document.querySelector('.main-nav');
let navToggle = document.querySelector('.main-nav__toggle');

page.classList.remove('no-js');
navMain.classList.remove('main-nav--opened');

navToggle.onclick = function() {
  navMain.classList.toggle('main-nav--opened');
  navToggle.classList.toggle('main-nav__toggle--opened');
};
