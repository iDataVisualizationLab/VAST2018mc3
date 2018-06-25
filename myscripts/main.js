/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


//Constants for the SVG
var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 1300;

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Set up the force layout
var force = d3.layout.force()
    .charge(-25)
    //.linkDistance(100)
    .gravity(0.1)
    //.friction(0.5)
   // .linkStrength(0.3)
    .alpha(0.1)
    .size([width, height]);

var data;
var node,linkArcs;
var nodes =[], links =[];
var nodeSuspicious =[], linkSuspicious =[];
var nodeRelated =[], linkelated =[];

var terms = new Object();

var xStep = 200;
var xScale = d3.scale.linear().range([xStep, (width-xStep)]);
var yScale;
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
                terms[id1].degree = 1;
                terms[id1].id = id1;
                terms[id1].listTimes = [];
                terms[id1].listTimes.push(day);
                nodes.push(terms[id1]);
            }
            else {
                terms[id1].degree++;
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
                terms[id2].degree = 1;
                terms[id2].id = id2;
                terms[id2].listTimes = [];
                terms[id2].listTimes.push(day);
                nodes.push(terms[id2]);
            }
            else {
                terms[id2].degree++;
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
            l.id = l.source.id + " " + l.target.id+" "+d["X4"];
            l.category = d["X2"];
            links.push(l);
        });


        // Compute Suspicious nodes
        for (var i=0; i< nodes.length;i++){
            if (suspicious[nodes[i].id])
                nodeSuspicious.push(nodes[i]);
            else
                nodeRelated.push(nodes[i]);
        }
        for (var i=0; i< links.length;i++){
            if (suspicious[links[i].source.id] && suspicious[links[i].target.id]){
                linkSuspicious.push(links[i]);
                links[i].betweenSuspicious = true;  // Add new property to indicate links between suspicious
            }
            else{
                linkelated.push(links[i]);
                links[i].betweenSuspicious = false; // Add new property to indicate links between suspicious
            }

        }
        // Order nodes and links
        nodes.sort(function (a, b) { return (a.degree > b.degree) ? -1 : 1;});
        links.sort(function (a, b) { return (a.betweenSuspicious > b.betweenSuspicious) ? -1 : 1;});



        updateLinkDistant();




        xScale.domain([0, maxT]); // Set time domain


        force.nodes(nodes)
            .links(links)
            .start(100, 150, 200);



        // Add links **************************************************
        svg.selectAll(".linkArc").remove();
        linkArcs = svg.selectAll(".linkArc");
        addLinks(links);

        // Add nodes **************************************************
        svg.selectAll(".node").remove();
        node = svg.selectAll(".node");
        addNodes(nodes)


        force.on("tick", function () {
            tick();
        });


        // Other functions *********************************************
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

function updateLinkDistant() {
    force.linkDistance(function (l,i) {
        if (l.betweenSuspicious==true) {
            return 200;
        }
        else{
            return 50;
        }
    });
}


function addLinks(links1) {
    //Create all the line svgs but without locations yet
    linkArcs = linkArcs.data(links1, function(d) { return d.id; });
    linkArcs.exit().remove();
    linkArcs
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke", function (d) {return colores_google(d.category);})
        .style("stroke-opacity", 0.3)
        .style("stroke-width", function (d) { return 2;});
    linkArcs = svg.selectAll(".linkArc");
}

function addNodes(nodes1) {
    node = node.data(nodes1, function(d) { return d.id;});
    node.exit().remove();
    node.enter().append("circle")
        .attr("class", "node")
        .attr('r', function (d) {
            var size =  Math.pow(d.degree,0.4);
            return 2+size;
            //return suspicious[d.id] ? 6+size : 3+size;
        })
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr("fill", function (d) { return suspicious[d.id] ? colorSuspicious : "#444"})
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .call(force.drag);
    node = svg.selectAll(".node");;
}

function computeLinks() {
    /*
    //Create all the line svgs but without locations yet
    svg.selectAll(".linkArc").remove();
    linkArcs = svg.append("g").selectAll("path")
        .data(links, function(d) { return d.id;})
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



    svg.selectAll(".node").remove();
    node = svg.selectAll(".node")
        .data(nodes, function(d) { return d.id;}).enter().append("circle")
        .attr("class", "node")
        .attr('r', function (d) { return suspicious[d.id] ? 6 : 3;})
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr("fill", function (d) { return suspicious[d.id] ? colorSuspicious : "#444"})
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .call(force.drag);


    node.append("text")
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
    /*if (force.alpha()<0.01) {
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;
        console.log(q);
        while (++i < n) q.visit(collide(nodes[i]));
    }

    nodes.forEach(function(d) {
     //   d.x += (width/2-d.x)*0.1;
    });*/

//    console.log(force.alpha());
    nodes[0].x = width/2;
    nodes[0].y = height/2;

    node.attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

    yScale = d3.scale.linear()
        .range([0, 2])
        .domain([0, 10]);

    linkArcs.attr("d", linkArc);
}

// Adapted from http://bl.ocks.org/3116713
/*function collide(alpha, nodes, scale) {
    quadtree = d3.geom.quadtree(nodes);
    return function(d) {
        r = d.r + scale.domain()[1] + padding
        nx1 = d.x - r;
        nx2 = d.x + r;
        ny1 = d.y - r;
        ny2 = d.y + r;
        return quadtree.visit(function(quad, x1, y1, x2, y2) {
            var l, x, y;
            if (quad.point && quad.point !== d) {
                x = d.x - quad.point.x;
                y = d.y - quad.point.y;
                l = Math.sqrt(x * x + y * y);
                r = d.r + quad.point.r + padding;
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
};*/

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy)*2;
   // if (d.source.y<d.target.y )
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
   // else
   //     return "M" + +d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
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


