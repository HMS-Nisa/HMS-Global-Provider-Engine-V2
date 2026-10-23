// Subpage hero aurora - vanilla WebGL port of the ReactBits Aurora shader,
// recoloured to the brand teal/cyan family over the cream page background.
// Falls back to the static CSS wash (styles.css) when WebGL is unavailable
// or the visitor prefers reduced motion; pauses while offscreen or hidden.
(function () {
	var hero = document.querySelector('.page-hero');
	if (!hero) return;
	var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (REDUCED) { hero.classList.add('aurora-static'); return; }

	var canvas = document.createElement('canvas');
	canvas.className = 'aurora-canvas';
	canvas.setAttribute('aria-hidden', 'true');
	var gl = null;
	try {
		gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
	} catch (e) { /* fall through */ }
	if (!gl) { hero.classList.add('aurora-static'); return; }
	hero.insertBefore(canvas, hero.firstChild);

	var VERT = [
		'attribute vec2 p;',
		'void main(){gl_Position=vec4(p,0.,1.);}'
	].join('\n');

	// Ashima 2D simplex noise + the ReactBits aurora field, with a three-stop
	// colour ramp across x. Alpha is premultiplied and faded out towards the
	// bottom so the band melts into the page.
	var FRAG = [
		'precision highp float;',
		'uniform float uTime;uniform vec2 uRes;',
		'uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;',
		'vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}',
		'float snoise(vec2 v){',
		'  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
		'  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
		'  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
		'  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);',
		'  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
		'  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);',
		'  m=m*m;m=m*m;',
		'  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
		'  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
		'  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
		'  return 130.0*dot(m,g);}',
		'void main(){',
		'  vec2 uv=gl_FragCoord.xy/uRes;',
		'  float h=snoise(vec2(uv.x*2.0+uTime*0.05,uTime*0.125))*0.5;',
		'  h=exp(h);',
		'  float edge=uv.y*2.0-h+0.2;',
		'  float intensity=0.6*edge;',
		// Vertical ramp: cream (page) -> sand -> sky cyan towards the top,
		// with the noise wave animating the colour boundary.
		'  float a=smoothstep(0.0,0.4,intensity);',
		'  vec3 col=mix(uC1,uC0,smoothstep(0.12,0.62,intensity));',
		'  gl_FragColor=vec4(col*a,a);}'
	].join('\n');

	function sh(type, src) {
		var s = gl.createShader(type);
		gl.shaderSource(s, src); gl.compileShader(s);
		return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
	}
	var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
	if (!vs || !fs) { canvas.remove(); hero.classList.add('aurora-static'); return; }
	var prog = gl.createProgram();
	gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); hero.classList.add('aurora-static'); return; }
	gl.useProgram(prog);

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	var loc = gl.getAttribLocation(prog, 'p');
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

	var uTime = gl.getUniformLocation(prog, 'uTime');
	var uRes = gl.getUniformLocation(prog, 'uRes');
	// Reference gradient: sky cyan at the top through sand into the cream page.
	function rgb(hex) { return [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255]; }
	// Cyan softened towards white (#22BFD3 at half strength, then 15% more).
	gl.uniform3fv(gl.getUniformLocation(prog, 'uC0'), rgb('#A1E4EC'));
	gl.uniform3fv(gl.getUniformLocation(prog, 'uC1'), rgb('#E5DFCE'));
	gl.uniform3fv(gl.getUniformLocation(prog, 'uC2'), rgb('#FCFCF7'));

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	function resize() {
		var r = hero.getBoundingClientRect();
		var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
		canvas.width = Math.max(1, Math.round(r.width * dpr));
		canvas.height = Math.max(1, Math.round(r.height * dpr));
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.uniform2f(uRes, canvas.width, canvas.height);
	}
	resize();
	window.addEventListener('resize', resize);

	var running = true, raf = 0, t0 = performance.now();
	function frame(now) {
		raf = 0;
		if (!running) return;
		gl.uniform1f(uTime, (now - t0) / 1000);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		raf = requestAnimationFrame(frame);
	}
	function play() { if (!raf) { running = true; raf = requestAnimationFrame(frame); } }
	function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

	new IntersectionObserver(function (es) {
		es[0].isIntersecting ? play() : stop();
	}, { threshold: 0 }).observe(hero);
	document.addEventListener('visibilitychange', function () {
		document.hidden ? stop() : play();
	});
	play();
})();
