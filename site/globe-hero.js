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
	// Tier 1 - the direct-contract network, dense across Southeast Asia.
	var KL = ['Kuala Lumpur', 3.139, 101.687, 1];
	var NETWORK = [
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
	// Tier 2 - "partners worldwide" (IAG alliance reach): softer nodes on
	// major cities across every region, arcs back to the Assistance Centre.
	var PARTNERS = [
		['London', 51.507, -.128, .5], ['Paris', 48.857, 2.352, .4],
		['Frankfurt', 50.11, 8.682, .4], ['Zurich', 47.377, 8.542, .35],
		['Madrid', 40.417, -3.704, .3], ['Amsterdam', 52.368, 4.904, .3],
		['Stockholm', 59.329, 18.069, .25], ['Milan', 45.464, 9.19, .3],
		['Athens', 37.984, 23.728, .25], ['Warsaw', 52.23, 21.011, .25],
		['Dubai', 25.204, 55.271, .45], ['Doha', 25.286, 51.531, .3],
		['Riyadh', 24.713, 46.675, .3], ['Tel Aviv', 32.085, 34.782, .25],
		['Tokyo', 35.677, 139.65, .45], ['Seoul', 37.566, 126.978, .4],
		['Shanghai', 31.23, 121.474, .4], ['Hong Kong', 22.32, 114.17, .45],
		['Taipei', 25.033, 121.565, .3],
		['Sydney', -33.869, 151.209, .4], ['Melbourne', -37.814, 144.963, .35],
		['Auckland', -36.849, 174.763, .25],
		['New York', 40.713, -74.006, .5], ['Los Angeles', 34.052, -118.244, .4],
		['Toronto', 43.653, -79.383, .35], ['Mexico City', 19.433, -99.133, .3],
		['Sao Paulo', -23.551, -46.633, .35], ['Buenos Aires', -34.603, -58.382, .25],
		['Johannesburg', -26.204, 28.047, .3], ['Nairobi', -1.292, 36.822, .25],
		['Cairo', 30.044, 31.236, .3],
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

		var points = NETWORK.map(function (c) {
			return { name: c[0], lat: c[1], lng: c[2], size: 0.012 + c[3] * 0.028, r: 0.22 + c[3] * 0.5, color: '#0A2E38' };
		}).concat(PARTNERS.map(function (c) {
			return { name: c[0], lat: c[1], lng: c[2], size: 0.01 + c[3] * 0.02, r: 0.2 + c[3] * 0.4, color: 'rgba(18,114,137,.8)' };
		}));
		var arcs = NETWORK.filter(function (c) { return c !== KL && c[3] >= 0.3; }).map(function (c) {
			return { startLat: KL[1], startLng: KL[2], endLat: c[1], endLng: c[2], color: ['rgba(10,46,56,.75)', 'rgba(10,46,56,.04)'] };
		}).concat(PARTNERS.filter(function (c) { return c[3] >= 0.3; }).map(function (c) {
			return { startLat: KL[1], startLng: KL[2], endLat: c[1], endLng: c[2], color: ['rgba(18,114,137,.55)', 'rgba(18,114,137,.03)'] };
		}));

		var globe = Globe({ rendererConfig: { alpha: true, antialias: true } })(holder)
			.width(size).height(size)
			.backgroundColor('rgba(0,0,0,0)')
			.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-day.jpg')
			.showAtmosphere(true)
			.atmosphereColor('#127289')
			.atmosphereAltitude(0.14)
			.pointsData(points)
			.pointLat('lat').pointLng('lng')
			.pointAltitude('size')
			.pointRadius('r')
			.pointColor('color')
			.arcsData(arcs)
			.arcColor('color')
			.arcAltitudeAutoScale(0.35)
			.arcStroke(0.45)
			.arcDashLength(0.5)
			.arcDashGap(1.2)
			.arcDashAnimateTime(3200);

		globe.controls().autoRotate = true;
		globe.controls().autoRotateSpeed = 0.5;
		globe.controls().enableZoom = false;
		// Start pulled back and framed on Southeast Asia; the entrance glides
		// in (CSS fade/scale) while the camera settles closer, then the slow
		// rotation sweeps the worldwide partner nodes through view.
		globe.pointOfView({ lat: 10, lng: 100, altitude: 3.4 }, 0);

		var revealed = false;
		function reveal() {
			if (revealed) return;
			revealed = true;
			holder.classList.add('on');
			document.getElementById('heroGrid').classList.add('globe-on');
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					holder.classList.add('in');
					globe.pointOfView({ lat: 10, lng: 100, altitude: 2.1 }, 2400);
				});
			});
		}
		// Wait for the earth texture so the globe never pops in half-drawn;
		// fall back after 3s in case the ready event never fires.
		if (globe.onGlobeReady) globe.onGlobeReady(reveal);
		setTimeout(reveal, 3000);
	}

	if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 2500 });
	else setTimeout(boot, 800);
})();
