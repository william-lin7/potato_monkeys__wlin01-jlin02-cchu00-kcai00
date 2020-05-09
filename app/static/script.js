var format = d3.format(",");

var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

// The svg
var svg = d3.select("#worldmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 1.7 / Math.PI)
    .translate([width / 2, height / 2])

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  // .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .domain([10, 100, 1000, 30000, 100000, 5000000])
  .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.json, "https://res.cloudinary.com/geotargetly/raw/upload/v1579830286/data/iso_3166_country_codes.json")
  // .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
  .await(ready);

  d3.helper = {};
  d3.helper.tooltip = function(accessor){
      return function(selection){
          var tooltipDiv;
          var bodyNode = d3.select('body').node();
          selection.on("mouseover", function(d, i){
              // Clean up lost tooltips
              d3.select('body').selectAll('div.tooltip').remove();
              // Append tooltip
              tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
              var absoluteMousePos = d3.mouse(bodyNode);
              tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                  .style('top', (absoluteMousePos[1] - 15)+'px')
                  .style('position', 'absolute')
                  .style('z-index', 1001)
                  .style('opacity', 1);
              // Add text using the accessor function
              var tooltipText = 'Hi'|| accessor(d, i) || 'Hi';
              // Crop text arbitrarily
              //tooltipDiv.style('width', function(d, i){return (tooltipText.length > 80) ? '300px' : null;})
              //    .html(tooltipText);
          })
          .on('mousemove', function(d, i) {
              // Move tooltip
              var absoluteMousePos = d3.mouse(bodyNode);
              tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                  .style('top', (absoluteMousePos[1] - 15)+'px');
              var tooltipText = accessor(d, i) || '';
              tooltipDiv.html(tooltipText);
          })
          .on("mouseout", function(d, i){
              // Remove tooltip
              tooltipDiv.remove();
          });

      };
  };

function ready(error, topo, ohno) {
  if (error) throw error;
  var dict = {};
  for (var i = 0; i < ohno.length; i++) {data.set(ohno[i].alpha_3, ohno[i].alpha_2);};
  for (var i = 0; i < info['Countries'].length; i++) {
      data.set(info['Countries'][i]['CountryCode'], +info['Countries'][i]['TotalConfirmed']);
      // arr.push(info['Countries'][i]['TotalConfirmed']);
      dict[info['Countries'][i]['CountryCode']] = info['Countries'][i]['TotalConfirmed'];
      // console.log(info);
  }
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter().insert("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        // console.log(data.get(d.id));
        d.total = data.get(data.get(d.id)) || 0;
        return colorScale(d.total);
      })
      .call(d3.helper.tooltip(
        function(d, i){
          // console.log(d);
          return "<b>"+ dict[data.get(d.id)]+ "</b>";
        }
        ));
      svg.insert("path")
          .datum(topojson.mesh(topo.features, function(a, b) { return a.id !== b.id; }))
          .attr("class", "boundary")
          .attr("d", path);
    }
