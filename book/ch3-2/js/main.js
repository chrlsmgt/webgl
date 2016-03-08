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
    var stopMovingLight = false;
    
    //Controls
    var controls = {ambientColor : '#0c0c0c', spotColor : '#ffffff', stopMovingLight : false};
    
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
            if (!stopMovingLight) {
                if (phase > 2 * Math.PI) {
                    invert = invert * -1;
                    phase -= 2 * Math.PI;
                } else {
                    phase += 0.03;
                }
                mesh.sphereLightMesh.position.z = +(7 * (Math.sin(phase)));
                mesh.sphereLightMesh.position.x = +(14 * (Math.cos(phase)));
                mesh.sphereLightMesh.position.y = 10;

                if (invert < 0) {
                    var pivot = 14;
                    mesh.sphereLightMesh.position.x = (invert * (mesh.sphereLightMesh.position.x - pivot)) + pivot;
                }

                self.spotLight.position.copy(mesh.sphereLightMesh.position);
            }		
			
			self.helper.update();
			
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
		
		self.camera = new THREE.PerspectiveCamera(75, cache.winW / cache.winH, 0.1, 1000);
		
		self.renderer = new THREE.WebGLRenderer();
		self.renderer.setClearColor(0xEEEEEE, 1.0);
		self.renderer.setSize(cache.winW, cache.winH);
		self.renderer.shadowMap.enabled = true;
				
		//Guides
		var axes = new THREE.AxisHelper( 20 );
		//self.scene.add(axes);
		
		//Mesh
		var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
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
		self.camera.position.x = -35;
        self.camera.position.y = 30;
        self.camera.position.z = 25;
        self.camera.lookAt(new THREE.Vector3(10, 0, 0));
		
		//Light
        self.ambientLight = new THREE.AmbientLight(controls.ambientColor);
        self.scene.add(self.ambientLight);
        
        var spotLight0 = new THREE.SpotLight(0xcccccc);
        spotLight0.position.set(-40, 30, -10);
        spotLight0.lookAt(mesh.plane);
        self.scene.add(spotLight0);    
		
		
		self.spotLight = new THREE.SpotLight(controls.spotColor);
		self.spotLight.position.set(-40, 60, -10);
        self.spotLight.distance = 0;
        self.spotLight.angle = 0.4;
		self.spotLight.castShadow = true;
		self.spotLight.target = mesh.plane;
		self.spotLight.shadowCameraNear = 2;
        self.spotLight.shadowCameraFar = 200;
        self.spotLight.shadowCameraFov = 30;
		self.scene.add(self.spotLight);
		
		//self.helper = new THREE.CameraHelper( self.spotLight.shadow.camera );
		self.helper = new THREE.SpotLightHelper( self.spotLight );
		self.scene.add( self.helper );
		
		// add a small sphere simulating the pointlight
        var sphereLight = new THREE.SphereGeometry(0.2);
        var sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25});
        mesh.sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
        mesh.sphereLightMesh.castShadow = true;

        mesh.sphereLightMesh.position = new THREE.Vector3(3, 20, 3);
        self.scene.add(mesh.sphereLightMesh);
		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var initControls = function () {
	    
	    controls.angle = self.spotLight.angle;
	    controls.intensity = self.spotLight.intensity;
	    controls.distance = self.spotLight.distance;
	    controls.exponent = (self.spotLight.exponent ? self.spotLight.exponent : false);
	    controls.castShadow = self.spotLight.castShadow;
	    controls.target = 'Plane';
	    
	    console.log(controls);
	    
	    self.gui = new dat.GUI();
	    self.gui.addColor(controls, 'ambientColor').onChange(function(e) {
			self.ambientLight.color = new THREE.Color(e);
		});
		self.gui.addColor(controls, 'spotColor').onChange(function(e) {
			self.spotLight.color = new THREE.Color(e);
		});
		self.gui.add(controls, 'intensity', 0, 3).onChange(function (e) {
		    self.spotLight.intensity = e;
		});
		self.gui.add(controls, 'angle', 0, Math.PI * 2).onChange(function (e) {
            self.spotLight.angle = e;
        });

        self.gui.add(controls, 'intensity', 0, 5).onChange(function (e) {
            self.spotLight.intensity = e;
        });

        self.gui.add(controls, 'distance', 0, 200).onChange(function (e) {
            self.spotLight.distance = e;
        });

        self.gui.add(controls, 'exponent', 0, 100).onChange(function (e) {
            self.spotLight.exponent = e;
        });

        self.gui.add(controls, 'castShadow').onChange(function (e) {
            self.spotLight.castShadow = e;
        });

        self.gui.add(controls, 'target', ['Plane', 'Sphere', 'Cube']).onChange(function (e) {
            console.log(e);
            switch (e) {
                case "Plane":
                    self.spotLight.target = mesh.plane;
                    break;
                case "Sphere":
                    self.spotLight.target = mesh.sphere;
                    break;
                case "Cube":
                    self.spotLight.target = mesh.cube;
                    break;
            }

        });
        self.gui.add(controls, 'stopMovingLight').onChange(function (e) {
            stopMovingLight = e;
        });
    };
};