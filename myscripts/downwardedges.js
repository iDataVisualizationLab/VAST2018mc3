/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var widthN = 300,
    heightN = 300;

var  svgNetwork = d3.select("#networkPanel")
    .append("svg")
    .attr("width", widthN)
    .attr("height",heightN);

var nodesN, linksN; 

 

function colaNetwork(nodes, links){
    nodesN = nodes;
    linksN = links;
    svgNetwork.selectAll("*").remove();

    var dis = widthN/Math.sqrt(nodes.length);
    console.log("dis "+dis +" "+links.length+" "+nodes.length);
    var d3cola = cola.d3adaptor(d3)
        .avoidOverlaps(true)
        .size([widthN, heightN]);

    d3cola
        .nodes(nodes)
        .links(links)
       // .jaccardLinkLengths(140,0.7)
        .flowLayout("y", dis/2)
        .symmetricDiffLinkLengths(dis/5)
        .linkDistance(70)
        .start(10,20,20);

    // define arrow markers for graph links
    svgNetwork.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    var path2 = svgNetwork.selectAll(".link")
        .data(links)
      .enter().append('svg:path')
        .attr('class', 'link')
        .attr("stroke", function (d) {return colores_google(d.category);})
        .attr("stroke-opacity", function (d){
            if (considerTime==d.time && d.category=="2"){
                return 1;
            }
            else
                return arcOpacity;
        })
        .attr("stroke-width", function (d){
            if (considerTime==d.time && d.category=="2"){
                return 3;
            }
            else
                return 2.5;
        });


        svgNetwork.selectAll(".nodeText").remove();
        svgNetwork.selectAll(".nodeText")
            .data(nodes).enter().append("text")
            .attr("class", "nodeText")
            .text(function(d) {
                if (suspicious[d.id]!=undefined)
                    return suspicious[d.id].first +" "+suspicious[d.id].last;
                else
                    return people[d.id].first +" "+people[d.id].last;
            })
            .style("fill", function(d){
               if (suspicious[d.id])
                    return colorSuspicious;
                else
                    return "#333";
            })
            .style("text-anchor","middle")
            .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
             .attr("font-family", "sans-serif")
            .attr("font-size", function(d) {
                if (suspicious[d.id]!=undefined)
                    return 13;
                else
                    return 5+getNodeSize(d);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode);


    var node2 = svgNetwork.selectAll(".node2")
        .data(nodes)
      .enter().append("circle")
        .attr("class", "node2")
        .attr('r', getNodeSize)
        .attr("fill", function (d) { return suspicious[d.id] ? colorSuspicious : 
            //Gail,Feindt,2040565
            d.id=="2040565" ? "#f00" :
           ((d.neighbors.length<2) ? color1 : color2); })
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode)
        .call(d3cola.drag);

    node2.append("title")
        .text(function (d) { return people[d.id].first +" "+people[d.id].last;; });



    checkVisibility();
    d3cola.on("tick", function () {
      //  path.each(function (d) {
      //      if (isIE()) this.parentNode.insertBefore(this, this);
      //  });
        // draw directed edges with proper padding from node centers

        path2.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = getNodeSize(d.source),
                targetPadding = getNodeSize(d.target) + 2,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);

            var rScale = d3.scale.linear().range([dist/2, dist*3]);
            rScale.domain([0, maxT]); // Set time domain
            var r = rScale(d.time);
            return "M" + sourceX + "," + sourceY+ "A" + r + "," + r + " 0 0,1 " + targetX + "," + targetY;
         //   return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        node2.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });

        svgNetwork.selectAll(".nodeText")
        .attr("x", function(d) {return d.x-getNodeSize(d)-2;})
        .attr("y", function(d) {return d.y-getNodeSize(d)-2;})    

    });

}