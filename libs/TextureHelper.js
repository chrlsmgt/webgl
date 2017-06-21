var TextureHelper = (function(renderer, width, height, x, y){
    var size = renderer.getSize();

    var camera = new THREE.OrthographicCamera(
        -size.width/2, size.width/2,
        size.height/2, -size.height/2,
        0, 30
    );

    var scene = new THREE.Scene();

    var material = new THREE.MeshBasicMaterial( {map: null } );
        // material.transparent = true;

    var geometry = new THREE.PlaneGeometry( width, height );
    var plane = new THREE.Mesh( geometry, material );
        plane.position.set((size.width - width)/2 - x,  (height - size.height)/2 - y, 0);

    scene.add( plane );
    return {
        resize:function(){
            var size = renderer.getSize();
            camera.left   = -size.width/2;
            camera.right  = size.width/2;
            camera.top    = size.height/2;
            camera.bottom = -size.height/2;
            camera.updateProjectionMatrix();

            plane.position.set((size.width - width)/2 - x, (height - size.height)/2 - y, 0);
        },
        render:function(texture){
            material.map = texture;
            material.needsUpdate = true;

            var autoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.render(scene, camera);
            renderer.autoClear = autoClear;
        }
    }
});
