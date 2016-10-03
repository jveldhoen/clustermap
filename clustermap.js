define(["jquery", "text!./clustermap.css","./d3.v3.min", "./clustermapUtils"], function($, cssContent) {'use strict';
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties : {
            version: 1.0,
            qHyperCubeDef : {                
                qDimensions : [],
                qMeasures : [],
                qInitialDataFetch : [{
                    qWidth : 4,
                    qHeight : 1000
                }]
            }
        },
        definition : {
            type : "items",
            component : "accordion",
            items : {
                dimensions : {
                    uses : "dimensions",
                    min : 1,
                    max: 1
                },
                measures : {
                    uses : "measures",
                    min : 3,
                    max: 3
                },
                sorting : {
                    uses : "sorting"
                },
                settings : {
                    uses : "settings",
                    items: {
                      backgroundImage:{
                        ref: "backgroundImage",
                        type: "expression",
                        label: "Image location"
                            },
                      xmin: {
                        ref: "xMin",
                        type: "integer",
                        label: "X min",
                        defaultValue: 0
                            },
                      xmax: {
                        ref: "xMax",
                        type: "integer",
                        label: "X max",
                        defaultValue: 10
                            },
                      ymin: {
                        ref: "yMin",
                        type: "integer",
                        label: "Y min",
                        defaultValue: 0
                            },
                      ymax: {
                        ref: "yMax",
                        type: "integer",
                        label: "Y max",
                        defaultValue: 10
                            }
                    }
                }
            }
        },
        support: {
          snapshot: true,
          export: true,
          exportData: true
        },        
        paint : function($element,layout) {   
            //console.log($element);
            //console.log(layout);

            var self = this;  
            
            var backgroundImage = layout.backgroundImage,
              xMin = layout.xMin,
              xMax = layout.xMax,
              yMin = layout.yMin,
              yMax = layout.yMax;

            senseUtils.extendLayout(layout, self);
            
            viz($element, layout, self, backgroundImage);
        
        },
        resize:function($el,layout){
        this.paint($el,layout);
      }
    };
});


var viz = function($element, layout, _this, backgroundImage, xMin, xMax, yMin, yMax) {
  var id = senseUtils.setupContainer($element,layout,"clustermap"),
    ext_width = $element.width(),
    ext_height = $element.height(),
    classDim = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle.replace(/\s+/g, '-');    

  var data = layout.qHyperCube.qDataPages[0].qMatrix;

  var margin = {top: 30, right: 30, bottom: 30, left: 30 },
      width = 550,
      height = 550;
      // width = ext_width - margin.left - margin.right,
      // height = ext_height - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .range([0, width]);
  var y = d3.scale.linear()
      .range([height, 0]);

// var xMax = 20,
//     xMin = -2,
//     yMax = 24,
//     yMin = 0;
   
x.domain([xMin, xMax]).nice();
y.domain([yMax, yMin]).nice();    

  // var xMax = d3.max(data, function(d) { return d.measure(1).qNum; })*1.02,
  //   xMin = d3.min(data, function(d) { return d.measure(1).qNum; })*0.98,
  //   yMax = d3.max(data, function(d) { return d.measure(2).qNum; })*1.02,
  //   yMin = d3.min(data, function(d) { return d.measure(2).qNum; })*0.98;
    
    // var xMin2 = xMin == xMax ? xMin*0.5 : xMin;
    // var xMax2 = xMin == xMax ? xMax*1.5 : xMax;
    // var yMin2 = yMin == yMax ? yMin*0.5 : yMin;
    // var yMax2 = yMin == yMax ? yMax*1.5 : yMax;

     // x.domain([xMin2, xMax2]).nice();
     // y.domain([yMin2, yMax2]).nice();    
   
  var color = d3.scale.category20();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height)
      .tickFormat(d3.format(".2s")); 

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")  
      .tickSize(-width)       
      .tickFormat(d3.format(".2s"));

  // var zoomBeh = d3.behavior.zoom()
  //     .x(x)
  //     .y(y)
  //     .scaleExtent([0, 500])
  //     .on("zoom", zoom);

   // var button = d3.select("#" + id) 
   //    .append("input")
   //    .attr("type", "button")
   //    .attr("name", "reset")
   //    .attr("value", "Reset Zoom")
   //    .attr("float", "left"); 

  var svg = d3.select("#" + id)    
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
     ;//.call(zoomBeh);
   
   //Add background image
    svg.append("svg:image")
        .attr("class", "backgroundImage")
        .attr("xlink:href", backgroundImage)
        .attr("width", width)
        .attr("height", height)
    ;

  svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  // svg.append("g")
  //   .attr("class", "x axis")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(xAxis)
  //   .append("text")
  //   .attr("class", "label")
  //   .attr("x", width)
  //   .attr("y", margin.bottom - 10)
  //   .style("text-anchor", "end")
  //   .text(senseUtils.getMeasureLabel(1,layout));

  // svg.append("g")
  //   .attr("class", "y axis")
  //   .call(yAxis)
  //   .append("text")
  //   .attr("class", "label")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", -margin.left)
  //   .attr("dy", ".71em")
  //   .style("text-anchor", "end")
  //   .text(senseUtils.getMeasureLabel(2,layout));  

  var plot = svg.append("svg")
    .classed("objects", true)
      .attr("width", width)
      .attr("height", height);    

    plot.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot "+classDim)
        .attr("transform", transform)
        .attr("id", function(d) { return d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"); })

        //To do: create dynamic radius
        .attr("r", function(d) {
            return ((20 + 30*d.measure(3).qNum)) })
        //.attr("r", 25)
        //.attr("r", function(d) { return d.measure(3).qNum; })
        
        //.style("fill", function(d) { return color(d.dim(1).qText); })
        .style("stroke", function(d) {
            var returnColorStroke;
            if (d.measure(3).qNum < 0.1) {
                returnColorStroke = "#2A5070";
            } else if (d.measure(3).qNum < 0.4) {
                returnColorStroke = "#B8A800";
            } else if (d.measure(3).qNum < 0.7) {
                returnColorStroke = "#B27300";
            } else if (d.measure(3).qNum >= 0.7) { returnColorStroke = "#901107"; }
            return returnColorStroke;
        })
        .attr("stroke-width", 3)
        //.attr("stroke-opactiy", 1)
        .style("fill", function(d) {
            var returnColorCircle;
            if (d.measure(3).qNum < 0.1) {
                returnColorCircle = "#4682B4";
            } else if (d.measure(3).qNum < 0.4) {
                returnColorCircle = "#FFEA06";
            } else if (d.measure(3).qNum < 0.7) {
                returnColorCircle = "#FFA500";
            } else if (d.measure(3).qNum  >= 0.7) { returnColorCircle = "#F11605"; }
            return returnColorCircle;
        })
        .on("click", function(d) {d.dim(1).qSelect();});

    plot.selectAll(".kpivalue")
        .data(data)
      .enter().append("text")
        .attr("class", "kpivalue "+classDim)
        .attr("transform", transform)
        //.attr("id", function(d) { return d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"); })
        .text(function(d) {
            return d.measure(3).qText; })
        .on("click", function(d) {d.dim(1).qSelect();})
        //.style("font-size",  function(d) { return (((100 + d.value) / 5)/2)} + "px" )
    ;
        //Mouseover disabled
        // .on("mouseover", function(d){
        //   d3.selectAll($("."+classDim+"#"+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"))).classed("highlight",true);
        //       d3.selectAll($("."+classDim+"[id!="+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-")+"]")).classed("dim",true);
        //   })
        //   .on("mouseout", function(d){
        //       d3.selectAll($("."+classDim+"#"+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-"))).classed("highlight",false);
        //       d3.selectAll($("."+classDim+"[id!="+d.dim(1).qText.replace(/[^A-Z0-9]+/ig, "-")+"]")).classed("dim",false);
        //   })
        //     .append("title")
        //     .html(function(d) {return senseUtils.getDimLabel(1,layout) + ": " + d.dim(1).qText 
        //             + "<br/>" + senseUtils.getMeasureLabel(1,layout) + ": " + d.measure(1).qText
        //             + "<br/>" + senseUtils.getMeasureLabel(2,layout) + ": " + d.measure(2).qText
        //             + "<br/>" + senseUtils.getMeasureLabel(3,layout) + " (Bubble): " + d.measure(3).qText
        //               });
    //Legend disabled
    //  var legend = svg.selectAll(".legend")
    //     .data(color.domain())
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });           
    

    // legend.append("circle")
    //     .attr("r", 5)
    //     .attr("cx", width + 25)
    //     .attr("fill", color);

    // legend.append("text")
    //     .attr("x", width + 32)
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d; });

    //d3.select("input").on("click", change);

    function change() {

      var xMax3 = 20,
          xMin3 = -2,
          yMax3 = 24,
          yMin3 = 0;

      // var xMax3 = d3.max(data, function(d) { return d.measure(1).qNum; })*1.02;
      // var xMin3 = d3.min(data, function(d) { return d.measure(1).qNum; })*0.98;
      // var yMax3 = d3.max(data, function(d) { return d.measure(2).qNum; })*1.02;
      // var yMin3 = d3.min(data, function(d) { return d.measure(2).qNum; })*0.98;

      // zoomBeh
      //   .x(x.domain([xMin3, xMax3]).nice())
      //   .y(y.domain([yMax3, yMin3]).nice());

      var svg = d3.select("#" + id).transition();

      svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(senseUtils.getMeasureLabel(1,layout));
      svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(senseUtils.getMeasureLabel(2,layout));

      plot.selectAll(".dot").transition().duration(1000).attr("transform", transform);
      plot.selectAll(".kpivalue").transition().duration(1000).attr("transform", transform);
      //plot.selectAll(".kpivalue").transition().duration(1000).attr("transform", transformOffset);
    }

    // function zoom() {
    //   svg.select(".x.axis").call(xAxis);
    //   svg.select(".y.axis").call(yAxis);

    //   svg.selectAll(".dot")
    //       .attr("transform", transform);
    //   svg.selectAll(".kpivalue")
    //       .attr("transform", transform);    
    // }

    function transform(d) {    
      
      return "translate(" + x(d.measure(1).qNum) + "," + y(d.measure(2).qNum) + ")";

    }

    function transformOffset(d) {    
      
      return "translate(" + x(d.measure(1).qNum) + "," + y(d.measure(2).qNum) + ")";

    }
}