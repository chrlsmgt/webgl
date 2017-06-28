var main = new function main() {
	var self = this;
    var cache = {};
    var meter;

	var canvas, context, imageData;

	var container, stats;
	var camera, scene, renderer, particles, geometry, material, parameters, i, h, color, sprite, size;
	var spotLight1, spotLight2, spotLight1Helper;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = 0, windowHalfY = 0;
	var _gpgpu, _textureHelper;

	var isRendering = true;

	var nbCol = 75;
	var nbRow = 200;
	var points = [];


	//Controls
    var controls = {
    		size : 3,
    		displacementAmplitude: 50.0,
    		spotLight1X : -500,
    		spotLight1Y : 0,
    		spotLight1Z : 520,
            spotLight2X : 500,
            spotLight2Y : 0,
            spotLight2Z : 520,
    		noise3D : true
    	};

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

        imageObj.src = 'textures/60fps.png';
	};

    var initThree = function () {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

		scene.add(new THREE.AxisHelper(1000));

		spotLight1 = new THREE.SpotLight(
            0x4a3000,   //color
            1,          //intensity
            0,          //distance
            Math.PI/3,  //angle,
            0.5,       //penumbra
            1           //decay
        );
        spotLight2 = new THREE.SpotLight(
            0x0000ff,   //color
            1,          //intensity
            0,          //distance
            Math.PI/3,  //angle,
            0.5,       //penumbra
            1           //decay
        );
        spotLight1.position.set( controls.spotLight1X, controls.spotLight1Y, controls.spotLight1Z );
		spotLight2.position.set( controls.spotLight2X, controls.spotLight2Y, controls.spotLight2Z );
        spotLight1.target.position.set(controls.spotLight1X, controls.spotLight1Y, 0);
        spotLight2.target.position.set(controls.spotLight2X, controls.spotLight2Y, 0);
        scene.add( spotLight1.target );
        scene.add( spotLight2.target );
        scene.add( spotLight1 );
        scene.add( spotLight2 );


		// spotLight1Helper = new THREE.SpotLightHelper( spotLight1 );
		// scene.add( spotLight1Helper );

		var particles = nbCol*nbRow;
		var w = context.canvas.width, w2 = w / 2; // particles spread in the cube
		var h = context.canvas.height, h2 = h / 2; // particles spread in the cube

		// Adds 60fps points
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

		// Adds random points
		for ( var i = 0; i < 200; i += 1 ) {
			var vertex = new THREE.Vector3();

			vertex.x = THREE.Math.randFloatSpread(1000);
			vertex.y = THREE.Math.randFloatSpread(1000);
			vertex.z = THREE.Math.randFloatSpread(1000);
			points.push(vertex);
		}

		var geometry = new THREE.BufferGeometry();

		var positions = new Float32Array( points.length * 3 );
		var colors    = new Float32Array( points.length * 3 );
		var pIndexes  = new Float32Array( points.length);

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
		        USE_MAP: "",
                NB_LIGHTS: 2
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
		material.uniforms.textureWidth.value = _gpgpu.width;

		initControls();
		updateControls();
		animate();

    };

	var initControls = function () {
		// View controls
		var orbit = new THREE.OrbitControls( camera, renderer.domElement );
		orbit.maxPolarAngle = Math.PI * 0.5;
		orbit.minDistance = 1;
		orbit.maxDistance = 7500;

	    self.gui = new dat.GUI();
		self.gui.add(controls, 'size', 1, 10).onChange(updateControls);
		self.gui.add(controls, 'displacementAmplitude', 1, 100).onChange(updateControls);

		self.gui.add(controls, 'noise3D').onChange(updateControls);

        var f1 = self.gui.addFolder('Lights 1');
            f1.add(spotLight1, "visible");
            f1.addThreeColor(spotLight1, "color");
            f1.add(spotLight1, "intensity");
            f1.add(spotLight1, "distance");
            f1.add(spotLight1, "angle", 0, Math.PI/2).step(0.01);
            f1.add(spotLight1, "penumbra", 0, 1).step(0.01);
            f1.add(spotLight1, "decay");
            f1.add(spotLight1.position, "x");
            f1.add(spotLight1.position, "y");
            f1.add(spotLight1.position, "z");

        var f1 = self.gui.addFolder('Lights 2');
            f1.add(spotLight2, "visible");
            f1.addThreeColor(spotLight2, "color");
            f1.add(spotLight2, "intensity");
            f1.add(spotLight2, "distance");
            f1.add(spotLight2, "angle", 0, Math.PI/2).step(0.01);
            f1.add(spotLight2, "penumbra", 0, 1).step(0.01);
            f1.add(spotLight2, "decay");
            f1.add(spotLight2.position, "x");
            f1.add(spotLight2.position, "y");
            f1.add(spotLight2.position, "z");
    };

	var updateControls = function() {
		material.uniforms.size.value = controls.size;
		material.uniforms.displacementAmplitude.value = controls.displacementAmplitude;

		_gpgpu.uniforms.noise2DFactor.value = controls.noise2D ? 0 : 1.0;
		_gpgpu.uniforms.noise3DFactor.value = controls.noise3D ? 1.0 : 0;
	};

	var render = function() {
		_gpgpu.render(window.performance.now()/1000 / 10);
		var t = _gpgpu.getTexture();
		material.uniforms.displacementTexture.value = t;

		renderer.render( scene, camera );

		_textureHelper.render(t);
	};
};
