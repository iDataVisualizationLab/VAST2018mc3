/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var transactions = ["Call", "Email", "Purchase", "Meeting"];
var transCounts = [0, 0, 0, 0];

var clickCount1 =0;

var clickRelatedCount1 =0;
var clickCategoryCounts =[0,0,0,0];

var colorSuspicious = "#a00";
var durationTime =2000;

function colores_google(n) {
    var colores_g = ["#3060aa", "#660099", "#996600", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}

function drawLegends(){
    var svgLegend = d3.select("#controlPanel")
        .append("svg")
        .attr("width", 200)
        .attr("height",800);

    var legendTop1 = 70;
    svgLegend.append("text")
        .attr("class","textTitle1")
        .attr("x", 8 )
        .attr("y", legendTop1)
        .attr("fill", "#000" )
        .text("Nodes (or people)");

    svgLegend.append("text")
        .attr("class","textLegend1")
        .attr("x", 30 )
        .attr("y", legendTop1+20)
        .attr("fill", colorSuspicious )
        .text("Suspicious");
    svgLegend.append("circle")
        .attr("class","circleLegend1")
        .attr("r", 6 )
        .attr("cx", 16 )
        .attr("cy", legendTop1+15)
        .attr("fill", colorSuspicious )
        .attr("stroke", "#fff" )
        .attr("stroke-width", 1);
    svgLegend.append("text")
        .attr("class","textLegend1")
        .attr("x", 30 )
        .attr("y", legendTop1+40)
        .attr("fill", "#444" )
        .text("Related")
        .on("click", removeRelated);
    svgLegend.append("circle")
        .attr("class","circleLegend1")
        .attr("r", 4 )
        .attr("cx", 16 )
        .attr("cy", legendTop1+35)
        .attr("fill", "#333" )
        .attr("stroke", "#fff" )
        .attr("stroke-width", 1)
        .on("click", removeRelated);

    function removeRelated(){
        if (clickRelatedCount1%2==0){
            nodeCurrent = nodeSuspicious;
            linkCurrent = linkSuspicious;
            restart(nodeSuspicious,linkSuspicious);
        }
        else {
            nodeCurrent = nodes;
            linkCurrent = links;
            restart(nodes, links);
        }
        clickRelatedCount1++;
    }

    var legendTop2 = 150;
    var scale = d3.scale.linear().domain([-1, 10]).range([legendTop2, legendTop2+180]);
    svgLegend.append("text")
        .attr("class","textTitle2")
        .attr("x", 8 )
        .attr("y", legendTop2)
        .attr("fill", "#000" )
        .text("Links (or activities)");

    svgLegend.selectAll(".lineLegend2")
        .data( d3.range(4) )
        .enter().append("line")
        .attr("class","lineLegend2")
        .attr("x1", 8 )
        .attr("y1", scale )
        .attr("x2", 30 )
        .attr("y2", scale )
        .attr("stroke", function(d,i) { return colores_google(i); } )
        .attr("stroke-width",2);

    // Count the number of transactions in each category
    for (var j=0; j<links.length;j++){
        if (links[j].category =="0"){
            transCounts[0]++;
        }
        else if (links[j].category =="1"){
            transCounts[1]++;
        }
        else if (links[j].category =="2"){  // Meetings
            transCounts[2]++;
        }
        else if (links[j].category =="3"){  // Purchases
            transCounts[3]++;
        }
        else{
            console.error("Weird category!!!!");
        }
    }

    svgLegend.selectAll(".textLegend2")
        .data(d3.range(4) )
        .enter()
        .append("text")
        .attr("class","textLegend2")
        .attr("x", 33 )
        .attr("y", scale )
        .attr("dy", 5 )
        .attr("fill", function(d,i) { return colores_google(i); } )
        .on("click", function(d,i) { removeCategory(i) ;})
        .text(function(d,i) {
          return transactions[i] +" ("+transCounts[i]+")";});


    function removeCategory(cat){
        clickCategoryCounts[cat]++;

        // Compute Suspicious nodes
        linkCurrent = [];

        for (var i=0; i< links.length;i++) {
            var linkCategory  = +links[i].category;
            if (clickCategoryCounts[linkCategory] % 2 == 0) {
                linkCurrent.push(links[i]);
            }
        }
        nodeCurrent = nodes;
        restart(nodeCurrent, linkCurrent);


    }
}

function restart(nodes2,links2) {
    // Apply the general update pattern to the links.
    addLinks(links2);
    // Apply the general update pattern to the nodes.
    addNodes(nodes2)

    // Update and restart the simulation.
    force.nodes(nodes2);
    force.links(links2);
    force.resume();
}

function buttonClick1(){
    if (clickCount1%2==0){  // Show timeline *********
        //detactTimeSeries();
        orderNodesTimeline();
    }
    else{
        force.resume();
    }
    clickCount1++;
}



function orderNodesTimeline(){
    // Stop force layout first
    force.stop();

    nodes.forEach(function(d) {
        d.x=xScale(d.listTimes[0]);
        d.y =0;
    });

    nodeSuspicious.sort(function (a, b) { return (a.degree > b.degree) ? -1 : 1;});


    var yStart = height/5;
    var curY =yStart;
    nodeSuspicious.forEach(function(d,i) {
        if(i==0){
            d.y = yStart;
            var previousNodeSize = 23;
            d.followers.sort(function (a, b) { return (a.listTimes[0] > b.listTimes[0]) ? 1 : -1;});
            d.followers.forEach(function(d) {
                if (d.neighbors.length<2)
                    d.y=yStart -20- xScale(d.listTimes[0])/10;
                else {
                    curY = curY + previousNodeSize + getNodeSize(d);
                    previousNodeSize = getNodeSize(d);
                    d.y=curY;
                }

            });
        }
        else{
            if (d.neighbors.length==1)  // Suspious with single neighbor
                d.y=d.neighbors[0].y+15;

            else
                d.y=curY+10;
            curY = d.y+1;
            if (d.followers){
                d.followers.sort(function (a, b) { return (a.listTimes[0] > b.listTimes[0]) ? 1 : -1;});
                var previousNode = d;
                d.followers.forEach(function(d2,j) {
                    if (d2.y <=0){// Make sure that we don't not reset y of follower of multiple suspicious nodes
                        if (d2.neighbors.length<2){
                            if (previousNode.neighbors.length<2)
                                curY+=0.2;
                            else
                                curY+=getNodeSize(previousNode)+getNodeSize(d2);
                            previousNode =d2;
                            d2.y=curY;
                        }
                        else{
                            curY = curY + getNodeSize(previousNode) + getNodeSize(d2);
                            previousNode = d2;
                            d2.y=curY;
                        }



                    }

                  //  if(i>0)
                  //      curY = d2.y;
                });
            }
        }
    });



     /*
    nodes[1].followers.forEach(function(d,i) {
        d.y=yStart +240+xScale(d.listTimes[0])/16;
    });
    */

    node.transition().duration(durationTime)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    linkArcs.transition().duration(durationTime).attr("d", linkArc2);

    svg.selectAll(".lineNodes").transition().duration(durationTime)
        .attr("x1", function(d) {return d.x;})
        .attr("y1", function(d) {return d.y;})
        .attr("x2", function(d) {return xScale(d.listTimes[d.listTimes.length-1]);;})
        .attr("y2", function(d) {return d.y;})

    svg.selectAll(".nodeText").remove();
    svg.selectAll(".nodeText")
        .data(nodeHighNeighbor).enter().append("text")
        .attr("class", "nodeText")
        .text(function(d) {
            if (suspicious[d.id]!=undefined)
                return suspicious[d.id].first +" "+suspicious[d.id].last;
            else
                return ""+d.id ;
        })
        .attr("dy", "4px")
        .style("fill", function(d){
            if (suspicious[d.id])
                return colorSuspicious;
            else
                return "#333";
        })
        .style("text-anchor","end")
        .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
        //.style("font-weight", function(d) { return d.isSearchTerm ? "bold" : ""; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px");
    svg.selectAll(".nodeText").transition().duration(durationTime)
        .attr("x", function(d) {return d.x-getNodeSize(d)-2;})
        .attr("y", function(d) {return d.y;})

}



/*
function orderNodesTimeline(){
    // Stop force layout first
    force.stop();

    var step = height/nodes.length;
    for (var i=0; i< nodes.length; i++) {
        nodes[i].y = i*step;
    }

    nodes.forEach(function(d) {
        d.x=xScale(d.listTimes[0]);
    });

    node.transition().duration(durationTime)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    linkArcs.transition().duration(durationTime).attr("d", linkArc2);
}*/






function detactTimeSeries(){
    // Stop force layout first
    force.stop();

    var array = [];
    for (var i=0; i< nodes.length; i++) {
        var e =  {};
        e.y = nodes[i].y;
        e.nodeId = i;
        array.push(e);
    }
    array.sort(function (a, b) {
        if (a.y > b.y) {
            return 1;
        }
        if (a.y < b.y) {
            return -1;
        }
        return 0;
    });

    var step = height/array.length;
    for (var i=0; i< array.length; i++) {
        nodes[array[i].nodeId].y = i*step;
    }
    force.stop();

    updateTransition(2000, height-4);
}

function updateTransition(durationTime, timeY){  // timeY is the position of time legend
    nodes.forEach(function(d) {
        d.x=xScale(d.listTimes[0]);
    });

    node.transition().duration(durationTime)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
  /*

   svg.selectAll(".linePNodes").transition().duration(durationTime)
   .attr("x1", function(d) {return xStep+xScale(d.minY);})
   .attr("y1", function(d) {return d.y;})
   .attr("x2", function(d) {return xStep+xScale(d.maxY);})
   .attr("y2", function(d) {return d.y;});



   svg.selectAll(".nodeText").transition().duration(durationTime)
   .text(function(d) { return d.name; })
   .attr("dy", "3px");

   svg.selectAll(".nodeLine").transition().duration(durationTime)
   .attr("x1", function(d) {return xStep+d.x;})
   .attr("y1", function(d) {return d.y;})
   .attr("x2", function(d) {return xStep+d.x+xScale(70);})
   .attr("y2", function(d) {return d.y;});

   */
  /*
   svg.selectAll(".layer").transition().duration(durationTime)
   .attr("d", function(d) {
   for (var m=numYear-1; m>=0; m--){
   d.yearly[m].yNode = d.y;     // Copy node y coordinate
   // if (d.yearly[m].value==0)
   //     d.yearly.splice(m,1);
   }
   return area(d.yearly); }) ;
   */

    linkArcs.transition().duration(durationTime).attr("d", linkArc2);
}

