uniform vec3 diffuse;
uniform float opacity;

varying vec3 vLightFront;
varying float vOpacity;

#include <common>
#include <packing>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <bsdfs>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

float czm_luminance(vec3 rgb)
{
    // Algorithm from Chapter 10 of Graphics Shaders.
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    return dot(rgb, W);
}

void main() {
	#include <clipping_planes_fragment>

    // float newOpacity = (vOpacity*opacity)+ 0.6;
    float newOpacity = opacity;
    vec4 diffuseColor = vec4( diffuse, newOpacity );

    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

    //Lights
    // vec3 totalEmissiveRadiance = vec3(0.0,0.0,0.0);
    // reflectedLight.indirectDiffuse = vec3(1.0);
    // reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
    // reflectedLight.directDiffuse = vLightFront;
    // reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

    // vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
    float lum = czm_luminance(vLightFront);
	vec3 outgoingLight = vLightFront*lum + diffuseColor.rgb*(1.0 - lum);



	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}
