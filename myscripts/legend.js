/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var transactions = ["Call", "Email", "Purchase", "Meeting"];
var transCounts = [0, 0, 0, 0];
var linkArrays = [[], [], [], []];

var clickCount1 =0;

var showAssociated2 = true;
var showAssociated1 = true;
var clickCategoryCounts =[0,0,0,0];

var colorSuspicious = "#900";
var color1 = "#777";
var color2 = "#000";

var durationTime =2000;
var yStart = 30;

var arcOpacity = 0.24;

function colores_google(n) {
    var colores_g = ["#3060aa", "#f80", "#f00", "#10aa18", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}

function drawLegends(){
    var svgLegend = d3.select("#controlPanel")
        .append("svg")
        .attr("width", 220)
        .attr("height",400);

    var legendTop1 = 70;
    svgLegend.append("text")
        .attr("class","textTitle1")
        .attr("x", 8 )
        .attr("y", legendTop1)
        .attr("fill", "#000" )
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .style("font-weight", "bold")
        .text("Nodes (or people)");

    svgLegend.append("text")
        .attr("class","textLegend0")
        .attr("x", 25 )
        .attr("y", legendTop1+19)
        .attr("fill", colorSuspicious )
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend0")
                .attr("stroke", "#000" );
            mouseoverNodes(nodeSuspicious);
        })
        .on("mouseout", function(){
            svgLegend.selectAll(".circleLegend0")
                .attr("stroke", "#fff" );
            mouseoutNode();
        })
        .text("Suspicious"+" ("+nodeSuspicious.length+")");
    svgLegend.append("circle")
        .attr("class","circleLegend0")
        .attr("r", 6 )
        .attr("cx", 15 )
        .attr("cy", legendTop1+14)
        .attr("fill", colorSuspicious )
        .attr("stroke", "#fff" )
        .attr("stroke-width", 1)
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend0")
                .attr("stroke", "#000" );
            mouseoverNodes(nodeSuspicious);
        })
        .on("mouseout", function(){
            svgLegend.selectAll(".circleLegend0")
                .attr("stroke", "#fff" );
            mouseoutNode();
        });
    

    svgLegend.append("text")
        .attr("class","textLegend2")
        .attr("x", 25 )
        .attr("y", legendTop1+36)
        .attr("fill", color2 )
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .text("Associated to many suspicious"+" ("+nodeAssociated2.length+")")
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend2")
                .attr("stroke", "#777" );
            //mouseoverNodes(nodeAssociated2);
        })
        .on("mouseout", function(){
            svgLegend.selectAll(".circleLegend2")
                .attr("stroke", "#fff" );
            mouseoutNode();
        })
        .on("click", toggleAssociated2);
    svgLegend.append("circle")
        .attr("class","circleLegend2")
        .attr("r", 4 )
        .attr("cx", 15 )
        .attr("cy", legendTop1+31)
        .attr("fill", color2 )
        .attr("stroke", "#fff" )
        .attr("stroke-width", 1)
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend2")
                .attr("stroke", "#777" );
           // mouseoverNodes(nodeAssociated2);
        })
        .on("mouseout", function(){
            svgLegend.selectAll(".circleLegend2")
                .attr("stroke", "#fff" );
            mouseoutNode();
        })
        .on("click", toggleAssociated2);

    svgLegend.append("text")
        .attr("class","textLegend1")
        .attr("x", 25 )
        .attr("y", legendTop1+52)
        .attr("fill", color1 )
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .text("Associated to 1 suspicious"+" ("+nodeAssociated1.length+")")
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend1")
                .attr("stroke", "#777" );
            //mouseoverNodes(nodeAssociated1);
        })
        .on("mouseout", function (){
            svgLegend.selectAll(".circleLegend1")
                .attr("stroke", "#fff" );
            mouseoutNode();
        })
        .on("click", toggleAssociated);
    svgLegend.append("circle")
        .attr("class","circleLegend1")
        .attr("r", 4 )
        .attr("cx", 15 )
        .attr("cy", legendTop1+48)
        .attr("fill", color1 )
        .attr("stroke", "#fff" )
        .attr("stroke-width", 1)
        .on("mouseover", function(d){
            svgLegend.selectAll(".circleLegend1")
                .attr("stroke", "#000" );
            //mouseoverNodes(nodeAssociated1);
        })
        .on("mouseout", function (){
            svgLegend.selectAll(".circleLegend1")
                .attr("stroke", "#fff" );
            mouseoutNode();
        })
        .on("click", toggleAssociated);    

        

    function toggleAssociated(){
        if (showAssociated1){
            nodeCurrent = nodes;
            linkCurrent = links;
        }
        else {
            nodeCurrent = [];
            for (var i=0;i<nodeSuspicious.length;i++){
                nodeCurrent.push(nodeSuspicious[i]);
            }
            for (var i=0;i<nodeAssociated2.length;i++){
                nodeCurrent.push(nodeAssociated2[i]);
            }
            linkCurrent = [];
            var str = " ";
            for (var i=0; i<nodeCurrent.length;i++) {
                str += nodeCurrent[i].id+" ";
            }
            for (var i=0; i<links.length;i++) {
                if (str.indexOf(" "+links[i].source.id+" ")>=0 && str.indexOf(" "+links[i].target.id+" ")>=0)
                    linkCurrent.push(links[i]);
            }
        //    colaNetwork(nodeCurrent, linkCurrent)
        }
        showAssociated1 = !showAssociated1;
        orderNodesTimeline();
        mouseoutNode();
    }


    function toggleAssociated2(){
        if (showAssociated2){
            nodeCurrent = nodeSuspicious;
            linkCurrent = linkSuspicious;
            colaNetwork(nodeCurrent, linkCurrent);
        }
        else {
            nodeCurrent = [];
            for (var i=0;i<nodeSuspicious.length;i++){
                nodeCurrent.push(nodeSuspicious[i]);
            }
            for (var i=0;i<nodeAssociated2.length;i++){
                nodeCurrent.push(nodeAssociated2[i]);
            }
            linkCurrent = [];
            var str = " ";
            for (var i=0; i<nodeCurrent.length;i++) {
                str += nodeCurrent[i].id+" ";
            }
            for (var i=0; i<links.length;i++) {
                if (str.indexOf(" "+links[i].source.id+" ")>=0 && str.indexOf(" "+links[i].target.id+" ")>=0)
                    linkCurrent.push(links[i]);
            }
            colaNetwork(nodeCurrent, linkCurrent);
        }
        showAssociated2 = !showAssociated2;
        orderNodesTimeline();
        mouseoutNode();
    }


    var legendTop2 = 154;
    var scale = d3.scale.linear().domain([-1, 10]).range([legendTop2, legendTop2+180]);
    svgLegend.append("text")
        .attr("class","textTitle2")
        .attr("x", 8 )
        .attr("y", legendTop2+2)
        .attr("fill", "#000" )
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .style("font-weight", "bold")
       .text("Links (or activities)");

    svgLegend.selectAll(".lineLegend2")
        .data( d3.range(4) )
        .enter().append("line")
        .attr("class","lineLegend2")
        .attr("x1", 7 )
        .attr("y1", scale )
        .attr("x2", 24 )
        .attr("y2", scale )
        .attr("stroke", function(d,i) { return colores_google(i); } )
        .attr("stroke-width",1.5);

    // Count the number of transactions in each category
    for (var j=0; j<links.length;j++){
        if (links[j].category =="0"){
            transCounts[0]++;
            linkArrays[0].push(links[j]);
        }
        else if (links[j].category =="1"){
            transCounts[1]++;
            linkArrays[1].push(links[j]);
        }
        else if (links[j].category =="2"){  // Meetings
            transCounts[2]++;
            linkArrays[2].push(links[j]);
        }
        else if (links[j].category =="3"){  // Purchases
            transCounts[3]++;
            linkArrays[3].push(links[j]);
        }
        else{
            console.error("Weird category!!!!");
        }
    }

    svgLegend.selectAll(".textLegend22")
        .data(d3.range(4) )
        .enter()
        .append("text")
        .attr("class","textLegend22")
        .attr("x", 28 )
        .attr("y", function (d) {
            return scale (d);
        } )
        .attr("dy", 5 )
        .attr("fill", function(d,i) { return colores_google(i); } )
        .on("click", function(d,i) { removeCategory(i) ;})
        .attr("font-family", "sans-serif")
        .attr("font-size",12)
        .text(function(d,i) {
          return transactions[i] +" ("+transCounts[i]+")";})
        .on("mouseover", function(d,i){
            var str = " ";
            for (var j=0; j<linkArrays[i].length;j++){
                //console.log(i);
                var id1 = linkArrays[i][j].source.id;
                if (str.indexOf(id1)<0)
                    str += id1 +" ";
                var id2 = linkArrays[i][j].target.id;
                if (str.indexOf(id2)<0)
                    str += id2 +" ";
            }
            mouseoverIDs(str);

           /* var str2 = " ";
            for (var j=0; j<linkArrays[i].length;j++){
                //console.log(i);
                var id1 = linkArrays[i][j].source.id;
                var id2 = linkArrays[i][j].target.id;
                if (str2.indexOf(id1+"_"+id2)<0)
                    str2 += id1+"_"+id2 +" ";
            }*/
            // Highlight links of this category
            svg.selectAll(".linkArc").attr("stroke-opacity", function(l){
                 if (l.category==i){
                    return 0.7;
                }
                else
                    return 0.02;
            });
            checkVisibility();

            // Cola network

            var nodes2 = [];
            for (var i2=0;i2<nodeSuspicious.length;i2++){
                nodes2.push(nodeSuspicious[i2]);
            }
            for (var i2=0;i2<nodeAssociated2.length;i2++){
                nodes2.push(nodeAssociated2[i2]);
            }
            var links2= [];
            var str = " ";
            for (var i2=0; i2<nodes2.length;i2++) {
                str += nodes2[i2].id+" ";
            }
            for (var i2=2; i2<links.length;i2++) {
                if (str.indexOf(" "+links[i2].source.id+" ")>=0 && str.indexOf(" "+links[i2].target.id+" ")>=0)
                    links2.push(links[i2]);
            }

            var str2 = " ";
            var links4 =[];
            for (var j=0; j<links2.length;j++) {
                var node1 = links2[j].source;
                var node2 = links2[j].target;
                if (links2[j].category==i) {
                    if (str2.indexOf(node1.id+" ") < 0)
                        str2 += node1.id + " ";
                    if (str2.indexOf(node2.id+" ") < 0)
                        str2 += node2.id + " ";
                    links4.push(links2[j])
                }
            }
            var nodes4 =[];
            for (var i=0;i<nodes.length;i++){
                if (str2.indexOf(nodes[i].id)>=0)
                    nodes4.push(nodes[i]);
            }

            colaNetwork(nodes4, links4);


        })
        .on("mouseout", mouseoutNode);


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
        //restart(nodeCurrent, linkCurrent);
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
    nodes2 = [];
    nodes.forEach(function(d) {
        nodes2.push(d);
    });

    nodes2.forEach(function(d) {
        d.xx=xScale(d.listTimes[0]);
        d.yy =0;
    });
   //nodes2.sort(function (a, b) { return (a.y > b.y) ? 1 : -1;});
    nodes2.sort(function (a, b) { return (a.listTimes[0] > b.listTimes[0]) ? 1 : -1;});
          
   var stepY =1;
   if (nodes.length>0)        
        stepY = (height-150)/nodes.length  
    if (stepY>10)
        stepY =10;            
    nodes2.forEach(function(d,i) {
        d.yy = yStart+i*stepY;
    });
       

   linkArcs.transition().duration(durationTime).attr("d", linkArc2);

    svg.selectAll(".lineNodes").transition().duration(durationTime)
        .attr("x1", function(d) {return d.xx;})
        .attr("y1", function(d) {return d.yy;})
        .attr("x2", function(d) {return xScale(d.listTimes[d.listTimes.length-1]);})
        .attr("y2", function(d) {return d.yy;})

    svg.selectAll(".nodeText").transition().duration(durationTime)
        .attr("x", function(d) {return d.xx-getNodeSize(d)-2;})
        .attr("y", function(d) {return d.yy;})

    svg.selectAll(".node").transition().duration(durationTime)
        .attr("cx", function(d) {return d.xx;})
        .attr("cy", function(d) {return d.yy;})

    showAssociated1 = true;    
    checkVisibility();
}



function orderNodesTimeline(){
    nodes.forEach(function(d) {
        d.xx=xScale(d.listTimes[0]);
        d.yy =0;
    });
    nodeSuspicious.sort(function (a, b) { return (a.degree > b.degree) ? -1 : 1;});

    var curY =yStart;
    nodeSuspicious.forEach(function(d,i) {
        if(i==0){
            d.yy = yStart;
            var previousNodeSize =15;
            if (d.followers){
                d.followers.sort(function (a, b) { return (a.listTimes[0] > b.listTimes[0]) ? 1 : -1;});
                d.followers.forEach(function(d) {
                    if (d.neighbors.length<2) {
                        d.yy=yStart - xScaleGlobal(d.listTimes[0])/10;
                    }
                    else {
                        if (showAssociated2) {
                            curY = curY + previousNodeSize + getNodeSize(d);
                            previousNodeSize = getNodeSize(d);
                            d.yy = curY;
                        }
                    }
                });
            }
        }
        else{
            if (d.neighbors.length==1)  // Suspious with single neighbor
                d.yy=d.neighbors[0].yy+18;
            else
                d.yy=curY+13;
            curY = d.yy;
            if (d.followers){
                d.followers.sort(function (a, b) { return (a.listTimes[0] > b.listTimes[0]) ? 1 : -1;});
                var previousNode = d;
                d.followers.forEach(function(d2,j) {
                    if (d2.yy <=0){// Make sure that we don't not reset y of follower of multiple suspicious nodes
                        if (d2.neighbors.length<2) {
                            if (showAssociated1 || suspicious[d.id] ) {
                                if (previousNode.neighbors.length < 2)
                                    curY += 0.2;
                                else
                                    curY += getNodeSize(previousNode) + getNodeSize(d2);
                                previousNode = d2;
                                d2.yy = curY;
                            }
                        }
                        else{
                            if (showAssociated2 || suspicious[d.id] ) {
                                curY = curY + getNodeSize(previousNode) + getNodeSize(d2);
                                previousNode = d2;
                                d2.yy = curY;
                            }
                        }
                    }
                });
            }
        }
    });

    linkArcs.transition().duration(durationTime).attr("d", linkArc2);

    svg.selectAll(".lineNodes").transition().duration(durationTime)
        .attr("x1", function(d) {return d.xx;})
        .attr("y1", function(d) {return d.yy;})
        .attr("x2", function(d) {return xScale(d.listTimes[d.listTimes.length-1]);;})
        .attr("y2", function(d) {return d.yy;})

    svg.selectAll(".nodeText").transition().duration(durationTime)
        .attr("x", function(d) {return d.xx-getNodeSize(d)-2;})
        .attr("y", function(d) {return d.yy;})

    svg.selectAll(".node").transition().duration(durationTime)
        .attr("cx", function(d) {return d.xx;})
        .attr("cy", function(d) {return d.yy;})

    checkVisibility();
}

function checkVisibility(){
    // Check if we should remove the showAssociated1
    if (!showAssociated1){
        var str = " ";
        for (var j=0; j<nodes.length;j++){
            if (nodes[j].neighbors.length>1)
                str += nodes[j].id +" ";
        }
        svg.selectAll(".node")
            .attr("fill-opacity", function(d2){ return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("fill-opacity") : 0; })
            .attr("stroke-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("stroke-opacity") : 0; });
        svg.selectAll(".nodeText")
            .attr("fill-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("fill-opacity") : 0; });
        svg.selectAll(".lineNodes")
            .attr("stroke-opacity", function(d2){ return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("stroke-opacity") : 0; });

        svg.selectAll(".linkArc").attr("stroke-opacity", function(l){
            if (str.indexOf(" "+l.source.id+" ")>=0 && str.indexOf(" "+l.target.id+" ")>=0){
                return d3.select(this).attr("stroke-opacity");
            }
            else
                return 0;
        });
    }
    if (!showAssociated2){
        var str = " ";
        for (var j=0; j<nodeSuspicious.length;j++){
                str += nodeSuspicious[j].id +" ";
        }
        svg.selectAll(".node")
            .attr("fill-opacity", function(d2){ return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("fill-opacity") : 0; })
            .attr("stroke-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("stroke-opacity") : 0; });
        svg.selectAll(".nodeText")
            .attr("fill-opacity", function(d2){  return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("fill-opacity") : 0; });
        svg.selectAll(".lineNodes")
            .attr("stroke-opacity", function(d2){ return (str.indexOf(d2.id) >=0) ? d3.select(this).attr("stroke-opacity") : 0; });

        svg.selectAll(".linkArc").attr("stroke-opacity", function(l){
            if (str.indexOf(" "+l.source.id+" ")>=0 && str.indexOf(" "+l.target.id+" ")>=0){
                return d3.select(this).attr("stroke-opacity");
            }
            else
                return 0;
        });
    }
}


/*
function sortDownstream(nodes_,links_,typeWeights){
    nodes_.forEach(function(d,i) {
        d.score = 0;
    })

    links_.forEach(function(l,i) {
        var type = +l.category;
        var node1 = l.source;
        node1.score += typeWeights[type];
        var node2 = l.target;
        node2.score -= typeWeights[type];
    })    
    nodes_ = nodes_.sort(function (a, b) { return (a.score > b.score) ? -1 : 1;});
    nodes_.forEach(function(d,i) {
        d.y = yStart+20*i;
    })   
   
    node.transition().duration(durationTime)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    linkArcs.transition().duration(durationTime).attr("d", linkArc2);

    svg.selectAll(".lineNodes").transition().duration(durationTime)
        .attr("x1", function(d) {return d.x;})
        .attr("y1", function(d) {return d.y;})
        .attr("x2", function(d) {return xScale(d.listTimes[d.listTimes.length-1]);;})
        .attr("y2", function(d) {return d.y;})

    svg.selectAll(".nodeText").transition().duration(durationTime)
        .attr("x", function(d) {return d.x-getNodeSize(d)-2;})
        .attr("y", function(d) {return d.y;})
        .text(function(d) { 
               return people[d.id].first +" "+people[d.id].last +" ("+d.score+")";
        })
}*/


