// Example of how to import data into JS via D3
// Created by Brian Greig
// Last updated 1/29/2017

// configuration data to be used in the graphs
var cfg = {
	width: 420,
	barHeight: 20
};

// loads the responses.csv
// ID, headline, order, recalled, accuracy, Weightvar, accuracy_bool, recalled_bool, is_fake

d3.csv('responses.csv', function(data){

	// calls our groupBy function to aggreate our csv dataset by headline.  
	// It will automatically aggregated a count metric
	// We pass two optional parameters for additional metrics (recalled and accuracy)
	var ds = groupBy(data, "headline", ["recalled_bool", "accuracy_bool"]);
	
	// rederGraph will create a graph using the aggregated dataset we created in the last step, assign it to an ID on the page 
	// using the attribute for the third param metric in the fourth parameter.  Fifth parameter is for scaling the graph.
	renderGraph(ds, ".chart", "headline", "recalled_bool", 5);

	// mappedObj is a transforming our Weightvar metric into a dimension (low, medium, high)
	var mappedObj = data.map(function(obj){
		if (Number(obj.Weightvar) <= 0.80) {	
			return {"weight" : "Low", "count": 1};
		} else if(Number(obj.Weightvar) > 0.80 && Number(obj.Weightvar) < 1.0) {
			return {"weight": "Medium", "count": 1};
		} else if (Number(obj.Weightvar) >= 1.0) {
			return {"weight": "High", "count": 1};
		} else {
			return {"weight": "Unknown", "count": 0};
		}
	});

	// Our second dataset (ds2) will be a groupBy of our mapped object
	var ds2 = groupBy(mappedObj, "weight");

	// and will be rendered in a graph
	renderGraph(ds2, ".chart2", "weight", "count", 25);
});


// renderGraph uses D3 to create a simple bar graph for the dataset B 
function renderGraph (B, id, attr, metric, scale){
	d3.select(id).selectAll("*").remove();

	var x = d3.scaleLinear()
	.domain([0, d3.max(B)])
	.range([0, cfg.width]);
	
	var chart = d3.select(id)
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
		return d[metric] / scale + 10;	
	}).attr("height", cfg.barHeight - 1);

	bar.append("text")
	.attr("x", function(d) {
		return d[metric] / scale; 
	})
	.attr("y", cfg.barHeight / 2)
	.attr("dy", ".35em")
	.text(function(d) {
		return d[attr] + ": " + d[metric];
	})

};

// helper function to get all unique values of attr from a dataset data
function getUniqueValues (data, attr){
	var arr = [];
	for (i = 0; i < data.length; i++){
		if (arr.indexOf(data[i][attr]) === -1) {
			arr.push(data[i][attr]);
		}
	}
	return arr;
}

// groupBy function will aggregate our dataset data by attribute attr
// and create a summation of metric0 and metric1 as well as an default count
function groupBy (data, attr, metric){
	var dataset = [];
	var arr = getUniqueValues(data, attr);

	// for loop will access every unique attribute (from our getUniqueValues function) for aggregation.
	for (j = 0; j < arr.length; j++){
		var currObj = data.filter(function(a) {
			return a[attr] === arr[j]; 
		}, []);

		// create an initial array value to be passed into our reduce function
		var initArr = {"count": 0};		
		initArr[attr] = arr[j];
		
		if (metric) {
			for (k=0; k< metric.length; k++){
				metric[k] ? initArr[metric[k]] = 0 : null;
			}
		}
		// reduce function will aggregate each metric if the value is is true 
		var reducedObj = currObj.reduce(function(a, b){
			a.count++;
			if (metric) {
				for (k=0; k< metric.length; k++){
					if (metric[k] && b[metric[k]] === "True") { 
						a[metric[k]]++; 
					}
				}
			}
			return a;
		}, initArr)

		// push the reduced object into an array dataset
		dataset.push(reducedObj);
	}
	// return the final array of values. 
	return dataset;
}