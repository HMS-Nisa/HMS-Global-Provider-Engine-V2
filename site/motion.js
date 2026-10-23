// Subtle motion layer: scroll reveals with sibling stagger, and count-up
// stats. Vanilla port of the ReactBits FadeContent/AnimatedContent/CountUp
// patterns. Fully disabled under prefers-reduced-motion (the CSS side is
// gated too, so pages render normally without this file).
(function () {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (!('IntersectionObserver' in window)) return;

	var SELECTORS = [
		'.hero .eyebrow', '.hero h1', '.hero .lede', '.hero .ctas',
		'.page-hero h1', '.page-hero .lede', '.page-hero p', '.page-hero .ctas',
		'.sec-head', '.prod-card', '.kpis > div', '.stats > div',
		'.reach-copy', '.reach-map', '.country', '.trust > *',
		'.steps > li', '.cta-band', '.journey > li', '.j-side',
		'section .wrap > h2', 'section .wrap > .lede',
	];

	var els = Array.prototype.slice.call(document.querySelectorAll(SELECTORS.join(',')))
		// Nothing inside the mega menus: they live in a hidden dropdown and
		// would never intersect, staying invisible forever.
		.filter(function (el) { return !el.closest('.mm'); });

	els.forEach(function (el) { el.classList.add('rv'); });

	// Stagger siblings that reveal together (cards in a grid, KPI tiles).
	var groups = new Map();
	els.forEach(function (el) {
		var p = el.parentElement;
		if (!groups.has(p)) groups.set(p, []);
		groups.get(p).push(el);
	});
	groups.forEach(function (group) {
		group.forEach(function (el, i) {
			el.style.setProperty('--rvd', Math.min(i * 80, 400) + 'ms');
		});
	});

	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('in');
			io.unobserve(entry.target);
		});
	}, { threshold: 0.1 });
	els.forEach(function (el) { io.observe(el); });

	// Count-up on stat figures like "USD 100m+", "100,000+", "15,000+".
	function countUp(el) {
		var text = el.textContent;
		var m = text.match(/^([^0-9]*)([\d,.]+)(.*)$/);
		if (!m) return;
		var target = parseFloat(m[2].replace(/,/g, ''));
		if (!isFinite(target) || target < 10) return;
		var hasComma = m[2].indexOf(',') !== -1;
		var start = performance.now();
		var DURATION = 1200;
		function frame(now) {
			var p = Math.min((now - start) / DURATION, 1);
			var eased = 1 - Math.pow(1 - p, 3);
			var value = Math.round(target * eased);
			el.textContent = m[1] + (hasComma ? value.toLocaleString('en-US') : String(value)) + m[3];
			if (p < 1) requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	}

	var cio = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;
			cio.unobserve(entry.target);
			countUp(entry.target);
		});
	}, { threshold: 0.6 });
	Array.prototype.forEach.call(
		document.querySelectorAll('.kpis strong, .stats strong'),
		function (el) { cio.observe(el); },
	);
})();
