let data = [
    {//us
        "Corruption": 0.70,
        "Freedom": 0.84,
        "Generosity": 0.57,
        "Negative Affect": 0.27,
        "Positive Affect": 0.82,
        "Social Support": 0.91
    },
    {//korea
        "Corruption": 0.79,
        "Freedom": 0.61,
        "Generosity": 0.35,
        "Negative Affect": 0.29,
        "Positive Affect": 0.66,
        "Social Support": 0.80
    }
];
let features = ["Positive Affect","Negative Affect","Freedom","Social Support","Corruption","Generosity"];

console.log(data);

let svg = d3.select("#radar-chart")
    .append("svg")
    .attr("width", 600)
    .attr("height", 600);

let radialScale = d3.scaleLinear()
    .domain([0,1])
    .range([0,240]);

let ticks = [0.2,0.4,0.6,0.8,1];

ticks.forEach(t =>
    svg.append("circle")
    .attr("cx", 300)
    .attr("cy", 300)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("r", radialScale(t))
);

ticks.forEach(t =>
    svg.append("text")
    .attr("x", 305)
    .attr("y", 295 - radialScale(t))
    .text(t.toString())
);

function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": 300 + x, "y": 300 - y};
}

for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 1);
    let label_coordinate = angleToCoordinate(angle, 1.1);

    //draw axis line
    svg.append("line")
    .attr("x1", 300)
    .attr("y1", 300)
    .attr("x2", line_coordinate.x)
    .attr("y2", line_coordinate.y)
    .attr("stroke","black");

    //draw axis label
    svg.append("text")
    .attr("x", label_coordinate.x)
    .attr("y", label_coordinate.y)
    .attr("class","axisLabel2")
    .text(ft_name)
    .attr("text-anchor", "middle")
    ;
}

let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

let colors = ["#f4794c", "#71c6b0"];

function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}
angleSlice = Math.PI * 2 / 6;
console.log(getPathCoordinates(data[0]));

for (var i = 0; i < data.length; i ++){
    let d = data[i];
    let color = colors[i];
    let coordinates = getPathCoordinates(d);

    //draw the path element
    svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.5)
        .attr("class", "radar");

    svg.selectAll(".radar-circle")
        .data(coordinates)
        .enter()
        .append("circle")
		.attr("r", 8)
		.attr("cx", function(d, i) {
            return d.x; })
		.attr("cy", function(d, i) {
            return d.y; })
		.style("fill", color)
		.style("fill-opacity", 1);
    
    
}



svg.selectAll("path")
    .on('mouseover', function (d,i){
        //Dim all blobs
        d3.selectAll(".radar")
            .transition().duration(200)
            .style("fill-opacity", 0.25)
            .style("stroke-opacity", 0.35); 
        //Bring back the hovered over blob
        d3.select(this)
            .transition().duration(200)
            .style("fill-opacity", 0.75)	
    })
    .on('mouseout', function(){
        //Bring back all blobs
        d3.selectAll(".radar")
            .transition().duration(200)
            .style("fill-opacity", 0.5);
    });