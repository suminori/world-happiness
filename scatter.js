// Parse report data

function returnIndex(d, i) {
    return i + 1;
}

function parseCSV(d) {
    return { 
        country: d["Country name"],
        region: d["Regional indicator"],
        rank: +d["Rank"],
        gdp: +d["Logged GDP per capita"],
        social: +d["Social support"],
        lifeExpectancy: +d["Healthy life expectancy"],
        freedom: +d["Freedom to make life choices"],
        trust: +d["Perceptions of corruption"],
        pop: +d["Population"],
        generosity: +d["Generosity"],
        ladder: +d["Ladder score"]
    };
}

const promise = [
    d3.csv("./data/WHR20_DataForFigure2.1.csv", parseCSV)
];

Promise.all(promise).then(function(data) {
    
    data = data[0];
    console.log(data);

    /*
    DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS
    */
    const width = 1060;
    const height = 680;
    const margin = {top: 50, left: 250, right: 50, bottom: 150};

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    /*
    DETERMINE MIN AND MAX VALUES OF VARIABLES
    */
    const trust = {
        min: d3.min(data, function(d) { return +d.trust; }),
        max: d3.max(data, function(d) { return +d.trust; })
    };
    
    const freedom = {
        min: d3.min(data, function(d) { return +d.freedom; }),
        max: d3.max(data, function(d) { return +d.freedom; })
    };
    
    const pop = {
        min: d3.min(data, function(d) { return +d.pop; }),
        max: d3.max(data, function(d) { return +d.pop; })
    }

    /*
    CREATE SCALES
    */
    const xScale = d3.scaleLinear()
        .domain([0.3, 1])
        .range([margin.left, width-margin.right]);

    var yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height-margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
        .domain([pop.min, pop.max])
        .range([3, 40]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Western Europe", "South Asia", "North America and ANZ", "Middle East and North Africa", "Latin America and Caribbean", "Central and Eastern Europe", "East Asia", "Southeast Asia", "Sub-Saharan Africa", "Commonwealth of Independent States"])
        .range(["#4BBD9F", "#f4794c", "#ffcc73", "#f2ae97", "#781120", "#9a275a", "#d13536", "#683257", "#FFC583", "#bdbdbd"]);
    
    var format = d3.format('.2f');

    /*
    DRAW AXES
    */
    const xAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    /*
    DRAW POINTS
    */
    const points = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function(d) { return xScale(d.freedom); })
        .attr("cy", function(d) { return yScale(d.trust); })
        .attr("r", function(d) { return rScale(d.pop); })
        .attr("fill", function(d) { return colorScale(d.region); })
        .attr("opacity", 0.65);
    
    d3.select("#corruption").on("click", function() {

        yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height-margin.bottom, margin.top]);

        let c = svg.selectAll("circle")
            .data(data);

            c.enter().append("circle")
                .attr("cx", function(d) { return xScale(d.freedom); })
                .attr("cy", function(d) { return yScale(d.trust); })
                .attr("r", function(d) { return rScale(d.pop); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.65)
            .merge(c)   
                .transition() // a transition makes the changes visible...
                .duration(1500)
                .attr("cx", function(d) { return xScale(d.freedom); })
                .attr("cy", function(d) { return yScale(d.trust); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.65);

            c.exit()
                .transition()
                .duration(1500)
                .attr("r",0)
                .remove();

            svg.selectAll("circle").on("mouseover", function(e, d) {

                let cx = +d3.select(this).attr("cx")+20;
                let cy = +d3.select(this).attr("cy")-10;

                tooltip.style("visibility", "visible")
                    .style("left", `${cx}px`)
                    .style("top", `${cy}px`)
                    .html(`<b>Country:</b> ${d.country}<br><b>Rank: </b> ${d.rank}<br><b>Freedom to Make Life Choices:</b> ${format(d.freedom)}<br><b>Perceptions of Corruption:</b> ${format(d.trust)}`);

                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 3);

            }).on("mouseout", function() {

                let cr = +d3.select(this).attr("r");

                tooltip.style("visibility", "hidden");

                d3.select(this)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0);
            })

            svg.selectAll("text").remove();

            const xAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(0,${height-margin.bottom})`)
                .call(d3.axisBottom().scale(xScale));

            const yAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft().scale(yScale));

                const xAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x", margin.left)
                .attr("y", height-margin.bottom/1.75)
                .text("Freedom to Make Life Choices");
        
            const xAxisDescription = svg.append("text")
                .attr("class", "axisDescription")
                .attr("x", margin.left)
                .attr("y", (height-margin.bottom/1.75)+25)
                .text('"Are you satisfied or dissatisfied with your freedom to choose what you do with your life?"'); 
        
            var yAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x",margin.left/5 -20)
                .attr("y",margin.top + 10)
                .text("Perceptions of");
        
            var yAxisLabel2 = svg.append("text")
                .attr("class","axisLabel")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 30)
                .text("Corruption");
        
            var yAxisDescription = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 55)
                .text('"Is corruption widespread');
        
            var yAxisDescription2 = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 72)
                .text('in the government or not?"');

        });

    d3.select("#social").on("click", function() {

        yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height-margin.bottom, margin.top]);

        let c = svg.selectAll("circle")
            .data(data);
        
            c.enter().append("circle")
                .attr("cx", function(d) { return xScale(d.freedom); })
                .attr("cy", function(d) { return yScale(d.social); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.65)
            .merge(c)   
                .transition() // a transition makes the changes visible...
                .duration(1500)
                .attr("cx", function(d) { return xScale(d.freedom); })
                .attr("cy", function(d) { return yScale(d.social); })
                .attr("fill", function(d) { return colorScale(d.region); })
                .attr("opacity", 0.65);

            c.exit()
                .transition()
                .duration(1500)
                .attr("r",0)
                .remove();

            svg.selectAll("circle").on("mouseover", function(e, d) {

                let cx = +d3.select(this).attr("cx")+20;
                let cy = +d3.select(this).attr("cy")-10;

                tooltip.style("visibility", "visible")
                    .style("left", `${cx}px`)
                    .style("top", `${cy}px`)
                    .html(`<b>Country:</b> ${d.country}<br><b>Rank: </b> ${d.rank}<br><b>Freedom to Make Life Choices:</b> ${format(d.freedom)}<br><b>Social Support:</b> ${format(d.social)}`);

                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 3);

            }).on("mouseout", function() {

                let cr = +d3.select(this).attr("r");

                tooltip.style("visibility", "hidden");

                d3.select(this)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0);
            })
            
        svg.selectAll("text").remove();

        const xAxis = svg.append("g")
            .attr("class","axis")
            .attr("transform", `translate(0,${height-margin.bottom})`)
            .call(d3.axisBottom().scale(xScale));

        const yAxis = svg.append("g")
            .attr("class","axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft().scale(yScale));

        const xAxisLabel = svg.append("text")
            .attr("class","axisLabel")
            .attr("x", margin.left)
            .attr("y", height-margin.bottom/1.75)
            .text("Freedom to Make Life Choices");

        const xAxisDescription = svg.append("text")
            .attr("class", "axisDescription")
            .attr("x", margin.left)
            .attr("y", (height-margin.bottom/1.75)+25)
            .text('"Are you satisfied or dissatisfied with your freedom to choose what you do with your life?"'); 

        var yAxisLabel = svg.append("text")
            .attr("class","axisLabel")
            .attr("x",margin.left/5 -20)
            .attr("y",margin.top + 10)
            .text("Social Support");

        var yAxisLabel2 = svg.append("text")
            .attr("class","axisDescription")
            .attr("x",margin.left/5-20)
            .attr("y",margin.top + 35)
            .text('“If you were in trouble, do');

        var yAxisDescription = svg.append("text")
            .attr("class","axisDescription")
            .attr("x",margin.left/5-20)
            .attr("y",margin.top + 52)
            .text('you have relatives or friends');

        var yAxisDescription2 = svg.append("text")
            .attr("class","axisDescription")
            .attr("x",margin.left/5-20)
            .attr("y",margin.top + 69)
            .text('you can count on to help');

        var yAxisDescription2 = svg.append("text")
            .attr("class","axisDescription")
            .attr("x",margin.left/5-20)
            .attr("y",margin.top + 86)
            .text('you whenever you need');

        var yAxisDescription2 = svg.append("text")
            .attr("class","axisDescription")
            .attr("x",margin.left/5-20)
            .attr("y",margin.top + 103)
            .text('them, or not?”');
                
        });

    d3.select("#generosity").on("click", function() {

        yScale = d3.scaleLinear()
        .domain([-0.5, 1])
        .range([height-margin.bottom, margin.top]);

            let c = svg.selectAll("circle")
                .data(data);
            
                c.enter().append("circle")
                    .attr("cx", function(d) { return xScale(d.freedom); })
                    .attr("cy", function(d) { return yScale(d.generosity); })
                    .attr("fill", function(d) { return colorScale(d.region); })
                    .attr("opacity", 0.65)
                .merge(c)   
                    .transition() // a transition makes the changes visible...
                    .duration(1500)
                    .attr("cx", function(d) { return xScale(d.freedom); })
                    .attr("cy", function(d) { return yScale(d.generosity); })
                    .attr("fill", function(d) { return colorScale(d.region); })
                    .attr("opacity", 0.65);
    
                c.exit()
                    .transition()
                    .duration(1500)
                    .attr("r",0)
                    .remove();
    
                svg.selectAll("circle").on("mouseover", function(e, d) {
    
                    let cx = +d3.select(this).attr("cx")+20;
                    let cy = +d3.select(this).attr("cy")-10;
    
                    tooltip.style("visibility", "visible")
                        .style("left", `${cx}px`)
                        .style("top", `${cy}px`)
                        .html(`<b>Country:</b> ${d.country}<br><b>Rank: </b> ${d.rank}<br><b>Freedom to Make Life Choices:</b> ${format(d.freedom)}<br><b>Generosity:</b> ${format(d.generosity)}`);
    
                    d3.select(this)
                        .attr("stroke", "#ffffff")
                        .attr("stroke-width", 3);
    
                }).on("mouseout", function() {
    
                    let cr = +d3.select(this).attr("r");
    
                    tooltip.style("visibility", "hidden");
    
                    d3.select(this)
                        .attr("stroke", "none")
                        .attr("stroke-width", 0);
                })
                
            svg.selectAll("text").remove();
    
            const xAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(0,${height-margin.bottom})`)
                .call(d3.axisBottom().scale(xScale));
    
            const yAxis = svg.append("g")
                .attr("class","axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft().scale(yScale));
    
            const xAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x", margin.left)
                .attr("y", height-margin.bottom/1.75)
                .text("Freedom to Make Life Choices");
    
            const xAxisDescription = svg.append("text")
                .attr("class", "axisDescription")
                .attr("x", margin.left)
                .attr("y", (height-margin.bottom/1.75)+25)
                .text('"Are you satisfied or dissatisfied with your freedom to choose what you do with your life?"'); 
    
            var yAxisLabel = svg.append("text")
                .attr("class","axisLabel")
                .attr("x",margin.left/5 -20)
                .attr("y",margin.top + 10)
                .text("Generosity");
    
            var yAxisLabel2 = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 35)
                .text('“Have you donated money');
    
            var yAxisDescription = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 52)
                .text('to a charity in the past');
    
            var yAxisDescription2 = svg.append("text")
                .attr("class","axisDescription")
                .attr("x",margin.left/5-20)
                .attr("y",margin.top + 69)
                .text('month?"');
            });

    /* 
    DRAW AXIS LABELS 
    */
    const xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", margin.left)
        .attr("y", height-margin.bottom/1.75)
        .text("Freedom to Make Life Choices");

    const xAxisDescription = svg.append("text")
        .attr("class", "axisDescription")
        .attr("x", margin.left)
        .attr("y", (height-margin.bottom/1.75)+25)
        .text('"Are you satisfied or dissatisfied with your freedom to choose what you do with your life?"'); 

    var yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x",margin.left/5 -20)
        .attr("y",margin.top + 10)
        .text("Perceptions of");

    var yAxisLabel2 = svg.append("text")
        .attr("class","axisLabel")
        .attr("x",margin.left/5-20)
        .attr("y",margin.top + 30)
        .text("Corruption");

    var yAxisDescription = svg.append("text")
        .attr("class","axisDescription")
        .attr("x",margin.left/5-20)
        .attr("y",margin.top + 55)
        .text('"Is corruption widespread');

    var yAxisDescription2 = svg.append("text")
        .attr("class","axisDescription")
        .attr("x",margin.left/5-20)
        .attr("y",margin.top + 72)
        .text('in the government or not?"');

    /* TOOLTIP */
    
    const tooltip = d3.select("#scatter-plot")
        .append("div")
        .attr("class", "tooltip");

    points.on("mouseover", function(e, d) {

        let cx = +d3.select(this).attr("cx");
        let cy = +d3.select(this).attr("cy");
        let cr = +d3.select(this).attr("r");

        tooltip.style("visibility", "visible")
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Country:</b> ${d.country}<br><b>Rank: </b> ${d.rank}<br><b>Freedom to Make Life Choices:</b> ${format(d.freedom)}<br><b>Perceptions of Corruption:</b> ${format(d.trust)}`);

        d3.select(this)
            .attr("r", cr+5)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 3);

    }).on("mouseout", function() {

        let cr = +d3.select(this).attr("r");

        tooltip.style("visibility", "hidden");

        d3.select(this)
            .attr("r", cr-5)
            .attr("stroke", "none")
            .attr("stroke-width", 0);
    })

    d3.selectAll("input").on("click", function() {

        let region = d3.select(this).property("value");

        let selection = points.filter(function(d) {
            return d.region === region;
        });

        let isChecked = d3.select(this).property("checked");

        if (isChecked == true) {
            selection.attr("opacity", 0.65)
            .attr("pointer-events", "all");
        } else {
            selection.attr("opacity", 0)
            .attr("pointer-events", "none");
        };
    });
});