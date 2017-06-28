uniform float size;
uniform float scale;
uniform float textureWidth;
uniform float displacementAmplitude;
uniform sampler2D displacementTexture;

attribute float pIndex;

varying vec3 vLightFront;
varying float vOpacity;

#include <common>

#include <bsdfs>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


// Spotlights
struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 color;
    float distance;
    float decay;
    float coneCos;
    float penumbraCos;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};
uniform SpotLight spotLights[ NB_LIGHTS ];
void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {
    vec3 lVector = spotLight.position - geometry.position;
    directLight.direction = normalize( lVector );
    float lightDistance = length( lVector );
    float angleCos = dot( directLight.direction, spotLight.direction );
    if ( angleCos > spotLight.coneCos ) {
        float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );
        directLight.color = spotLight.color;
        directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );
        directLight.visible = true;
    } else {
        directLight.color = vec3( 0.0 );
        directLight.visible = false;
    }
}

void main() {
	#include <color_vertex>
	#include <begin_vertex>

	float u = mod(pIndex, textureWidth)/textureWidth;
	float v = (pIndex/textureWidth)/textureWidth;

	vec3 data = texture2D(displacementTexture, vec2(u, v)).xyz;
	vec3 displacement = data;

	vOpacity = data.z;

	displacement *= 2.0;
	displacement -= 1.0;
	transformed += displacement*displacementAmplitude;

	#include <project_vertex>
	#ifdef USE_SIZEATTENUATION
		gl_PointSize = size * ( scale / (- mvPosition.z) );
	#else
        ;
		gl_PointSize = size * smoothstep(-5.0, 2.0, displacement.z);
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>


    //Lights
    IncidentLight directLight;
    float dotNL;
    vec3 directLightColor_Diffuse;
    GeometricContext geometry;
    geometry.position = mvPosition.xyz;
    geometry.viewDir  = normalize( -mvPosition.xyz );
    vLightFront = vec3( 0.0 );

    // Spotlights
    for ( int i = 0; i < NB_LIGHTS; i ++ ) {
        getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
        // dotNL = dot( geometry.normal, directLight.direction );
        directLightColor_Diffuse = PI * directLight.color;
        // vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
        vLightFront += directLightColor_Diffuse;
    }
}
