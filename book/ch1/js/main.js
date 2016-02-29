var main = new function main() {
	var self = this;
    var cache = {};
    var mesh = {};
    var meter;
    
    //vars
    var step = 0;
    
    //Toggle
    var isRendering = true;
    var isASCII = false;
    
    //Controls
    var controls = {rotationSpeed : 0.02, bouncingSpeed : 0.03};
    
    /************************************/
    /* DEFAULT                          */
    /************************************/
    
    this.init = function () {
	    meter = new FPSMeter({ theme: 'transparent', graph: 1, heat: 1 });
	    
        initCache();
        initThree();
        initControls();
        registerEvents();
        
        //Render
		render();
                        
        return self;
    };
    
    var initCache = function () {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
	    
	    cache.body = $('body');
	    cache.webgl = $('#WebGL-output');
	    cache.ascii = $('#ascii');
    };    
    
    var registerEvents = function() {
	    $(window).resize(layout);
	    
	    cache.ascii.on('click', function() {
		    var el = $(this);
		    if(el.hasClass('on')) {
			    el.removeClass('on');
			    isASCII = false;
			    cache.webgl.html(self.renderer.domElement);
		    } else {
			    el.addClass('on');
			    isASCII = true;
			    cache.webgl.html(self.effect.domElement);
		    }
	    });
    };
    
    var layout = function() {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
    };
    
    var render = function() {	    
	    if(isRendering) {
		    meter.tickStart();
		    
		    //Animate Cube 
		    mesh.cube.rotation.x += controls.rotationSpeed;
			mesh.cube.rotation.y += controls.rotationSpeed;
			mesh.cube.rotation.z += controls.rotationSpeed;
			
			//Animate Ball
			step += controls.bouncingSpeed;
			mesh.sphere.position.x = 20+( 10*(Math.cos(step)));
			mesh.sphere.position.y = 2 +( 10*Math.abs(Math.sin(step)));
		    
		    if(!isASCII) {
		    	self.renderer.render(self.scene, self.camera);
		    } else {
		    	self.effect.render(self.scene, self.camera);
		    }
		    
			requestAnimationFrame(render);
			
			meter.tick();
	    }
    };
    
    /************************************/
    /* Experiment                       */
    /************************************/
    
    var initThree = function () {
	    //Global Webgl object
		self.scene = new THREE.Scene();
		
		self.camera = new THREE.PerspectiveCamera(45, cache.winW / cache.winH, 0.1, 1000);
		
		self.renderer = new THREE.WebGLRenderer();
		self.renderer.setClearColor(0xEEEEEE, 1.0);
		self.renderer.setSize(cache.winW, cache.winH);
		self.renderer.shadowMap.enabled = true;
		
		//ASCII effect
		self.effect = new THREE.AsciiEffect( self.renderer );
		self.effect.setSize( cache.winW, cache.winH );
		
				
		//Guides
		var axes = new THREE.AxisHelper( 20 );
		//self.scene.add(axes);
		
		//Mesh
		var planeGeometry = new THREE.PlaneGeometry(60,20);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		mesh.plane = new THREE.Mesh(planeGeometry,planeMaterial);
		mesh.plane.receiveShadow = true;
		mesh.plane.rotation.x = -0.5*Math.PI;
		mesh.plane.position.x = 15;
		mesh.plane.position.y = 0;
		mesh.plane.position.z = 0;
		self.scene.add(mesh.plane);
		
        var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
        mesh.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        mesh.cube.castShadow = true;
        mesh.cube.position.x = -4;
        mesh.cube.position.y = 3;
        mesh.cube.position.z = 0;
        self.scene.add(mesh.cube);

        var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
        var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
        mesh.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        mesh.sphere.position.x = 20;
        mesh.sphere.position.y = 4;
        mesh.sphere.position.z = 2;
        mesh.sphere.castShadow = true;
        self.scene.add(mesh.sphere);
		
		//Position Camera
		self.camera.position.x = -30;
		self.camera.position.y = 40;
		self.camera.position.z = 30;
		self.camera.lookAt(self.scene.position);
		
		//Light
		var spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set( -40, 60, -10 );
		spotLight.castShadow = true;
		self.scene.add( spotLight );		
		
		
		//Print the output
		if(!isASCII) {
			cache.webgl.html(self.renderer.domElement);
		} else {
			cache.webgl.html(self.effect.domElement);
		}
    };
    
    var initControls = function () {
	    self.gui = new dat.GUI();
		self.gui.add(controls, 'rotationSpeed',0,0.5);
		self.gui.add(controls, 'bouncingSpeed',0,0.5);
    };
};