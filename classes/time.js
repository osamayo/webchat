"use strict";

class Time
{
	constructor () {}
	
	static timestamp()
	{
		return Math.floor(Date.now()/1000);
	}
}

module.exports = Time;

// console.log(Time.timestamp());