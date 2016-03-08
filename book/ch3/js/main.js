var main = new function main() {
	var self = this;
    var cache = {};
    var mesh = {};
    var meter;
    
    //vars
    var step = 0;
    var invert = 1;
    var phase = 0;
    
    //Toggle
    var isRendering = true;
    
    //Controls
    var controls = {ambientColor : '#0c0c0c', pointColor : '#ccffcc', intensity : 2.4};
    
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
		    
		    //Animate Cube 
		    mesh.cube.rotation.x += 0.02;
			mesh.cube.rotation.y += 0.02;
			mesh.cube.rotation.z += 0.02;
			
			//Animate Ball
			step += 0.03;
			mesh.sphere.position.x = 20+( 10*(Math.cos(step)));
			mesh.sphere.position.y = 2 +( 10*Math.abs(Math.sin(step)));
			
			
			// move the light simulation
            if (phase > 2 * Math.PI) {
                invert = invert * -1;
                phase -= 2 * Math.PI;
            } else {
                phase += 0.03;
            }
            mesh.sphereLightMesh.position.z = +(7 * (Math.sin(phase)));
            mesh.sphereLightMesh.position.x = +(14 * (Math.cos(phase)));
            mesh.sphereLightMesh.position.y = 5;

            if (invert < 0) {
                var pivot = 14;
                mesh.sphereLightMesh.position.x = (invert * (mesh.sphereLightMesh.position.x - pivot)) + pivot;
            }

            self.pointLight.position.copy(mesh.sphereLightMesh.position);
			
			
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
		var planeGeometry = new THREE.PlaneGeometry(60, 20, 20, 20);
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
		self.camera.position.x = -25;
        self.camera.position.y = 30;
        self.camera.position.z = 25;
        self.camera.lookAt(new THREE.Vector3(10, 0, 0));
		
		//Light
		var ambiColor = "#0c0c0c";
        self.ambientLight = new THREE.AmbientLight(ambiColor);
        self.scene.add(self.ambientLight);       
		
		var pointColor = "#ccffcc";
		self.pointLight = new THREE.PointLight(pointColor);
		self.pointLight.position.set( -40, 60, -10 );
		self.pointLight.distance = 100;
		self.pointLight.intensity = 2.4;
		self.scene.add(self.pointLight);
		
		// add a small sphere simulating the pointlight
        var sphereLight = new THREE.SphereGeometry(0.2);
        var sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25});
        mesh.sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
        mesh.sphereLightMesh.castShadow = true;

        mesh.sphereLightMesh.position = new THREE.Vector3(3, 0, 3);
        self.scene.add(mesh.sphereLightMesh);
		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var initControls = function () {
	    self.gui = new dat.GUI();
	    self.gui.addColor(controls, 'ambientColor').onChange(function(e) {
			self.ambientLight.color = new THREE.Color(e);
		});
		self.gui.addColor(controls, 'pointColor').onChange(function(e) {
			self.pointLight.color = new THREE.Color(e);
		});
		self.gui.add(controls, 'intensity', 0, 3).onChange(function (e) {
		    self.pointLight.intensity = e;
		});
    };
};