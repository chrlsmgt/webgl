var gpgpu = function(webglRenderer, points, cWidth, cHeight){

    //Create GPGPU renderer
    var width    = THREE.Math.nextPowerOfTwo(Math.sqrt(points.length));
    var renderer = new GPUComputationRenderer(width, width, webglRenderer);

    // console.log('gpgpu texture size', width);

    //Create textures
    var texturePosition     = renderer.createTexture();
    var textureDisplacement     = renderer.createTexture();

    //Extract data array
    var positionData    = texturePosition.image.data;
    var displacementData    = textureDisplacement.image.data;

    //Fill textures
    for ( var k = 0, i=0; i < points.length; k += 4, i++ ) {
        positionData[k + 0] = points[i].x/cWidth;
        positionData[k + 1] = points[i].y/cHeight;
        positionData[k + 2] = points[i].z;

        displacementData[k + 0] = 0;
        displacementData[k + 1] = 0;
        displacementData[k + 2] = 0;
    }

    //Get the particles position shader and create the gpgpu texture variable
    var displacementFragment = SHADER_LOADER.shaders.displacement.fragment;
    var displacementVariable = renderer.addVariable("textureDisplacement", displacementFragment, textureDisplacement);

    renderer.setVariableDependencies(displacementVariable, [displacementVariable]);

    //Uniforms
    var displacementUniforms = displacementVariable.material.uniforms;
        displacementUniforms.time               = { type:'f', value: 0};
        displacementUniforms.texturePosition = {type: 't', value: texturePosition};

    var error = renderer.init();
    if(error !== null){
        console.error(error);
    }

    var _public = {
        width:width,
        uniforms:displacementUniforms,
        render:function(time){
            displacementUniforms.time.value          = time;
            renderer.compute();
        },
        getTexture:function(){
            return renderer.getCurrentRenderTarget(displacementVariable).texture;
        }
    }

    return _public;
};
