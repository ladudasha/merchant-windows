export default function mobileMenu() {
	if (document.getElementById('menu__button')) {
		 const hamburger = document.getElementById('menu__button');
		 const menu = document.querySelector('.menu-mobile');
		 const body = document.querySelector('body');

		 hamburger.addEventListener('click', () => {
			  hamburger.classList.toggle('active');
			  menu.classList.toggle('menu-mobile--open');
			  body.classList.toggle('no-scroll');
		 });

		 window.addEventListener('click', (e) => {
			  if (!e.target.classList.contains('menu-mobile--open') && !e.target.classList.contains('cmn-toggle-switch') && !e.target.matches('.toggle.menu')) {
					hamburger.classList.remove('active');
					menu.classList.remove('menu-mobile--open');
					body.classList.remove('no-scroll');
			  }

		 });
	}
}