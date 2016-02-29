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
		    
		    //Animate squares
            self.scene.traverse(function (e) {
                if (e instanceof THREE.Mesh && e != mesh.plane) {
                    e.rotation.x += controls.rotationSpeed;
                    e.rotation.y += controls.rotationSpeed;
                    e.rotation.z += controls.rotationSpeed;
                }
            });
		    
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
		self.renderer.shadowMap.enabled = true;
				
		//Guides
		var axes = new THREE.AxisHelper( 20 );
		//self.scene.add(axes);
		
		//Mesh
		self.planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		mesh.plane = new THREE.Mesh(self.planeGeometry,planeMaterial);
		mesh.plane.receiveShadow = true;
		mesh.plane.rotation.x = -0.5*Math.PI;
		mesh.plane.position.x = 0;
		mesh.plane.position.y = 0;
		mesh.plane.position.z = 0;
		self.scene.add(mesh.plane);
		
		//Position Camera
		self.camera.position.x = -30;
		self.camera.position.y = 40;
		self.camera.position.z = 30;
		self.camera.lookAt(self.scene.position);
		
		//Lights
        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
        self.scene.add(ambientLight);

        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-40, 60, -10);
        spotLight.castShadow = true;
        self.scene.add(spotLight);		
		
		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var initControls = function () {
	    controls.rotationSpeed = 0.02;
	    controls.numberOfObjects = self.scene.children.length;
	    
	    controls.removeCube = removeCube;

        controls.addCube = addCube;

        controls.outputObjects = function () {console.log(self.scene.children);};
	    
	    self.gui = new dat.GUI();
		self.gui.add(controls, 'rotationSpeed', 0, 0.5);
        self.gui.add(controls, 'addCube');
        self.gui.add(controls, 'removeCube');
        self.gui.add(controls, 'outputObjects');
        self.gui.add(controls, 'numberOfObjects').listen();
    };
    
    var removeCube = function () {
	    var allChildren = self.scene.children;
        var lastObject = allChildren[allChildren.length - 1];
        if (lastObject instanceof THREE.Mesh) {
            self.scene.remove(lastObject);
            controls.numberOfObjects = self.scene.children.length;
        }
    };
    
    var addCube = function () {
	    var cubeSize = Math.ceil((Math.random() * 3));
        var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
        cube.name = "cube-" + self.scene.children.length;


        // position the cube randomly in the scene

        cube.position.x = -30 + Math.round((Math.random() * self.planeGeometry.parameters.width));
        cube.position.y = Math.round((Math.random() * 5));
        cube.position.z = -20 + Math.round((Math.random() * self.planeGeometry.parameters.height));

        // add the cube to the scene
        self.scene.add(cube);
        controls.numberOfObjects = self.scene.children.length;
    };
};