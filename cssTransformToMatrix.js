/**
 * @class cssTransformToMatrix
 * @name cssTransformToMatrix
 */

/**
	References:
	https://github.com/Jam3/css-transform-to-mat4/blob/master/index.js
**/

function cssTransformToMatrix(value) {

	var functions = value.match(/[A-z3]+\([^\)]+/g) || [];
	var outMatrix = glMatrix.mat4.create();
	var matrices = [];

	functions.forEach( function(func) {

		var split = func.split('('); 
		var name = split[ 0 ]
		var value = split[ 1 ];
		var matrix;

		switch(name) {

			case 'matrix':
				value = value.split(',').map(parseFloat);
				matrix = [
					value[ 0 ], value[ 1 ], 0, 0,
					value[ 2 ], value[ 3 ], 0, 0,
					0,          0,          1, 0,
					value[ 4 ], value[ 5 ], 0, 1
				];
			break;

			case 'matrix3d':
				matrix = value.split(',').map(parseFloat);
			break;

			case 'translate':
			case 'translate3d':
				matrix = glMatrix.mat4.create();
				value = value.split(',').map(parseFloat);

				if(value.length === 2) {
					value.push(0);
				}

				glMatrix.mat4.translate(matrix, matrix, value);
			break;

			case 'translateX':
				matrix = glMatrix.mat4.create();
				value = [ parseFloat(value), 0, 0 ];
				glMatrix.mat4.translate(matrix, matrix, value);
			break;

			case 'translateY':
				matrix = glMatrix.mat4.create();
				value = [ 0, parseFloat(value), 0 ];
				glMatrix.mat4.translate(matrix, matrix, value);
			break;

			case 'translateZ':
				matrix = glMatrix.mat4.create();
				value = [ 0, 0, parseFloat(value) ];
				glMatrix.mat4.translate(matrix, matrix, value);
			break;

			case 'rotate':
			case 'rotateZ':
				matrix = glMatrix.mat4.create();
				value = glMatrix.getRadian(value);
				glMatrix.mat4.rotateZ(matrix, matrix, value);
			break;

			case 'scale':
			case 'scale3d':
				matrix = glMatrix.mat4.create();
				value = value.split(',').map(parseFloat);

				if(value.length === 2) {
					value.push(1);  
				}
				
				glMatrix.mat4.scale(matrix, matrix, value);
			break;

			case 'scaleX':
				matrix = glMatrix.mat4.create();
				glMatrix.mat4.scale(matrix, matrix, [parseFloat(value), 1, 1]);
			break;

			case 'scaleY':
				matrix = glMatrix.mat4.create();
				glMatrix.mat4.scale(matrix, matrix, [1, parseFloat(value), 1]);
			break;

			case 'scaleZ':
				matrix = glMatrix.mat4.create();
				glMatrix.mat4.scale(matrix, matrix, [1, 1, parseFloat(value)]);
			break;

			case 'rotateX':
				matrix = glMatrix.mat4.create();
				value = glMatrix.getRadian(value);
				glMatrix.mat4.rotateX(matrix, matrix, value);
			break;

			case 'rotateY':
				matrix = glMatrix.mat4.create();
				value = glMatrix.getRadian(value);
				glMatrix.mat4.rotateY(matrix, matrix, value);
			break;

			case 'rotate3d':
				matrix = glMatrix.mat4.create();
				value = value.split(',');
				glMatrix.mat4.rotate(matrix, matrix, glMatrix.getRadian(value[3]), value.slice(0, 3).map(parseFloat));
			break;

			case 'perspective':
				// The matrix is computed by starting with an identity matrix and replacing the value at row 3, 
				// column 4 with the value -1/depth. The value for depth must be greater than zero, otherwise 
				// the function is invalid.
				value = parseFloat(value);

				matrix = [
					1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, -1 / value,
					0, 0, 0, 1
				];
			break;

			case 'skew':
				matrix = glMatrix.mat4.create();
				value = value.split(',').map(glMatrix.getRadian);
				matrix = [
					1,                    Math.tan(value[ 0 ]), 0, 0,
					Math.tan(value[ 1 ]), 1,                    0, 0,
					0,                    0,                    1, 0,
					0,                    0,                    0, 1
				];
			break;

			case 'skewX':
				matrix = glMatrix.mat4.create();
				value = glMatrix.getRadian(value);
				matrix = [
					1,               0, 0, 0,
					Math.tan(value), 1, 0, 0,
					0,               0, 1, 0,
					0,               0, 0, 1
				];
			break;

			case 'skewY':
				matrix = glMatrix.mat4.create();
				value = glMatrix.getRadian(value);
				matrix = [
					1, Math.tan(value), 0, 0,
					0, 1,               0, 0,
					0, 0,               1, 0,
					0, 0,               0, 1
				];
			break;

			case 'none':
			case 'initial':
			break;

			default:
				throw new Error('Unsupported transform function: ' + name);
			break;
		};

		if(matrix) {
			glMatrix.mat4.multiply(outMatrix, outMatrix, matrix);
		}
	});

	return outMatrix;
};
