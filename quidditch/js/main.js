var main = new function main() {
	var self = this;
    var cache = {};
    var mesh = {};
    var meter;
    
    //vars
    var step = 0;
    var currentTime;
	var previousTime;
    
    //Toggle
    var isRendering = true;
    var isMoving = false;
    
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
        var currentTime = Date.now();
		var previousTime = Date.now();
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
    };
    
    var layout = function() {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
    };
    
    var render = function() {	    
	    if(isRendering) {
		    meter.tickStart();
			
			//Animate Ball
			currentTime     = Date.now();
	        dt              = currentTime - previousTime;
	        previousTime    = currentTime;
	        
	        if(mesh.sphere.position.y < 0.5 && isMoving) {
		        mesh.sphere.position.y = 0.5;
				mesh.sphere.userData.velocity.y = -(mesh.sphere.userData.velocity.y*0.7);
				mesh.sphere.userData.velocity.x = mesh.sphere.userData.velocity.x*0.7;
		    }
		    
		    if(mesh.sphere.userData.velocity.x > 0.00004) {
			    simulate(mesh.sphere, dt);
			        	        
				self.ahThrow.position.copy(mesh.sphere.position);
				self.ahGrav.position.copy(mesh.sphere.position);
			}
		    
		    self.renderer.render(self.scene, self.camera);		    
		    
			requestAnimationFrame(render);
			
			if(!isMoving) {
			    isMoving = true;
		    }
			
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
				
		//Guides
		var axes = new THREE.AxisHelper( 40 );
		self.scene.add(axes);
		
		//Mesh
		var planeGeometry = new THREE.PlaneGeometry(90,40);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		mesh.plane = new THREE.Mesh(planeGeometry,planeMaterial);
		mesh.plane.receiveShadow = true;
		mesh.plane.rotation.x = -0.5*Math.PI;
		mesh.plane.position.x = 30;
		mesh.plane.position.y = 0;
		mesh.plane.position.z = 0;
		self.scene.add(mesh.plane);

        var sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);
        var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
        mesh.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        mesh.sphere.position.x = 0;
        mesh.sphere.position.y = 0.5;
        mesh.sphere.position.z = 0;
        mesh.sphere.castShadow = true;
        mesh.sphere.userData.velocity = new THREE.Vector3(0.01, 0.005, 0);
        mesh.sphere.userData.acceleration  = new THREE.Vector3(0, 0, 0);
        self.scene.add(mesh.sphere);
        
        //Helper Vector Sphere
        var dir = mesh.sphere.userData.velocity;
		var origin = mesh.sphere.position;
		var length = 3;
		
		self.ahThrow = new THREE.ArrowHelper( dir.clone().normalize(), origin, length, 0xffff00 );
		self.scene.add( self.ahThrow );
		
		//Gravity
		self.gravity = new THREE.Vector3(0, -0.00004, 0);
		self.ahGrav = new THREE.ArrowHelper( self.gravity.clone().normalize(), origin, length, 0xff00ff );
		self.scene.add( self.ahGrav );
		
		//Position Camera
		self.camera.position.x = -30;
		//self.camera.position.x = 0;
		self.camera.position.y = 40;
		//self.camera.position.y = 0;
		//self.camera.position.z = 50;
		self.camera.position.z = 100;
		self.camera.lookAt(self.scene.position);
		
		//Light
		var spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set( -40, 60, -10 );
		spotLight.castShadow = true;
		self.scene.add( spotLight );		
		
		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var simulate = function(mesh, dt){
        var velocity     = new THREE.Vector3(),
            acceleration = new THREE.Vector3();
        
        velocity.copy(mesh.userData.velocity);
        acceleration.copy(mesh.userData.acceleration);

        velocity.multiplyScalar(dt);
        acceleration.multiplyScalar(dt).add(self.gravity);

        mesh.position.add(velocity);
        mesh.userData.velocity.add(acceleration);
        
        //Frotement
        mesh.userData.velocity.multiplyScalar(0.999);
    };
    
    var initControls = function () {
	    self.gui = new dat.GUI();
    };
};