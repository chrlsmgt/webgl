uniform float size;
uniform float scale;
uniform float textureWidth;
uniform float displacementAmplitude;
uniform sampler2D displacementTexture;

attribute float pIndex;

varying float vOpacity;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
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
		gl_PointSize = size;
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
