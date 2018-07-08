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
    .charge(-50)
    //.linkDistance(100)
    .gravity(0.03)
    //.friction(0.5)
   // .linkStrength(0.3)
    .alpha(0.1)
    .size([width, height]);

var data;
var node,linkArcs;
var nodes =[], links =[];
var nodeSuspicious =[], linkSuspicious =[];
var nodeCurrent =[], linkCurrent =[];
var nodeAssociated1 =[], nodeAssociated2 =[], linkeAssociated =[];

var nodeHighDegree =[]; // Nodes with degree >=2 to draw timeline
var nodeHighNeighbor =[]; // Nodes with neighbors >=2

var terms = new Object();

var xStep = 290;
var xScale = d3.scale.linear().range([xStep+20, (width-100)]);
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
var people = {};


d3.csv("data/CompanyIndex.csv", function(error, data_) {
    data_.forEach(function (d) {
        people[d.ID] = d;
    });
    d3.csv("data/involvedCompanyIndex.csv", function(error, data1) {
        data1.forEach(function (d) {
            suspicious[d.ID] = d;
        });
        //d3.csv("data/Suspicious.csv", function (error, data2) {
        
        //d3.csv("data/involved.csv", function (error, data2) {
        d3.csv("data/purchases.csv", function (error, data2) {      
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
            console.log("Done reading data");

            for (var i=0; i< links.length;i++){
                if (suspicious[links[i].source.id] && suspicious[links[i].target.id]){
                    linkSuspicious.push(links[i]);
                    links[i].betweenSuspicious = true;  // Add new property to indicate links between suspicious
                }
                else{
                    linkeAssociated.push(links[i]);
                    links[i].betweenSuspicious = false; // Add new property to indicate links between suspicious

                    if (suspicious[links[i].source.id]){
                       if (links[i].source.followers==undefined){
                           links[i].source.followers = [];
                       }
                       if(isContainedChild(links[i].source.followers, links[i].target)<0)  // No duplicate elements
                            links[i].source.followers.push(links[i].target);
                    }
                    else if (suspicious[links[i].target.id]){
                        if (links[i].target.followers==undefined){
                            links[i].target.followers = [];
                        }
                        if(isContainedChild(links[i].target.followers, links[i].source)<0) // No duplicate elements
                            links[i].target.followers.push(links[i].source);
                    }
                }
                // Compute neighbors
                if (links[i].source.neighbors==undefined){
                    links[i].source.neighbors = [];
                }
                if (links[i].target.neighbors==undefined){
                    links[i].target.neighbors = [];
                }
                
                if(isContainedChild(links[i].source.neighbors, links[i].target)<0) { // No duplicate elements{    
                    links[i].source.neighbors.push(links[i].target);
                }
                if(isContainedChild(links[i].target.neighbors, links[i].source)<0) // No duplicate elements
                    links[i].target.neighbors.push(links[i].source);

            }
             console.log("Done reading data 2");


            // Compute Suspicious nodes
            for (var i=0; i< nodes.length;i++){
                if (suspicious[nodes[i].id])
                    nodeSuspicious.push(nodes[i]);
                else if (nodes[i].neighbors.length<2)
                    nodeAssociated1.push(nodes[i]);
                else 
                    nodeAssociated2.push(nodes[i]);
            }

            // check if a node for  already exist.
            function isContainedChild(a, m) {
                if (a){
                    for (var i=0; i<a.length;i++){
                        if (a[i].id==m.id)
                            return i;
                    }
                }
                return -1;
            }
              console.log("Done reading data 3");
            /*  
            nodes =  nodes.filter(function(d){
                return d.neighbors.length>20;
            })*/

            // Order nodes and links
            nodes.sort(function (a, b) { return (a.degree > b.degree) ? -1 : 1;});
            links.sort(function (a, b) { return (a.betweenSuspicious > b.betweenSuspicious) ? -1 : 1;});


              console.log("Done reading data 4");


            updateLinkDistant();
            xScale.domain([0, maxT]); // Set time domain


            force.nodes(nodes)
                .links(links)
                .start(100, 150, 200);

            nodes.forEach(function(d) {
                d.listTimes.sort(function (a, b) { return (a > b) ? 1 : -1;});  // Sort list of time *******
                if (d.degree>=2)
                    nodeHighDegree.push(d);
            });

            nodes.forEach(function(d) {
                 if (d.neighbors.length>=2)
                    nodeHighNeighbor.push(d);
            });


            // Horizontal lines
             svg.selectAll(".lineNodes").remove();
             svg.selectAll(".lineNodes")
                 .data(nodeHighDegree).enter().append("line")
                 .attr("class", "lineNodes")
                 .attr("x1", function(d) {return 0;})
                 .attr("y1", function(d) {return 100;})
                 .attr("x2", function(d) {return 1220;})
                 .attr("y2", function(d) {return 100;})
                 .style("stroke-dasharray", ("1, 1"))
                 .style("stroke-width",0.5)
                 .style("stroke", "#000");

            
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

            orderNodesTimeline();

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

function getNodeSize(d) {
   return  2+ Math.pow((d.degree-1),0.35);
}

function addLinks(links1) {
    //Create all the line svgs but without locations yet
    linkArcs = linkArcs.data(links1, function(d) { return d.id; });
    linkArcs.exit().remove();
    linkArcs
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke", function (d) {return colores_google(d.category);})
        .style("stroke-opacity", 0.4)
        .style("stroke-width", function (d) { return 1;});
    linkArcs = svg.selectAll(".linkArc");
}


function addNodes(nodes1) {
    node = node.data(nodes1, function(d) { return d.id;});
    node.exit().remove();
    node.enter().append("circle")
        .attr("class", "node")
        .attr('r', getNodeSize)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr("fill", function (d) { return suspicious[d.id] ? colorSuspicious : ((d.neighbors.length<2) ? color1 : color2); })
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 0.5)
        .call(force.drag)
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode);
    node = svg.selectAll(".node");
}

function mouseoverNode(d){
     var list = " ";
    svg.selectAll(".linkArc").style("stroke-opacity", function(l){
        if (l.source.id==d.id || l.target.id==d.id){
            list += l.source.id+" ";
            list += l.target.id+" ";
            return 0.7;
        }
        else
            return 0.02;
    });
    mouseoverIDs(list); 
}


// Mouseover the list of nodes
function mouseoverNodes(nodes_){
    var str = " ";
    for (var i=0; i<nodes_.length;i++) {
        str += nodes_[i].id+" ";
    }
    mouseoverIDs(str);
    mouseoverLinksIDs(str);
}


// Mouseover the list of node ids in the string input str
function mouseoverIDs(str){
    svg.selectAll(".node")
        .attr("fill-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? 1 : 0.02; })
        .attr("stroke-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? 1 : 0.02; });
    svg.selectAll(".nodeText")    
        .attr("fill-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? 1 : 0.05; });
    svg.selectAll(".lineNodes")
        .attr("stroke-opacity", function(d2){ return (str.indexOf(d2.id) >=0) ? 1 : 0; });
}

// Mouseover the list of node ids in the string input str
function mouseoverLinksIDs(str){
    svg.selectAll(".linkArc").style("stroke-opacity", function(l){
         if (str.indexOf(" "+l.source.id+" ")>=0 && str.indexOf(" "+l.target.id+" ")>=0){
             return 0.7;
         }
         else
            return 0.02;
    });
}


function mouseoutNode() {
    svg.selectAll(".node")
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);
    svg.selectAll(".nodeText")
        .attr("fill-opacity", 1);
    svg.selectAll(".linkArc").style("stroke-opacity", 0.4);
    svg.selectAll(".lineNodes")
        .attr("stroke-opacity",1);
}


function tick(){
    nodes[0].x = width/2;
    nodes[0].y = height/2;
    node.attr('cx', function(d) { return d.x; })
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
   // if (d.source.y<d.target.y )
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
   // else
   //     return "M" + +d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
}

function linkArc2(d) {
    var xx = xScale(d.time),
        dy = d.target.y - d.source.y,
        dr = dy;
 //   if (d.source.y<d.target.y )
        return "M" + xx + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.target.y;
 //   else
 //       return "M" + xx + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.source.y;
}


