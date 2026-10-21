// Analytics event wiring for the hospital finder (network.html).
// Event names match the old directory site so GA4/Clarity reporting stays
// continuous across the migration. gtag() is a safe no-op stub until a GA4
// or GTM tag is added in the page head.
(function () {
	function track(event, payload) {
		payload = payload || {};
		if (window.gtag) window.gtag('event', event, payload);
		if (window.dataLayer) window.dataLayer.push(Object.assign({ event: event }, payload));
	}

	var q = document.getElementById('q');
	var cc = document.getElementById('cc');
	var count = document.getElementById('count');

	function resultCount() {
		var n = count ? parseInt(count.textContent, 10) : NaN;
		return isNaN(n) ? undefined : n;
	}

	var t;
	if (q) {
		q.addEventListener('input', function () {
			clearTimeout(t);
			t = setTimeout(function () {
				if (!q.value.trim()) return;
				track('directory_search', {
					search_term: q.value.trim().toLowerCase(),
					result_count: resultCount(),
				});
			}, 800);
		});
	}

	if (cc) {
		cc.addEventListener('change', function () {
			track('directory_filter', {
				filter_name: 'country',
				filter_value: cc.value || '(all)',
				result_count: resultCount(),
			});
		});
	}

	document.addEventListener('click', function (e) {
		var a = e.target.closest && e.target.closest('a[href^="http"]');
		if (!a) return;
		if (a.hostname === location.hostname) return;
		track('outbound_click', { link_url: a.href, link_text: (a.textContent || '').trim().slice(0, 80) });
	});
})();
