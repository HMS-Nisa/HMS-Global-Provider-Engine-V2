// Hero globe - lite mockup (globe.gl UMD from CDN, lazy-loaded).
// Desktop only, skipped under prefers-reduced-motion or without WebGL;
// the hero simply stays single-column text when the globe does not run.
// Cities are a hardcoded showcase set, not wired to providers.json yet.
(function () {
	var MOBILE = window.matchMedia('(max-width:860px)').matches;
	var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var holder = document.getElementById('heroGlobe');
	if (!holder || MOBILE || REDUCED) return;
	try {
		var canvas = document.createElement('canvas');
		if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) return;
	} catch (e) { return; }

	// [name, lat, lng, weight 0..1]
	var KL = ['Kuala Lumpur', 3.139, 101.687, 1];
	var CITIES = [
		KL,
		['Penang', 5.414, 100.329, .7], ['Johor Bahru', 1.492, 103.741, .6],
		['Ipoh', 4.597, 101.09, .45], ['Kuching', 1.553, 110.359, .45],
		['Kota Kinabalu', 5.98, 116.073, .45], ['Melaka', 2.2, 102.25, .4],
		['Kuantan', 3.807, 103.326, .35], ['Alor Setar', 6.121, 100.368, .3],
		['Kota Bharu', 6.125, 102.254, .3], ['Seremban', 2.726, 101.938, .35],
		['Jakarta', -6.2, 106.817, .9], ['Surabaya', -7.257, 112.752, .6],
		['Bandung', -6.917, 107.619, .55], ['Medan', 3.589, 98.674, .5],
		['Semarang', -6.993, 110.421, .4], ['Makassar', -5.147, 119.432, .4],
		['Denpasar', -8.65, 115.216, .45], ['Palembang', -2.991, 104.757, .35],
		['Pekanbaru', .507, 101.448, .35], ['Balikpapan', -1.265, 116.831, .3],
		['Manado', 1.474, 124.842, .3], ['Yogyakarta', -7.797, 110.371, .35],
		['Singapore', 1.352, 103.82, .6],
		['Bangkok', 13.756, 100.502, .55], ['Chiang Mai', 18.788, 98.985, .3],
		['Phuket', 7.88, 98.392, .3], ['Hat Yai', 7.009, 100.476, .25],
		['Ho Chi Minh City', 10.823, 106.63, .35], ['Hanoi', 21.028, 105.854, .3],
		['Manila', 14.6, 120.984, .3], ['Bandar Seri Begawan', 4.903, 114.94, .25],
		['Phnom Penh', 11.556, 104.928, .25], ['Yangon', 16.871, 96.199, .2],
		['Guangzhou', 23.129, 113.264, .3],
		['Chennai', 13.083, 80.27, .25], ['New Delhi', 28.614, 77.209, .25],
		['Mumbai', 19.076, 72.878, .25],
		['Istanbul', 41.008, 28.978, .35], ['Ankara', 39.934, 32.86, .25],
		['Bursa', 40.195, 29.06, .2], ['Adana', 37, 35.321, .2],
	];

	function boot() {
		var s = document.createElement('script');
		s.src = 'https://unpkg.com/globe.gl@2.34.5/dist/globe.gl.min.js';
		s.onload = init;
		document.head.appendChild(s);
	}

	function init() {
		if (!window.Globe) return;
		var w = holder.parentElement.getBoundingClientRect().width * 0.47;
		var size = Math.max(Math.min(w, 560), 380);

		var points = CITIES.map(function (c) {
			return { name: c[0], lat: c[1], lng: c[2], size: 0.012 + c[3] * 0.028, r: 0.22 + c[3] * 0.5 };
		});
		var arcs = CITIES.filter(function (c) { return c !== KL && c[3] >= 0.3; }).map(function (c) {
			return { startLat: KL[1], startLng: KL[2], endLat: c[1], endLng: c[2] };
		});

		var globe = Globe({ rendererConfig: { alpha: true, antialias: true } })(holder)
			.width(size).height(size)
			.backgroundColor('rgba(0,0,0,0)')
			.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
			.showAtmosphere(true)
			.atmosphereColor('#3FC1D4')
			.atmosphereAltitude(0.18)
			.pointsData(points)
			.pointLat('lat').pointLng('lng')
			.pointAltitude('size')
			.pointRadius('r')
			.pointColor(function () { return '#3FC1D4'; })
			.arcsData(arcs)
			.arcColor(function () { return ['rgba(63,193,212,.85)', 'rgba(63,193,212,.05)']; })
			.arcAltitudeAutoScale(0.35)
			.arcStroke(0.45)
			.arcDashLength(0.5)
			.arcDashGap(1.2)
			.arcDashAnimateTime(3200);

		globe.controls().autoRotate = true;
		globe.controls().autoRotateSpeed = 0.35;
		globe.controls().enableZoom = false;
		globe.pointOfView({ lat: 8, lng: 105, altitude: 1.9 }, 0);

		holder.classList.add('on');
		document.getElementById('heroGrid').classList.add('globe-on');
	}

	if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 2500 });
	else setTimeout(boot, 800);
})();
