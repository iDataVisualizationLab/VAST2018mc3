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
        .text("Links (or actions)");

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

   /* nodes.sort(function (a, b) {
        if (a.y > b.y) {
            return 1;
        }
        if (a.y < b.y) {
            return -1;
        }
        return 0;
    });*/

    var step = 10;//10*height/nodes.length;
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
}






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

