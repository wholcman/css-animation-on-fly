/**
	References:
	https://github.com/mattdesl/mat4-interpolate/blob/master/index.js
**/

var glMatrix = glMatrix || {};
var state0 = state()
var state1 = state()
var tmp = state()

glMatrix.interpolate = function interpolate(out, start, end, alpha) {
	if (glMatrix.mat4.determinant(start) === 0 || glMatrix.mat4.determinant(end) === 0)
		return false

	//decompose the start and end matrices into individual components
	var r0 = glMatrix.decompose(start, state0.translate, state0.scale, state0.skew, state0.perspective, state0.quaternion)
	var r1 = glMatrix.decompose(end, state1.translate, state1.scale, state1.skew, state1.perspective, state1.quaternion)
	if (!r0 || !r1)
		return false    

	//now lerp/slerp the start and end components into a temporary     lerp(tmptranslate, state0.translate, state1.translate, alpha)
	glMatrix.vec3.lerp(tmp.translate, state0.translate, state1.translate, alpha)
	glMatrix.vec3.lerp(tmp.skew, state0.skew, state1.skew, alpha)
	glMatrix.vec3.lerp(tmp.scale, state0.scale, state1.scale, alpha)
	glMatrix.vec3.lerp(tmp.perspective, state0.perspective, state1.perspective, alpha)
	slerp(tmp.quaternion, state0.quaternion, state1.quaternion, alpha)

	//and recompose into our 'out' matrix
	glMatrix.recompose(out, tmp.translate, tmp.scale, tmp.skew, tmp.perspective, tmp.quaternion)
	return true
}

function state() {
	return {
		translate: vector3(),
		scale: vector3(1),
		skew: vector3(),
		perspective: vector4(),
		quaternion: vector4()
	}
}

function vector3(n) {
	return [n||0,n||0,n||0]
}

function vector4() {
	return [0,0,0,1]
}