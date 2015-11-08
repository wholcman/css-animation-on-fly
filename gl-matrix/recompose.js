/**
	References:
	https://github.com/mattdesl/mat4-decompose/blob/master/index.js
**/

var glMatrix = glMatrix || {};

var tmpRecompose = glMatrix.mat4.create()

glMatrix.recompose = function recompose(matrix, translation, scale, skew, perspective, quaternion) {
	glMatrix.mat4.identity(matrix)
	//apply translation & rotation
	glMatrix.mat4.fromRotationTranslation(matrix, quaternion, translation)

	//apply perspective
	matrix[3] = perspective[0]
	matrix[7] = perspective[1]
	matrix[11] = perspective[2]
	matrix[15] = perspective[3]
		
	// apply skew
	// tmpRecompose is a identity 4x4 matrix initially
	
	glMatrix.mat4.identity(tmpRecompose)

	if (skew[2] !== 0) {
		tmpRecompose[9] = skew[2]
		glMatrix.mat4.multiply(matrix, matrix, tmpRecompose)
	}

	if (skew[1] !== 0) {
		tmpRecompose[9] = 0
		tmpRecompose[8] = skew[1]
		glMatrix.mat4.multiply(matrix, matrix, tmpRecompose)
	}

	if (skew[0] !== 0) {
		tmpRecompose[8] = 0
		tmpRecompose[4] = skew[0]
		glMatrix.mat4.multiply(matrix, matrix, tmpRecompose)
	}

	//apply scale
	glMatrix.mat4.scale(matrix, matrix, scale)
	return matrix
}