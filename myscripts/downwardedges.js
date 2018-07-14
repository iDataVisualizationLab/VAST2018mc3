/* June, 2018
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var widthN = 700,
    heightN = 700;

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
         .flowLayout("y", dis/2)
        .symmetricDiffLinkLengths(dis/5)
       // .linkDistance(120)
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
        .style("stroke", function (d) {return colores_google(d.category);});

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
        .text(function (d) { return d.name; });

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

            var rScale = d3.scale.linear().range([dist, dist*5]);
            rScale.domain([0, maxT]); // Set time domain
            var r = rScale(d.time);
            return "M" + sourceX + "," + sourceY+ "A" + r + "," + r + " 0 0,1 " + targetX + "," + targetY;
         //   return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        node2.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });


    });

}