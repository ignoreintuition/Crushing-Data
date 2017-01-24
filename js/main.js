// Example of how to import data into JS via D3
// Created by Brian Greig
// Last updated 1/23/2017

var headline = "";

var cfg = {
	width: 420,
	barHeight: 20
};

var ds = [];

d3.csv('responses.csv', function(data){
	var arr = [];
	for (i = 0; i < data.length; i++){
		if (arr.indexOf(data[i].headline) === -1) {arr.push(data[i].headline);}
	}
	for (j = 0; j < arr.length; j++){
		var currObj = data.filter(function(a) {
			return a.headline === arr[j]; 
		}, []);
		var reducedObj = currObj.reduce(function(a, b){
			a.count++;
			if (b.recalled_bool === "True") { a.recalled_cnt++; }
			if (b.accuracy_bool === "True") { a.accuracy_cnt++; }
			return a;
		}, { "headline": arr[j], "count": 0, "recalled_cnt": 0, "accuracy_cnt": 0 })
		ds.push(reducedObj);
	}
	renderGraph(ds);
});

function renderGraph (B){
	d3.select(".chart").selectAll("*").remove();

	var x = d3.scaleLinear()
	.domain([0, d3.max(B)])
	.range([0, cfg.width]);

	
	var chart = d3.select(".chart")
	.attr("width", cfg.width)
	.attr("height", cfg.barHeight * B.length);

	var bar = chart.selectAll("g")
	.data(B)
	.enter().append("g")
	.attr("transform", function(d, i) {
		return "translate(0," + i * cfg.barHeight + ")";
	});

	bar.append("rect")
	.attr("width", function(d) { 
		return d.recalled_cnt / 5 + 10;	
	}).attr("height", cfg.barHeight - 1);

	bar.append("text")
	.attr("x", function(d) {
		return d.recalled_cnt / 5; 
	})
	.attr("y", cfg.barHeight / 2)
	.attr("dy", ".35em")
	.text(function(d) {
		return d.recalled_cnt;
	})

};

$("#headline").change(function(){
	var that = this;
	function checkValue(value){
		if (that.value == value.headline){
			console.log(value);
			return value;
		}
	}
	renderGraph(ds.filter(checkValue));

});
