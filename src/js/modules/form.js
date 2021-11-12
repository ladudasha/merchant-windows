export default function form() {
	if (document.getElementById('form')) {
		const form = document.getElementById('form');
		const input = document.querySelector('._req');

		window.addEventListener('click', (e) => {
			if (e.target.classList.contains('header__form') || e.target.classList.contains('_req')) {
				form.classList.add('active');
			} else {
				form.classList.remove('active');
				input.value = '';
				input.blur();
			}
		});

		window.addEventListener('keydown', (e) => {
			if (e.code === 'Escape' && form.classList.contains('active')) {
				form.classList.remove('active');
				input.value = '';
				input.blur();
			}
		});
	}
}