/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


//Constants for the SVG
var margin = {top: 0, right: 0, bottom: 5, left: 15};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 1250 - margin.top - margin.bottom;

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Set up the force layout
var force = d3.layout.force()
    .charge(-50)
    .linkDistance(100)
    .gravity(0.1)
    //.friction(0.5)
    .alpha(0.1)
    .size([width, height/2]);

var data;
var nodes =[], links =[];

var link;
var linkArcs;
var terms = new Object();

var xStep = 20;
var xScale = d3.scale.linear().range([xStep, (width-xStep)]);
var yScale;
var linkScale;
var searchTerm ="";
var optArray = [];   // FOR search box

var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xStep+xScale(d.yearId); })
        .y0(function(d) { return d.yNode-yScale(d.value); })
        .y1(function(d) {  return d.yNode +yScale(d.value); });

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .style('top', "200px")
  .style('left', function(d) { return "200px";  })
  .offset(function(d) {
    var a =[-10,0];
    a[0] =-10;
    a[1] = 0;
    return a;
  })
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d + "</span>";
  })
svg.call(tip);


var minT=1000000, maxT=0;
var suspicious = {};




d3.csv("data/involvedCompanyIndex.csv", function(error, data1) {
    data1.forEach(function (d) {
        suspicious[d.ID] = d;
    });


    d3.csv("data/involved.csv", function (error, data2) {
        if (error) throw error;
        data = data2;
        data.forEach(function (d) {
            // var year =  new Date(d.date).getMonth();
            var day = Math.round(+d["X4"] / (24 * 3600));
            minT = Math.min(minT, day);
            maxT = Math.max(maxT, day);

            var id1 = +d["X1"];
            if (terms[id1] == undefined) {
                terms[id1] = new Object();
                terms[id1].count = 1;
                terms[id1].id = id1;
                terms[id1].listTimes = [];
                terms[id1].listTimes.push(day);
                nodes.push(terms[id1]);
            }
            else {
                terms[id1].count++;
                terms[id1].listTimes.push(day);
            }


            if (terms[id1][day] == undefined) {
                terms[id1][day] = {};
                terms[id1][day].id = id1;
                terms[id1][day].rows = [];

            }
            terms[id1][day].rows.push(d)


            var id2 = +d["X3"];
            if (terms[id2] == undefined) {
                terms[id2] = new Object();
                terms[id2].count = 1;
                terms[id1].id = id1;
                terms[id2].listTimes = [];
                terms[id2].listTimes.push(day);
                nodes.push(terms[id2]);
            }
            else {
                terms[id2].count++;
                terms[id2].listTimes.push(day);
            }


            if (terms[id2][day] == undefined) {
                terms[id2][day] = {};
                terms[id2][day].id = id2;
                terms[id2][day].rows = [];

            }
            terms[id2][day].rows.push(d)

            var l = new Object();
            l.source = terms[id1];
            l.target = terms[id2];
            l.time = day;
            l.category = d["X2"];
            links.push(l);
        });
        xScale.domain([0, maxT]); // Set time domain


        /*force.linkDistance(function (l) {
            return 5 + l.time / 30;
        });*/

        force.nodes(nodes)
            .links(links)
            .start(100, 150, 200);

        computeLinks();


        force.on("tick", function () {
            tick();
        });


        // Other functions *************************
        drawLegends();

        /*for (var i = 0; i < termArray.length; i++) {
         optArray.push(termArray[i].term);
         }
         optArray = optArray.sort();
         $(function () {
         $("#search").autocomplete({
         source: optArray
         });
         }); */
    });
});




function computeLinks() {
    //Create all the line svgs but without locations yet
    svg.selectAll(".linkArc").remove();
    linkArcs = svg.append("g").selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke", function (d) {
                return colores_google(d.category);
        })
        .style("stroke-opacity", 0.3)
        .style("stroke-width", function (d) {
            return 2;
        });
//            .on('mouseover', mouseoveredLink)
//            .on('mouseout', mouseoutedLink);



    svg.selectAll(".nodeG").remove();
    nodeG = svg.selectAll(".nodeG")
        .data(nodes).enter().append("circle")
        .attr("class", "nodeG")
        .attr('r', function (d) { return suspicious[d.id] ? 6 : 3;})
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr("fill", function (d) { return suspicious[d.id] ? "#a00" : "#444"})
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1);;

    /*
    nodeG.append("text")
        .attr("class", "nodeText")
        .text(function(d) { return d.name })
        .attr("dy", "3px")
        .style("fill","#000000")
        .style("text-anchor","end")
        .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
        .style("font-weight", function(d) { return d.isSearchTerm ? "bold" : ""; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px");
    */

    /*
    svg.selectAll(".nodeLine").remove();
    svg.selectAll(".nodeLine")
        .data(nodes).enter()
        .append("line")
        .attr("class", "nodeLine")
        .attr("x1", function(d) { return d.x; })
        .attr("y1", function(d) { return d.y; })
        .attr("x2", function(d) { return d.x+xScale(70); })
        .attr("y2", function(d) { return d.y; })
        .style("stroke-width",0.5)
        .style("stroke-opacity",0.5)
        .style("stroke", "#000");
    */

    // Horizontal lines
 /*   svg.selectAll(".linePNodes").remove();
    linePNodes = svg.selectAll(".linePNodes")
        .data(pNodes).enter().append("line")
        .attr("class", "linePNodes")
        .attr("x1", function(d) {return xStep+xScale(d.minY);})
        .attr("y1", function(d) {return d.y;})
        .attr("x2", function(d) {return xStep+xScale(d.maxY);})
        .attr("y2", function(d) {return d.y;})
        .style("stroke-dasharray", ("1, 1"))
        .style("stroke-width",0.4)
        .style("stroke", "#000");*/
}

function tick(){
    nodes.forEach(function(d) {
     //   d.x += (width/2-d.x)*0.1;
    });


//    linkArcs.style("stroke-width", 0);
    svg.selectAll(".nodeLine")
        .style("stroke-opacity" , 0.01);

    nodeG.attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

    yScale = d3.scale.linear()
    .range([0, 2])
    .domain([0, 10]);

    linkArcs.attr("d", linkArc);
}


function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy)*2;
    if (d.source.y<d.target.y )
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    else
        return "M" + +d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
}

function linkArc2(d) {
    var xx = xScale(d.time),
        dy = d.target.y - d.source.y,
        dr = dy/2;
    if (d.source.y<d.target.y )
        return "M" + xx + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.target.y;
    else
        return "M" + xx + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.source.y;
}


