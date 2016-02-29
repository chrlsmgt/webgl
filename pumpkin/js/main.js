var main = new function main() {
	var self = this;
    var cache = {};
    var meter;
    
    //webgl
    var renderer, scene, camera, clock;
    var cube, cubeTexture, skybox, pointLight;
    var particles, particleSystem;
    
    //Terrain
    var pkTop, pkBottom, pkSide, pkFace;
    
    //Toggle
    var isRendering = true;
    
    
    /************************************/
    /* DEFAULT                          */
    /************************************/
    
    this.init = function () {
	    meter = new FPSMeter({ theme: 'transparent', graph: 1, heat: 1 });
	    
        initCache();
        initThree();
        registerEvents();
                
        return self;
    };
    
    var initCache = function () {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
	    
	    cache.body = $('body');
    };    
    
    var registerEvents = function() {
	    $(window).resize(layout);
    };
    
    var layout = function() {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
    };
    
    var render = function() {	    
	    if(isRendering) {
		    meter.tickStart();
		    
		    var delta = clock.getDelta();
			cube.rotation.y -= delta/2;
			particleSystem.rotation.y += delta/4;
			
		    renderer.render(scene, camera);
		    
			requestAnimationFrame(render);
			
			meter.tick();
	    }
    };
    
    /************************************/
    /* Experiment                       */
    /************************************/
    
    var initThree = function () {
	    //Init Renderer
	    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(cache.winW, cache.winH);
		renderer.setClearColor( 0xffffff, 0);
		
		cache.body.append(renderer.domElement);
		
		//Init Scene
		scene = new THREE.Scene;
		
		//Init Clock
		clock = new THREE.Clock;
		
		//Init Camera
		camera = new THREE.PerspectiveCamera(45, cache.winW/cache.winH, 0.1, 10000);
		camera.position.y = 160;
		camera.position.z = 400;
		scene.add(camera);
		
		//Draw Background
		drawBackground();
		
		//Draw Cube
		drawCube();		
		
		//Add Light
		light();
		
		//Adjust Camera
		camera.lookAt(cube.position);
		
		//particles
		drawParticles();
		
		//Render
		render();
    };
    
    var drawCube = function () {
	    var cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
	    
	    //cubeTexture = THREE.ImageUtils.loadTexture('./img/bricks.jpg');
	    
	    //Plain color
		//var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1ec876 });
		
		//Both
		//var cubeMaterial = new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0x28c0ec });
		
		//Texture Only
		//var cubeMaterial = new THREE.MeshLambertMaterial({ map: cubeTexture });
		
		// Spritesheet
		cubeTexture = THREE.ImageUtils.loadTexture( "./img/mc/terrain.png" );
		cubeMaterial = new THREE.MeshPhongMaterial( { map: cubeTexture } );
		pkTop = spriteCalc(10, 7);
		pkBottom = spriteCalc(9, 7);
		pkSide = spriteCalc(9, 8);
		pkFace = spriteCalc(9, 9);
		
		cubeGeometry.faceVertexUvs[0] = [];
		
		cubeGeometry.faceVertexUvs[0][0] = [ pkFace[2], pkFace[1], pkFace[3] ];
		cubeGeometry.faceVertexUvs[0][1] = [ pkFace[1], pkFace[0], pkFace[3] ];
		  
		cubeGeometry.faceVertexUvs[0][2] = [ pkSide[2], pkSide[1], pkSide[3] ];
		cubeGeometry.faceVertexUvs[0][3] = [ pkSide[1], pkSide[0], pkSide[3] ];
		  
		cubeGeometry.faceVertexUvs[0][4] = [ pkTop[0], pkTop[1], pkTop[3] ];
		cubeGeometry.faceVertexUvs[0][5] = [ pkTop[1], pkTop[2], pkTop[3] ];
		  
		cubeGeometry.faceVertexUvs[0][6] = [ pkBottom[0], pkBottom[1], pkBottom[3] ];
		cubeGeometry.faceVertexUvs[0][7] = [ pkBottom[1], pkBottom[2], pkBottom[3] ];
		  
		cubeGeometry.faceVertexUvs[0][8] = [ pkSide[2], pkSide[1], pkSide[3] ];
		cubeGeometry.faceVertexUvs[0][9] = [ pkSide[1], pkSide[0], pkSide[3] ];
		  
		cubeGeometry.faceVertexUvs[0][10] = [ pkSide[2], pkSide[1], pkSide[3] ];
		cubeGeometry.faceVertexUvs[0][11] = [ pkSide[1], pkSide[0], pkSide[3] ];

		
		cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		 		 
		scene.add(cube);
    };
    
    var drawBackground = function () {
	    var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
		var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
		skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
		 
		scene.add(skybox);
    };
    
    var light = function () {
	    pointLight = new THREE.PointLight(0xffffff);
		pointLight.position.set(0, 300, 200);
		 
		scene.add(pointLight);
	};
	
	var drawParticles = function () {
	    particles = new THREE.Geometry;
	    
	    for (var p = 0; p < 2000; p++) {
		    var particle = new THREE.Vector3(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 - 250);
		    particles.vertices.push(particle);
		}
		
		var particleTexture = THREE.ImageUtils.loadTexture('./img/snowflake.png');
		var particleMaterial = new THREE.ParticleBasicMaterial({ map: particleTexture, transparent: true, size: 5 });
		particleSystem = new THREE.ParticleSystem(particles, particleMaterial);
		
		scene.add(particleSystem);
	};
	
	var spriteCalc = function (row, col, maxRow, maxCol) {
		if(!maxRow) maxRow = 16;
		if(!maxCol) maxCol = 16;
		
		var unitR = 1/maxRow;
		var unitC = 1/maxCol;
		
		var x1 = unitC*col;
		var x2 = x1-unitC;
		
		var y1 = unitR*row;
		var y2 = y1-unitR;
		
		var result = [new THREE.Vector2(x2, y2), new THREE.Vector2(x1, y2), new THREE.Vector2(x1, y1), new THREE.Vector2(x2, y1)];
		return result;
	};
};