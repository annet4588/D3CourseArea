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



//Load and process the data
d3.csv("NTDOY.csv").then(data =>{
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d =>{
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
    });

    console.log(data.map(d=>d.Date));


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
  .style("fill", "#85bb65")
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
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
    const xPos = x(d.Date);
    const yPos = y(d.Close);
})

 
});