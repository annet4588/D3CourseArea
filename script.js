// Set dimentions and margins for the chart
const margin = { top: 70, right: 60, bottom: 50, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Set up x and y scales
const x = d3.scaleTime()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

// Create SVG element
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Create tooltip div
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

//Create a second tooltip div for raw date
const tooltipRawDate = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

// Create our gradient  
const gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 1);

gradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 0);


//Load and process the data
d3.csv("NTDOY.csv").then(data =>{
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d =>{
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
    });
      // Sort data by ascending date
    data.sort((a, b) => a.Date - b.Date);

    // console.log(data.map(d=>d.Date));


// Set domains for x and y scales
x.domain(d3.extent(data, d => d.Date));
y.domain([0, d3.max(data, d => d.Close)]);


// Add x axis
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .style("font-size", "14px")
  .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeMonth.every(1)))
      .tickFormat(d3.timeFormat("%b %Y")))
  .selectAll(" .tick line")
  .style("stroke-opacity", 1)
svg.selectAll(".tick text")
   .attr("fill", "#777");


// Add y axis, append a new group - "g" to svg
svg.append("g")
  .attr("transform", `translate(${width}, 0)`)
  .call(d3.axisRight(y).tickFormat(d =>{
    if(isNaN(d)) return "";
    return `$${d.toFixed(2)}`;
  }))

 // Set up the line generator
 const line = d3.line()
  .x(d => x(d.Date))
  .y(d => y(d.Close));
  
//Create area generator
const area = d3.area()
  .x(d => x(d.Date))
  .y0(height)
  .y1(d => y(d.Close));

//Add the area path
svg.append("path")
  .datum(data)
  .attr("class", "area")
  .attr("d", area)
  .style("fill", "url(#gradient)")
  .style("opacity", .5);

//Add the line path
svg.append("path")
  .datum(data)
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "#86bb65")
  .attr("stroke-width", 1)
  .attr("d", line);

// Add a circle element - the element that follows the mouse around
const circle = svg.append("circle")
  .attr("r", 0)
  .attr("fill", "red")
  .style("stroke", "white")
  .attr("opacity", 0.7)
  .style("pointer-events", "none");

// Add red dashed lines extending from circle to the date and value
const tooltipLineX = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-x")
  .style("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

const tooltipLineY = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-y")
  .style("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

// Create a listening rectangle
const listeningRect = svg.append("rect")
  .attr("width", width)
  .attr("height", height);

//Create a mouse move function
listeningRect.on("mousemove", function(event){
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.Date).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
    const xPos = x(d.Date);
    const yPos = y(d.Close);


// Update the circle position
circle.attr("cx", xPos).attr("cy", yPos);

// Add transition for the circle radius to being able to see the circle
circle.transition()
  .duration(50)
  .attr("r", 5);
//Update the position of the red lines
tooltipLineX.style("display", "block")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", 0)
            .attr("y2", height)
 
tooltipLineY.style("display", "block")
            .attr("y1", yPos)
            .attr("y2", yPos)
            .attr("x1", 0)
            .attr("x2", width)

// Add the tooptip to the page
tooltip
    .style("display", "block")
    .style("left", `${width + 90}px`)
    .style("top", `${yPos + 68}px`)
    .html(`$${d.Close !== undefined ? d.Close.toFixed(2) : 'N/A'}`);

tooltipRawDate
    .style("display", "block")
    .style("left", `${xPos + 60}px`)
    .style("top", `${height + 53}px`)
    .html(`${d.Date !== undefined ? d3.timeFormat("%Y/%m/%d")(d.Date) : 'N/A'}`);

//Create a mouse leave function
listeningRect.on("mouseleave", function(event){
    circle.transition().duration(50).attr("r",0);
    tooltip.style("display", "none");
    tooltipRawDate.style("display", "none");
    tooltipLineX.attr("x1", 0).attr("x2", 0);
    tooltipLineY.attr("y1", 0).attr("y2", 0);
    tooltipLineX.style("display", "none");
    tooltipLineY.style("display", "none");
});

//Define the slider
const sliderRange = d3 
  .sliderBottom()
  .min(d3.min(data, d => d.Date))
  .max(d3.max(data, d => d.Date))
  .width(300)
  .tickFormat(d3.timeFormat("%Y/%m/%d"))
  .ticks(3)
  .default([d3.min(data, d => d.Date), d3.max(data, d=> d.Date)])
  .fill('#85bb65');

// Update if slider changes
sliderRange.on('onchange', val => {
  // Set new domain for x scale
  x.domain(val);

  //Filter data based on slider values min and max
  const filteredData = data.filter(d => d.Date >= val[0] && d.Date <= val[1]);

  // Update the line and are to new domain
  svg.select(".line").attr("d", line(filteredData));
  svg.select(".area").attr("d", area(filteredData));

  // Set new domain for y scale based on new data
  y.domain([0, d3.max(filteredData, d => d.Close)]);

  // Update y axis
  svg.select(".x-axis")
    .transition()
    .duration(300) //transition duration in ms
    .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeMonth.every(1)))
      .tickFormat(d3.timeFormat("%b, %Y")));
  
  // Update y axis
  svg.select(".y-axis")
    .transition()
    .duration(300) //transition duration in ms
    .call(d3.axisRight(y)
      .ticks(10)
      .tickFormat(d => {
        if ( d<= 0) return "";
        return `$${d.toFixed(2)}`;
    }));
})

// Clear old slider content
d3.select("#slider-range").selectAll("*").remove();

// Add the slider to DOM
const gRange = d3 
  .select("#slider-range")
  .append("svg")
  .attr("width", 500)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(90, 30)");

gRange.call(sliderRange);

// Add a chart title
svg.append("text")
  .attr("class", "chart-title")
  .attr("x", margin.left - 80)
  .attr("y", margin.top - 100)
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("Nintendo Co., Ltd. (NTDOY");

//Add the source credit
svg.append("text")
  .attr("class", "source-credit")
  .attr("x", width - 315)
  .attr("y", height + margin.bottom - 7)
  .style("font-size", "12px")
  .style("font-family", "sans-serif")
  .text("Source: https://www.marketwatch.com/investing/stock/NTDOY");

});
});