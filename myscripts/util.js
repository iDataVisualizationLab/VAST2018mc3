var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

var typeList = ["Field A","Field B"]  
function drawColorLegend() {
  var x1 = [xStep*0.32,xStep*0.27];
  var y1 = [35,45+xStep*0.6];

   svg.selectAll(".textLegend").data(typeList).enter()
    .append("text")
      .attr("class", "textLegend")
      .attr("x", function(l,i){
        return x1[i]+11;
      })
      .attr("y", function(l,i){
        var yyy = y1[i];
        return yyy+13;
      })
      .text(function (d) {
        return d;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .style("text-anchor", "left")
      .style("font-weight", "bold")
      .style("fill", function (d) {
        return getColor(d);
      }); 

  svg.append("line")
    .attr("class", "nodeLineLegend")  
    .attr("x1", function(d) { return xStep; })
    .attr("y1", function(d) { return 8; })
    .attr("x2", function(d) { return xStep+xScale(30); })
    .attr("y2", function(d) { return 8; })
    .style("stroke-width",5)
    .style("stroke-opacity",0.28)
    .style("stroke", "#000");   
  
  svg.append("text")
      .attr("class", "textLegend")
      .attr("x", xStep+xScale(30)+2)
      .attr("y", 13)
      .text("Playing time")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .style("text-anchor", "left")
      .style("fill", "#555");         
}


function removeColorLegend() {
 svg.selectAll(".nodeLegend").remove();
}
function drawTimeLegend() {
  for (var i=minYear; i<maxYear;i=i+60){
    var xx = xStep+xScale((i-minYear));
    svg.append("line")
      .style("stroke", "#00a")
      .style("stroke-dasharray", ("1, 2"))
      .style("stroke-opacity", 1)
      .style("stroke-width", 0.2)
      .attr("x1", function(d){ return xx; })
      .attr("x2", function(d){ return xx; })
      .attr("y1", function(d){ return 0; })
      .attr("y2", function(d){ return height/3; });
     svg.append("text")
      .attr("class", "timeLegend")
      .style("fill", "#000")   
      .style("text-anchor","start")
      .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
      .attr("x", xx)
      .attr("y", height/3-5)
      .attr("dy", ".21em")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .style("font-weight", "bold")  
      .text(function(d) { 
        var time = i/60 ;
        if (time<12)
          return time+"am";
        if (time==12)
          return time+"pm";
        else
          return (time-12)+"pm";   
      });  
  }
   svg.append("text")
      .attr("class", "text222")
      .attr("x", xStep)
      .attr("y", height/3+20)
      .text("Sunday, June 19th, 2016")
      .attr("font-family", "sans-serif")
      .attr("font-size", "13px")
      .style("text-anchor", "left")
      .style("fill", "#555")
      .style("font-weight", "bold"); 
}  

function getColor(category) {
  var sat = 200;
  if (category=="Field A")
    return "#d00"
  else if (category=="Field B")
    return "#00f"
  else{
    return "#000000";    
  }
}


var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

function dragstart(d, i) {
    force.stop() // stops the force auto positioning before you start dragging
}

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
}

function dragend(d, i) {
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    force.resume();
}

function releasenode(d) {
    d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    //force.resume();
}

function mouseouted(d) {
    if (force.alpha()==0) {
        nodeG.style("fill-opacity" , 1);
        svg.selectAll(".layerInfoVis")
            .style("fill-opacity" ,1);
        svg.selectAll(".layerVAST")
            .style("fill-opacity" ,1);
        svg.selectAll(".layerSciVis")
            .style("fill-opacity" ,1);
        svg.selectAll(".linkArc")
            .style("stroke-opacity" , 1);
        svg.selectAll(".linePNodes")
            .style("stroke-opacity" , 1);
        svg.selectAll(".nodeLine")
            .style("stroke-opacity" , 1);
        svg.selectAll(".nodeLine1")
            .style("stroke-opacity" , 0.25);
        svg.selectAll(".nodeLine2")
            .style("stroke-opacity" , 0.25);

        nodeG.style("font-weight", "")  ;
        nodeG.transition().duration(500).attr("transform", function(n) {
            return "translate(" +n.xConnected + "," + n.y + ")"

        })
    }
}

// check if a node for a month m already exist.
function isContainedChild(a, m) {
    if (a){
        for (var i=0; i<a.length;i++){
            var index = a[i];
            if (nodes[index].year==m)
                return i;
        }
    }
    return -1;
}

// check if a node for a month m already exist.
function isContainedInteger(a, m) {
    if (a){
        for (var i=0; i<a.length;i++){
            if (a[i]==m)
                return i;
        }
    }
    return -1;
}

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy)/2;
    if (d.source.y<d.target.y )
        return "M" + (xStep+d.source.x) + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + (xStep+d.target.x) + "," + d.target.y;
    else
        return "M" + (xStep+d.target.x) + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + (xStep+d.source.x) + "," + d.source.y;
}


