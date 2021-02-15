"use strict";

class Random
{
	constructor (){}

	static getRndInt(min, max)
	{
		// console.log("min: " + min + " | max: " + max);
		var ret = Math.floor(Math.random() * (max - min +1)) + min;
		// console.log(ret);
		return ret;
	}

	static getRndChar(str)
	{
		return str.charAt(this.getRndInt(0, str.length));
	}
}

module.exports = Random

// console.log(Random.getRndChar("hello"));