// Parse report data
function parseCSV(d) {
    return { 
        country: d["Country name"],
        region: d["Region"],
        rank: +d["Happiness Rank"],
        gdp: +d["Logged GDP per capita)"],
        social: d["Social support"],
        lifeExpectancy: d["Healthy life expectancy)"],
        freedom: d["Freedom to make life choices"],
        trust: d["Perceptions of corruption"]
    };
}

const promises = [
    d3.csv("./data/WHR20_DataForFigure2.1.csv", parseCSV),
    d3.json("./data/worldgeo.json")
];

Promise.all(promises).then(function(data) {

    const happiness = data[0];
    const world = data[1];

    console.log(happiness);
    console.log(world);

    // Set up canvas
    const width = document.querySelector("#map-holder").clientWidth;
    const height = document.querySelector("#map-holder").clientHeight;
    
    const svg = d3.select("#map-holder")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Draw map
    const projection = d3.geoEquirectangular()
        .scale(250)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    //Bind data and create one path per GeoJSON feature
    countriesGroup = svg.append("g").attr("id", "map");

    countriesGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
    
    const top30 = ["Finland", "Denmark", "Switzerland", "Iceland","Norway", "Netherlands", "Sweden", "New Zealand", "Austria", "Luxembourg", "Canada", "Australia", "United Kingdom", "Israel", "Costa Rica", "Ireland", "Germany", "United States", "Czech Republic", "Belgium", "United Arab Emirates", "Malta", "France", "Mexico", "Taiwan", "Uruguay", "Saudi Arabia", "Spain", "Guatemala", "Italy"];

    // draw a path for each feature/country
    countries = countriesGroup
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function(d, i) {
            return d.properties.iso_a3;
        })
        .attr("class", function(d) {
        if(top30.indexOf(d.properties.name) >= 20) {
            return "top30";
        } else if (top30.indexOf(d.properties.name) >= 10) {
            return "top20"; // HIGHLIGHT IF IN TOP 10
        } else if (top30.indexOf(d.properties.name) >= 0){
            return "top10";
        }
        else if (d.properties.rank) {
            return "country";
        }
        else {
            return "undefined";
        };
    });

    const tooltip = d3.select("#map-holder")
        .append("div")
        .attr("class", "tooltip");

    countries.on("mouseover", function(e, d) {

            d3.selectAll(".country", ".top10").classed("country-on", false);
            d3.select(this).classed("country-on", true) 

            let cx = path.centroid(d)[0];
            let cy = path.centroid(d)[1];

            /*var coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1]; */

            tooltip.style("visibility", "visible")
                .style("left", cx + "px") 
                .style("top", cy + "px")  
                .html(`<b>${d.properties.name}</b><br>Happiness Rank: ${d.properties.rank}<br>Population: ${d.properties.pop_est}`);

        }).on("mouseout", function() {

            tooltip.style("visibility", "hidden");

            d3.select(this)
                .classed("country-on", false);


        });



  /*  // Allow zoom
    const zoom = d3.zoom()
        .scaleExtent([1, 3])
        .on(`zoom`, zoomed);

    svg.call(zoom);

    let k = 1;
    let tX = 0;
    let tY = 0;

    function zoomed(e) {

        k = e.transform.k;
        tX = e.transform.x;
        tY = e.transform.y;

        svg.selectAll("*").attr("transform", e.transform);

        /*svg.selectAll("*").attr("transform", `translate(${width/2}, ${height/2})scale(${k})translate(${-width/2}, ${-height/2})`);

    }*/

});
