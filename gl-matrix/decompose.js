/**
	References:
	https://github.com/mattdesl/mat4-decompose/blob/master/index.js
**/

var tmpDecompose = glMatrix.mat4.create()
var perspectiveMatrix = glMatrix.mat4.create()
var tmpVec4 = [0, 0, 0, 0]
var row = [ [0,0,0], [0,0,0], [0,0,0] ]
var pdum3 = [0,0,0]

var glMatrix = glMatrix || {};
glMatrix.decompose = function decompose(matrix, translation, scale, skew, perspective, quaternion) {
	if (!translation) translation = [0,0,0]
	if (!scale) scale = [0,0,0]
	if (!skew) skew = [0,0,0]
	if (!perspective) perspective = [0,0,0,1]
	if (!quaternion) quaternion = [0,0,0,1]

	//normalize, if not possible then bail out early
	if (!normalize(tmpDecompose, matrix))
		return false

	// perspectiveMatrix is used to solve for perspective, but it also provides
	// an easy way to test for singularity of the upper 3x3 component.
	glMatrix.mat4.clone(perspectiveMatrix, tmpDecompose)

	perspectiveMatrix[3] = 0
	perspectiveMatrix[7] = 0
	perspectiveMatrix[11] = 0
	perspectiveMatrix[15] = 1

	// If the perspectiveMatrix is not invertible, we are also unable to
	// decompose, so we'll bail early. Constant taken from SkMatrix44::invert.
	if (Math.abs(glMatrix.mat4.determinant(perspectiveMatrix) < 1e-8))
		return false

	var a03 = tmpDecompose[3], a13 = tmpDecompose[7], a23 = tmpDecompose[11],
			a30 = tmpDecompose[12], a31 = tmpDecompose[13], a32 = tmpDecompose[14], a33 = tmpDecompose[15]

	// First, isolate perspective.
	if (a03 !== 0 || a13 !== 0 || a23 !== 0) {
		tmpVec4[0] = a03
		tmpVec4[1] = a13
		tmpVec4[2] = a23
		tmpVec4[3] = a33

		// Solve the equation by inverting perspectiveMatrix and multiplying
		// rightHandSide by the inverse.
		// resuing the perspectiveMatrix here since it's no longer needed
		var ret = glMatrix.mat4.invert(perspectiveMatrix, perspectiveMatrix)
		if (!ret) return false
		glMatrix.mat4.transpose(perspectiveMatrix, perspectiveMatrix)

		//multiply by transposed inverse perspective matrix, into perspective vec4
		vec4multMat4(perspective, tmpVec4, perspectiveMatrix)
	} else { 
		//no perspective
		perspective[0] = perspective[1] = perspective[2] = 0
		perspective[3] = 1
	}

	// Next take care of translation
	translation[0] = a30
	translation[1] = a31
	translation[2] = a32

	// Now get scale and shear. 'row' is a 3 element array of 3 component vectors
	mat3from4(row, tmpDecompose)

	// Compute X scale factor and normalize first row.
	scale[0] = glMatrix.vec3.len(row[0])
	glMatrix.vec3.normalize(row[0], row[0])

	// Compute XY shear factor and make 2nd row orthogonal to 1st.
	skew[0] = glMatrix.vec3.dot(row[0], row[1])
	combine(row[1], row[1], row[0], 1.0, -skew[0])

	// Now, compute Y scale and normalize 2nd row.
	scale[1] = glMatrix.vec3.len(row[1])
	glMatrix.vec3.normalize(row[1], row[1])
	skew[0] /= scale[1]

	// Compute XZ and YZ shears, orthogonalize 3rd row
	skew[1] = glMatrix.vec3.dot(row[0], row[2])
	combine(row[2], row[2], row[0], 1.0, -skew[1])
	skew[2] = glMatrix.vec3.dot(row[1], row[2])
	combine(row[2], row[2], row[1], 1.0, -skew[2])

	// Next, get Z scale and normalize 3rd row.
	scale[2] = glMatrix.vec3.len(row[2])
	glMatrix.vec3.normalize(row[2], row[2])
	skew[1] /= scale[2]
	skew[2] /= scale[2]


	// At this point, the matrix (in rows) is orthonormal.
	// Check for a coordinate system flip.  If the determinant
	// is -1, then negate the matrix and the scaling factors.
	glMatrix.vec3.cross(pdum3, row[1], row[2])
	if (glMatrix.vec3.dot(row[0], pdum3) < 0) {
		for (var i = 0; i < 3; i++) {
			scale[i] *= -1;
			row[i][0] *= -1
			row[i][1] *= -1
			row[i][2] *= -1
		}
	}

	// Now, get the rotations out
	quaternion[0] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0))
	quaternion[1] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0))
	quaternion[2] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0))
	quaternion[3] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0))

	if (row[2][1] > row[1][2])
		quaternion[0] = -quaternion[0]
	if (row[0][2] > row[2][0])
		quaternion[1] = -quaternion[1]
	if (row[1][0] > row[0][1])
		quaternion[2] = -quaternion[2]
	return true
}

//will be replaced by gl-vec4 eventually
function vec4multMat4(out, a, m) {
	var x = a[0], y = a[1], z = a[2], w = a[3];
	out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	return out;
}

//gets upper-left of a 4x4 matrix into a 3x3 of vectors
function mat3from4(out, mat4x4) {
	out[0][0] = mat4x4[0]
	out[0][1] = mat4x4[1]
	out[0][2] = mat4x4[2]
	
	out[1][0] = mat4x4[4]
	out[1][1] = mat4x4[5]
	out[1][2] = mat4x4[6]

	out[2][0] = mat4x4[8]
	out[2][1] = mat4x4[9]
	out[2][2] = mat4x4[10]
}

function normalize(out, mat) {
	var m44 = mat[15]
	// Cannot normalize.
	if (m44 === 0) 
		return false
	var scale = 1 / m44
	for (var i=0; i<16; i++)
		out[i] = mat[i] * scale
	return true
}

function combine(out, a, b, scale1, scale2) {
	out[0] = a[0] * scale1 + b[0] * scale2
	out[1] = a[1] * scale1 + b[1] * scale2
	out[2] = a[2] * scale1 + b[2] * scale2
}
