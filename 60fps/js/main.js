var main = new function main() {
	var self = this;
    var cache = {};
    var meter;

	var canvas, context, imageData;

	var container, stats;
	var camera, scene, renderer, particles, geometry, material, parameters, i, h, color, sprite, size;
	var spotLight, spotLightHelper;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = 0, windowHalfY = 0;
	var _gpgpu, _textureHelper;

	var isRendering = true;

	var nbCol = 75;
	var nbRow = 150;
	var points = [];

	//Controls
    var controls = {size : 5, displacementAmplitude: 50.0, spotLightX : 0, spotLightY : 0, spotLightZ : 500};


    /************************************/
    /* DEFAULT                          */
    /************************************/

    this.init = function () {
	    meter = new FPSMeter({ theme: 'transparent', graph: 1, heat: 1 });

        initCache();
		layout();

		initCanvas();
        registerEvents();

        return self;
    };

    var initCache = function () {
	    cache.body = $('body');
    };

    var registerEvents = function() {
		// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		// document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		// document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		$(window).resize(layout);
    };

    var layout = function() {
		cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
		windowHalfX = cache.winW / 2;
		windowHalfY = cache.winH / 2;

		if(renderer !== undefined) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

			_textureHelper.resize();
		}
    };

	function onDocumentMouseMove( event ) {
		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;
	}

	function onDocumentTouchStart( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			mouseY = event.touches[ 0 ].pageY - windowHalfY;
		}
	}

	function onDocumentTouchMove( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			mouseY = event.touches[ 0 ].pageY - windowHalfY;
		}
	}

    var animate = function() {
	    if(isRendering) {
		    meter.tickStart();

			requestAnimationFrame( animate );
			render();

			meter.tick();
	    }
    };

    /************************************/
    /* Experiment                       */
    /************************************/
	var initCanvas = function () {
		var width  = 800;
		var height = 570;

		canvas  = document.createElement('canvas');
		context = canvas.getContext("2d");

		context.canvas.width  = width;
  		context.canvas.height = height;

		var imageObj = new Image();
        imageObj.onload = function() {
          context.drawImage(this, 0, 0);
		  imageData = context.getImageData(0, 0, width, height);
		  initThree();
        };

        imageObj.src = 'http://192.168.0.15/webgl/60fps/textures/60fps.png';
	};

    var initThree = function () {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

		scene.add(new THREE.AxisHelper(1000));

		spotLight = new THREE.SpotLight( 0xff0000 );
		spotLight.position.set( controls.spotLightX, controls.spotLightY, controls.spotLightZ );
		scene.add( spotLight );

		spotLightHelper = new THREE.SpotLightHelper( spotLight );
		scene.add( spotLightHelper );

		var particles = nbCol*nbRow;
		var w = context.canvas.width, w2 = w / 2; // particles spread in the cube
		var h = context.canvas.height, h2 = h / 2; // particles spread in the cube

		// Test points
		for ( var i = 0; i < particles; i += 1 ) {
			var u = (i%nbCol)/nbCol;
			var v = (i/nbCol|0)/nbRow;

			var x = u * w;
			var y = v * h;
			var z = 0;

			var p = new THREE.Vector3(x-w2, y-h2, z);

			// Canvas validation
			var canvasPxIndex = 4 * (Math.floor(x) + Math.floor(y) * context.canvas.width);
			if(imageData.data[canvasPxIndex] > 0) points.push(p);
		}

		var geometry = new THREE.BufferGeometry();

		var positions = new Float32Array( points.length * 3 );
		var colors = new Float32Array( points.length * 3 );
		var pIndexes = new Float32Array( points.length);

		var color = new THREE.Color();

		// Generate geometry
		for ( var i = 0; i < positions.length; i += 3 ) {
			var current = i/3;

			// positions
			positions[ i ]     = points[current].x;
			positions[ i + 1 ] = -points[current].y;
			positions[ i + 2 ] = points[current].z;

			// Indexes
			pIndexes[current] = current;

			// colors
			color.setRGB( 255, 255, 255 );

			colors[ i ]     = color.r;
			colors[ i + 1 ] = color.g;
			colors[ i + 2 ] = color.b;
		}

		// Add attribute default
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		// Add attribute custom
		geometry.addAttribute( 'pIndex', new THREE.BufferAttribute( pIndexes, 1 ) );

		geometry.computeBoundingSphere();
		geometry.scale(2, 2, 1);

		var texture = new THREE.TextureLoader().load('textures/dots.png');

		//var material = new THREE.PointsMaterial( { size: 5, map: texture, vertexColors: THREE.VertexColors, transparent : true } );
		material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.merge( [
		        THREE.UniformsLib.lights,
		        THREE.UniformsLib.points,{
					displacementTexture :  { value : null },
					displacementAmplitude :  { value : null },
					textureWidth : {value : null}
		        }
		    ]),
		    defines: {
		        USE_MAP: ""
		    },

			vertexShader: SHADER_LOADER.shaders.points.vertex,
			fragmentShader: SHADER_LOADER.shaders.points.fragment,

			//vertexColors: THREE.VertexColors,
		    transparent:true,
		    lights:true
		} );

		particles = new THREE.Points( geometry, material );
		scene.add( particles );

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		//renderer.setClearColor(0x000000);
		container.appendChild( renderer.domElement );

		_gpgpu = gpgpu(renderer, points, context.canvas.width, context.canvas.height);
		_textureHelper = TextureHelper(renderer, 200, 200, 0, 0);

		material.uniforms.map.value = texture;
		material.uniforms.size.value = controls.size;
		material.uniforms.displacementAmplitude.value = controls.displacementAmplitude;
		material.uniforms.textureWidth.value = _gpgpu.width;

		initControls();
		animate();
    };

	var initControls = function () {
		// View controls
		var orbit = new THREE.OrbitControls( camera, renderer.domElement );
		orbit.maxPolarAngle = Math.PI * 0.5;
		orbit.minDistance = 1;
		orbit.maxDistance = 7500;

	    self.gui = new dat.GUI();
		self.gui.add(controls, 'size', 1, 10);
		self.gui.add(controls, 'displacementAmplitude', 1, 100);

		self.gui.add(controls, 'spotLightX', 0, 100);
		self.gui.add(controls, 'spotLightY', 0, 100);
		self.gui.add(controls, 'spotLightZ', 0, 100);
    };

	var render = function() {
		//Set Values
		// spotLight.position.set( controls.spotLightX, controls.spotLightY, controls.spotLightZ );
		// spotLight.lookAt(new THREE.Vector3(0, 0, 0));
		// spotLight.updateMatrix();

		material.uniforms.size.value = controls.size;
		material.uniforms.displacementAmplitude.value = controls.displacementAmplitude;

		_gpgpu.render(window.performance.now()/1000 / 10);
		var t = _gpgpu.getTexture();
		material.uniforms.displacementTexture.value = t;

		renderer.render( scene, camera );

		_textureHelper.render(t);
	};
};
