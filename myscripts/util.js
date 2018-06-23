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



function searchNode() {
    svg.selectAll(".linePNodes").remove();
    searchTerm = document.getElementById('search').value;
    handle.attr("cx", xScaleSlider(valueSlider));
    recompute();
}

function mouseoveredLink(l) {
    if (force.alpha()==0) {
        // mouseovered(l.source);

        var term1 = l.source.name;
        var term2 = l.target.name;
        var list = {};
        list[term1] = l.source;
        list[term2] = l.target;

        var listCardId = [];
        var listTilte = [];
        var listEvidence = [];
        var listType = [];
        var listBoth = {};

        data2.forEach(function(d) {
            var year = d.year;
            if (year==l.m){
                var list = d["Teams"].split(" vs. ");
                for (var i=0; i<list.length;i++){
                    if (term1==list[i]){
                        for (var j=0; j<list.length;j++){
                            if (term2==list[j]){
                                if (!listBoth[d.Title.substring(0,10)+"**"+d.Conference]){
                                    listCardId.push(d["CardId"]);
                                    listEvidence.push(d.Title+":  "+d["Teams"]);
                                    listTilte.push(d.Evidence);
                                    listType.push(d["Location"]);
                                    listBoth[d.Title.substring(0,10)+"**"+d.Conference] =1;
                                }
                            }
                        }
                    }
                }
            }
        });

        var x1 = l.source.x;
        var x2 = l.target.x;
        var y1 = l.source.y;
        var y2 = l.target.y;
        var x3 = xStep+(x1+x2)/2+Math.abs(y1-y2)/2+10;
        var yGap = 12;
        var totalSize = yGap*listTilte.length;

        var tipData = new Object();
        tipData.x = x3;
        tipData.y = (y1+y2)/2;
        tipData.a = listTilte;
        for (var i=0; i<listTilte.length;i++){
            var y3 = (y1+y2)/2-totalSize/2+(i+0.5)*yGap;
            svg.append("text")
                .attr("class", "linkTilte")
                .attr("x", x3)
                .attr("y", y3)
                .text(listEvidence[i]+ " at "+listType[i])
                .attr("dy", ".21em")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")
                .style("font-weight", "bold")
                .style("text-anchor", "left")
                .style("fill", function(d) {
                    return getColor(listType[i], 0);
                })
                .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.6");
        }

        svg.selectAll(".linkArc")
            .style("stroke-opacity", function(l2) {
                if (l==l2)
                    return 1;
                else
                    return 0.05;
            });

        svg.selectAll(".linePNodes")
            .style("stroke-opacity", 0.1);

        nodeG.style("fill-opacity" , function(n) {
            if (n.name== term1 || n.name== term2)
                return 1;
            else
                return 0.05;
        });

        svg.selectAll(".nodeLine").style("stroke-opacity" , function(n) {
            if ((n.name== term1 || n.name== term2)
                && list[term1].year == n.year)
                return 1;
            else
                return 0.01;
        });
        svg.selectAll(".nodeLine1").style("stroke-opacity" , function(n) {
            if ((n.name== term1 || n.name== term2)
                && list[term1].year == n.year)
                return 0.25;
            else
                return 0.05;
        });
        svg.selectAll(".nodeLine2").style("stroke-opacity" , function(n) {
            if ((n.name== term1 || n.name== term2)
                && list[term1].year == n.year)
                return 0.25;
            else
                return 0.05;
        });

        nodeG.transition().duration(500).attr("transform", function(n) {
            if (n.name== term1 || n.name== term2){
                var newX =xStep+xScale(l.m);
                return "translate(" + newX + "," + n.y + ")"
            }
            else{
                return "translate(" + n.xConnected + "," + n.y + ")"
            }
        })
    }
}
function mouseoutedLink(l) {
    if (force.alpha()==0) {
        svg.selectAll(".linkTilte").remove();
        svg.selectAll(".linkArc")
            .style("stroke-opacity" , 1);
        nodeG.style("fill-opacity" , 1);
        nodeG.transition().duration(500).attr("transform", function(n) {
            return "translate(" +n.xConnected + "," + n.y + ")"
        })
        svg.selectAll(".linePNodes")
            .style("stroke-opacity", 1);
        svg.selectAll(".nodeLine")
            .style("stroke-opacity" , 1);
        svg.selectAll(".nodeLine1")
            .style("stroke-opacity" , 0.25);
        svg.selectAll(".nodeLine2")
            .style("stroke-opacity" , 0.25);

    }
}


function mouseovered(d) {
    if (force.alpha>0) return;
    var list = new Object();
    list[d.name] = new Object();

    svg.selectAll(".linkArc")
        .style("stroke-opacity" , function(l) {
            if (l.source.name==d.name){
                if (!list[l.target.name]){
                    list[l.target.name] = new Object();
                    list[l.target.name].count=1;
                    list[l.target.name].year=l.m;
                    list[l.target.name].linkcount=l.count;
                }
                else{
                    list[l.target.name].count++;
                    if (l.count>list[l.target.name].linkcount){
                        list[l.target.name].linkcount = l.count;
                        list[l.target.name].year=l.m;
                    }
                }
                return 1;
            }
            else if (l.target.name==d.name){
                if (!list[l.source.name]){
                    list[l.source.name] = new Object();
                    list[l.source.name].count=1;
                    list[l.source.name].year=l.m;
                    list[l.source.name].linkcount=l.count;
                }
                else{
                    list[l.source.name].count++;
                    if (l.count>list[l.source.name].linkcount){
                        list[l.source.name].linkcount = l.count;
                        list[l.source.name].year=l.m;
                    }
                }
                return 1;
            }
            else
                return 0.01;
        });

    svg.selectAll(".linePNodes")
        .style("stroke-opacity" , 0.01);

    svg.selectAll(".nodeLine")
        .style("stroke-opacity" , 0.01);



    nodeG.style("fill-opacity" , function(n) {
        if (list[n.name])
            return 1;
        else
            return 0.1;
    })
        .style("font-weight", function(n) { return d.name==n.name ? "bold" : ""; })
    ;

    nodeG.transition().duration(500).attr("transform", function(n) {
        if (list[n.name] && n.name!=d.name){
            var newX =xStep+xScale(list[n.name].year);
            return "translate(" + newX + "," + n.y + ")"
        }
        else{
            return "translate(" + n.xConnected + "," + n.y + ")"
        }
    })
}

