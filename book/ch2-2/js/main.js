var main = new function main() {
	var self = this;
    var cache = {};
    var mesh = {};
    var meter;
    
    //vars
    var step = 0;
    
    //Toggle
    var isRendering = true;
    
    //Controls
    var controls = {};
    
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
		    
		    self.renderer.render(self.scene, self.camera);
		    		    
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
				
		//Guides
		var axes = new THREE.AxisHelper( 20 );
		//self.scene.add(axes);
		
		//Mesh
		self.planeGeometry = new THREE.PlaneGeometry(180, 180);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		mesh.plane = new THREE.Mesh(self.planeGeometry,planeMaterial);
		mesh.plane.name = "Plane";
		mesh.plane.rotation.x = -0.5*Math.PI;
		mesh.plane.position.x = 0;
		mesh.plane.position.y = 0;
		mesh.plane.position.z = 0;
		self.scene.add(mesh.plane);
		
		var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);

        for (var j = 0; j < (self.planeGeometry.parameters.height / 5); j++) {
            for (var i = 0; i < self.planeGeometry.parameters.width / 5; i++) {
                var rnd = Math.random() * 0.75 + 0.25;
                var cubeMaterial = new THREE.MeshLambertMaterial();
                cubeMaterial.color = new THREE.Color(rnd, 0, 0);
                var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

                cube.position.z = -((self.planeGeometry.parameters.height) / 2) + 2 + (j * 5);
                cube.position.x = -((self.planeGeometry.parameters.width) / 2) + 2 + (i * 5);
                cube.position.y = 2;

                self.scene.add(cube);
            }
        }
		
		//Position Camera
		self.camera.position.x = 120;
        self.camera.position.y = 60;
        self.camera.position.z = 180;
		self.camera.lookAt(self.scene.position);
		
		//Lights
        var ambientLight = new THREE.AmbientLight(0x292929);
        self.scene.add(ambientLight);
        
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-100, 60, -10);
        self.scene.add(spotLight);        
		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var initControls = function () {
	    
	    controls.perspective = "Perspective";
        controls.switchCamera = function () {
            if (self.camera instanceof THREE.PerspectiveCamera) {
                self.camera = new THREE.OrthographicCamera(cache.winW / -16, cache.winW / 16, cache.winH / 16, cache.winH / -16, -200, 500);
                self.camera.position.x = 120;
                self.camera.position.y = 60;
                self.camera.position.z = 180;
                self.camera.lookAt(self.scene.position);
                controls.perspective = "Orthographic";
            } else {
                self.camera = new THREE.PerspectiveCamera(45, cache.winW / cache.winH, 0.1, 1000);
                self.camera.position.x = 120;
                self.camera.position.y = 60;
                self.camera.position.z = 180;

                self.camera.lookAt(self.scene.position);
                controls.perspective = "Perspective";
            }
        };
        	    
	    self.gui = new dat.GUI();
	    self.gui.add(controls, 'switchCamera');
        self.gui.add(controls, 'perspective').listen();
    };
};