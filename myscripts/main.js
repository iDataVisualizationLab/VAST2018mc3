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


var data;
var node,linkArcs;
var nodes =[], links =[];
var nodeSuspicious =[], linkSuspicious =[];
var nodeSuspicious2 =[], linkSuspicious2 =[];

var nodeCurrent =[], linkCurrent =[];
var nodeAssociated1 =[], nodeAssociated2 =[], linkeAssociated =[];

var nodeHighDegree =[]; // Nodes with degree >=2 to draw timeline
var nodeHighNeighbor =[]; // Nodes with neighbors >=2

var terms = new Object();

var xStep = 280;
var xScale = d3.scale.linear().range([xStep+20, (width-50)]);
var xScaleGlobal = d3.scale.linear().range([xStep+20, (width-50)]);
var xScaleTime = d3.time.scale().range([xStep+20, (width-50)]);
var xScaleTime2 =d3.time.scale().range([xStep+20, (width-50)]);

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


var minT=10000000000, maxT=0;
var suspicious = {};
var people = {};

var considerTime = -10000000;  // Day 0      
var suspiciousId1 =-1;
var suspiciousId2 =-1;


d3.csv("data/CompanyIndex.csv", function(error, data_) {
    data_.forEach(function (d) {
        people[d.ID] = d;
    });
    d3.csv("data/involvedCompanyIndex.csv", function(error, data1) {
        data1.forEach(function (d) {
            suspicious[d.ID] = d;
        });
         d3.csv("data/Suspicious.csv", function (error, data2) {
      //d3.csv("data/involved.csv", function (error, data2) {

        //  d3.csv("data2/group.csv", function (error, data2) {
      // d3.csv("data2/groupCalls.csv", function (error, data2) {
      //  d3.csv("data2/groupEmails.csv", function (error, data2) {      
      //  d3.csv("data2/groupPurchases.csv", function (error, data2) {
      //  d3.csv("data2/groupMeeting.csv", function (error, data2) {

      //d3.csv("data3/suspiciousFromDay0.csv", function (error, data2) { // has structure for 24 hours
                                                                            // for 24 hours ->1000 nodes
      //d3.csv("data3/suspiciousFromDay1.csv", function (error, data2) { // no structure for 48 hours
      //  d3.csv("data3/suspiciousFromDay2.csv", function (error, data2) {
      //  d3.csv("data3/suspiciousFromDay3.csv", function (error, data2) {
      //  d3.csv("data3/suspiciousFromDay4.csv", function (error, data2) {   // has structure for 24 hours
      //  d3.csv("data3/suspiciousFromDay5.csv", function (error, data2) {  // has structure for 32 hours 700 nodes
      //  d3.csv("data3/suspiciousFromDay6.csv", function (error, data2) {   // has structure for 48 hours
      //  d3.csv("data3/groupAll.csv", function (error, data2) {  // 1 day before and one day after
      // d3.csv("data4/allInvolvedTransactions.csv", function (error, data2) {
      //   d3.csv("data4/allSuspiciousTransInPrev1Day.csv", function (error, data2) {  // For Question 4

       //  d3.csv("data4/all8HoursTrans.csv", function (error, data2) {
       // d3.csv("data4/all2HoursTrans.csv", function (error, data2) {
              if (error) throw error;

            //data2[0].Time = 1214261;
             //data2[0].Time = 1756767;
             //data2[0].Time = 7849426;
            //data2[0].Time = 48342647;    
            //data2[0].Time = 80099051;
            //data2[0].Time = 66877336;  
            //data2[0].Time = 31792115;    
            // data2[0].Time = 57827460;    
            
            
          //data2[0].Time = 1214261;   // suspicous
          //  considerTime = +data2[0].Time;


            /*
            if (data2[0].Time!=undefined){
                considerTime = +data2[0].Time;

                 data = data2.filter(function(d){
                    var time = +d["X4"];
                    var interval = 24*60*60;
                    //var considerTime = 74565933;   // Question 2

                   //  var considerTime = 53206509;  // Day 0
                   //  var considerTime = 69572943;
                   // var considerTime = 65109062;  // Day 2
                   //  var considerTime = 81692792;  // Day 3
                   // var considerTime = 66679529;  // Day 4
                   //var considerTime = 81994361;  // Day 6
                   //var considerTime = 1214261;   // Question 3


                    return (considerTime-interval<time && time<considerTime+interval);
                });    
            }
            else */
                data = data2;

            data.forEach(function (d) {
                // var year =  new Date(d.date).getMonth();
                var time = +d["X4"];

                //if (time<0300123) {
                //  return;
                //}

                minT = Math.min(minT, time);
                maxT = Math.max(maxT, time);

                console.log ("minT= "+minT)
                
                var id1 = +d["X1"];
                if (terms[id1] == undefined) {
                    terms[id1] = new Object();
                    terms[id1].degree = 1;
                    terms[id1].id = id1;
                    terms[id1].listTimes = [];
                    terms[id1].listTimes.push(time);
                    nodes.push(terms[id1]);
                }
                else {
                    terms[id1].degree++;
                    terms[id1].listTimes.push(time);
                }

                var id2 = +d["X3"];
                if (terms[id2] == undefined) {
                    terms[id2] = new Object();
                    terms[id2].degree = 1;
                    terms[id2].id = id2;
                    terms[id2].listTimes = [];
                    terms[id2].listTimes.push(time);
                    nodes.push(terms[id2]);
                }
                else {
                    terms[id2].degree++;
                    terms[id2].listTimes.push(time);
                }
                var l = new Object();
                l.source = terms[id1];
                l.target = terms[id2];
                l.time = time;
                l.id = l.source.id + " " + l.target.id+" "+d["X4"];
                l.category = d["X2"];
                links.push(l);
            });
            console.log("Done reading data nodes.length=" +nodes.length + " links.length=" +links.length);
 
             // Compute followers *************************
             for (var i=0; i< links.length;i++) {
                if (suspicious[links[i].source.id] && suspicious[links[i].target.id]) {
                    linkSuspicious.push(links[i]);
                    links[i].betweenSuspicious = true;  // Add new property to indicate links between suspicious
                }
                else {
                    linkeAssociated.push(links[i]);
                    links[i].betweenSuspicious = false; // Add new property to indicate links between suspicious

                    if (suspicious[links[i].source.id]) {
                        if (links[i].source.followers == undefined) {
                            links[i].source.followers = [];
                        }
                        if (isContainedChild(links[i].source.followers, links[i].target) < 0)  // No duplicate elements
                            links[i].source.followers.push(links[i].target);
                    }
                    else if (suspicious[links[i].target.id]) {
                        if (links[i].target.followers == undefined) {
                            links[i].target.followers = [];
                        }
                        if (isContainedChild(links[i].target.followers, links[i].source) < 0) // No duplicate elements
                            links[i].target.followers.push(links[i].source);
                    }
                }
             }

             // Compute neighbors *************************
             for (var i=0; i< links.length;i++){
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

            // *********************
             var str =" "
             for (var i=0; i< links.length;i++){
                //if (links[i].category=="2" ){
                if (links[i].time==considerTime && links[i].category=="2" ){
                    var id1 = links[i].source.id;
                    suspiciousId1 = id1;
                    if (str.indexOf(" "+id1+" ") <0 )
                        str+=id1 +" ";
                    var id2 = links[i].target.id;
                    suspiciousId2 = id2;
                    if (str.indexOf(" "+id2+" ") <0 )
                        str+=id2 +" ";
                } 
             }   
             var str0 =str;
             console.log("Str1=" +str);

            /*
             // Remove nodes of PURCHASES **************************************************
             var str =" "
             for (var i=0; i< links.length;i++){
                //if (links[i].category=="2" ){
                if (links[i].time==considerTime && links[i].category=="2" ){
                    var id1 = links[i].source.id;
                    if (str.indexOf(" "+id1+" ") <0 )
                        str+=id1 +" ";
                    var id2 = links[i].target.id;
                    if (str.indexOf(" "+id2+" ") <0 )
                        str+=id2 +" ";
                } 
            }   
            console.log("Str=" +str);

            var str0 = "";
            var level =1;
            while (str0!=str){
                str0 = str;

                for (var i=0; i< links.length;i++){
                  //  if (links[i].category=="2" ){
                        var id1 = links[i].source.id;
                        var id2 = links[i].target.id;
                        if (str0.indexOf(" "+id1+" ")<0 && str0.indexOf(" "+id2+" ")>=0)
                                str+=id1 +" ";
                        if (str0.indexOf(" "+id1+" ")>=0 && str0.indexOf(" "+id2+" ")<0)
                                str+=id2 +" "; 
                   //  }   
                }       
                console.log("level=" +level +" number of nodes=" +str.split(" ").length);
                level++;
                //if (str.split(" ").length>100)
                if (level==4)
                      break;
            }
            nodes = nodes.filter(function(d){ 
                return str.indexOf(d.id)>=0;
            })
            links = links.filter(function(d){
                if (str.indexOf(" "+d.source.id+" ")>=0 && str.indexOf(" "+d.target.id+" ")>=0)
                    return d;
            });
            */


            /*
             // Filter within 24 hours *************************************************   ********************    
            links = links.filter(function(d){
               var time = d.time;
                var interval = 4* 3600;
                return (considerTime-interval<time && time<considerTime+interval);
            });    
             var str3 =str0+" "
             for (var i=0; i< links.length;i++){
                var id1 = links[i].source.id;
                if (str3.indexOf(" "+id1+" ") <0 )
                    str3+=id1 +" ";
                var id2 = links[i].target.id;
                if (str3.indexOf(" "+id2+" ") <0 )
                    str+=id2 +" ";
               
            }   
            console.log("Filter within 24 hours Str=" +str3);
            nodes = nodes.filter(function(d){ 
                return str3.indexOf(d.id)>=0;
            })
            links = links.filter(function(d){
                if (str3.indexOf(" "+d.source.id+" ")>=0 && str3.indexOf(" "+d.target.id+" ")>=0)
                    return d;
            });*/

            /*
            // Remove nodes of 1 neighbor *************************
            removerNodes(str0);
            function removerNodes(str_){
                nodes = nodes.filter(function(d){
                    if (suspicious[d.id] || (str_!=undefined && str_.indexOf(d.id)>=0))
                        return d;
                    else
                        return d.neighbors.length>1;
                })
                var str = " ";
                for (var i=0; i<nodes.length;i++) {
                    str += nodes[i].id+" ";
                }
                links = links.filter(function(d){
                    if (str.indexOf(" "+d.source.id+" ")>=0 && str.indexOf(" "+d.target.id+" ")>=0)
                        return d;
                });
            }
             
             nodes.forEach(function(d){
                 d.neighbors = [];
             })
             // Compute neighbors *************************
             for (var i=0; i< links.length;i++){
                 if(isContainedChild(links[i].source.neighbors, links[i].target)<0) { // No duplicate elements{
                     links[i].source.neighbors.push(links[i].target);
                 }
                 if(isContainedChild(links[i].target.neighbors, links[i].source)<0) // No duplicate elements
                     links[i].target.neighbors.push(links[i].source);
             }

           
             // Remove nodes of 1 neighbor *************************
             removerNodes(str0);        
             nodes.forEach(function(d){
                 d.neighbors = [];
             })
             // Compute neighbors *************************
             for (var i=0; i< links.length;i++){
                 if(isContainedChild(links[i].source.neighbors, links[i].target)<0) { // No duplicate elements{
                     links[i].source.neighbors.push(links[i].target);
                 }
                 if(isContainedChild(links[i].target.neighbors, links[i].source)<0) // No duplicate elements
                     links[i].target.neighbors.push(links[i].source);
             }*/



             console.log("Done with  Remove nodes of 1 neighbor" );


            
             // Compute Suspicious nodes
            for (var i=0; i< nodes.length;i++){
                if (suspicious[nodes[i].id]){
                    //console.log(i+" "+);
                    nodeSuspicious.push(nodes[i]);
                }
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



            xScale.domain([minT, maxT]); // Set time domain
            xScaleGlobal.domain([minT, maxT]); // Set time domain
            console.log("Done Remove single nodes:  nodes.length=" +nodes.length + "links.length=" +links.length);


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

             console.log("Done reading data 3");

            // Add nodes **************************************************
            svg.selectAll(".node").remove();
            node = svg.selectAll(".node");
            addNodes(nodes)

            // Add node text **************************
            svg.selectAll(".nodeText").remove();
            svg.selectAll(".nodeText")
                .data(nodes).enter().append("text")
                .attr("class", "nodeText")
                .text(function(d) {
                    if (suspicious[d.id]!=undefined)
                        //return suspicious[d.id].first +" "+suspicious[d.id].last;
                      return suspicious[d.id].first +" ";
                    else
                      //  return people[d.id].first +" "+people[d.id].last;
                      return people[d.id].first ;


                 })
                .attr("dy", "4px")
                .attr("dx", "-18px")
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
                .attr("font-size", function(d) {
                    if (suspicious[d.id]!=undefined)
                        return 13;
                    else
                        return 8+getNodeSize(d);
                })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode);

            // Other functions ***************************************************************************************
            console.log("Done reading data 4");
            drawLegends();

            //orderNodesTimeline();
            buttonClick1();
            console.log("Done reading data 5");

            /*for (var i = 0; i < termArray.length; i++) {
             optArray.push(termArray[i].term);
             }
             optArray = optArray.sort();
             $(function () {
             $("#search").autocomplete({
             source: optArray
             });
             }); */

            // --------------------------------------------------------------------
            d3.csv("data/Suspicious.csv", function (error, data3) {
                var str = " ";
                data3.forEach(function (d) {
                    str += d["X1"] + " " + d["X3"]+" "+d["X4"] +" ";
                });

                svg.selectAll(".linkArc")
                    .attr("stroke-opacity", function (d) {
                        if (considerTime==d.time && d.category=="2")
                            return 1;
                        else if (str.indexOf(d.id)>=0)
                            return 0.7;
                        return arcOpacity;
                    })
                    .style("stroke-width", function (d) {
                        if (considerTime==d.time && d.category=="2")
                            return 3;
                        else if (str.indexOf(d.id)>=0)
                            return 2;
                        else
                            return 1.5;
                    });

                /*
                for (var i=0; i<links.length;i++) {
                    if (str.indexOf(links[i].id)>=0)
                        linkSuspicious2.push(links[i]);
                }
                var str2 = " ";
                for (var i=0; i<linkSuspicious2.length;i++) {
                    var node1 = linkSuspicious2[i].source;
                    if (str2.indexOf(node1.id)<0)
                        str2 += node1.id+" ";
                    var node2 = linkSuspicious2[i].target;
                    if (str2.indexOf(node2.id)<0)
                        str2 += node2.id+" ";
                }
                for (var i=0;i<nodes.length;i++){
                    if (str2.indexOf(nodes[i].id)>=0)
                        nodeSuspicious2.push(nodes[i]);
                }*/
               // colaNetwork(nodeSuspicious2, linkSuspicious2);



               checkVisibility();

                console.log("Done after reading Suspicious.csv");

            });

            var minDate = new Date (new Date("May 11, 2015 14:00").getTime() +minT*1000);
            var maxDate = new Date (new Date("May 11, 2015 14:00").getTime() +maxT*1000);

            var xAxis = d3.svg.axis()
                    .scale(xScaleTime)
                    .orient("bottom");
            var xAxis2 = d3.svg.axis() // xAxis for brush slider
                .scale(xScaleTime2)
                .orient("bottom");

            var height2 = 100;

            xScaleTime.domain([minDate,maxDate]); // extent = highest and lowest points, domain is data, range is bouding box
            xScaleTime2.domain([minDate,maxDate]); // Setting a duplicate xdomain for brushing reference later
            // draw line graph
            svg.append("g")
             .attr("class", "x axis")
               .attr("transform", "translate(0," + (3) + ")")
               .call(xAxis);


            //for slider part-----------------------------------------------------------------------------------
            var context = svg.append("g") // Brushing context box container
                .attr("transform", "translate(" + 0 + "," + (height-120) + ")")
                .attr("class", "context");

            //for slider part-----------------------------------------------------------------------------------
            var brush = d3.svg.brush()//for slider bar at the bottom
                .x(xScaleTime2)
                .on("brush", brushed);

            context.append("g") // Create brushing xAxis
                .attr("class", "x axis1")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

            var contextArea = d3.svg.area() // Set attributes for area chart in brushing context graph
                .interpolate("monotone")
                .x(function(d) { return xScaleTime2(d.date); }) // x is scaled to xScale2
                .y0(height2) // Bottom line begins at height2 (area chart not inverted)
                .y1(0); // Top line of area, 0 (area chart not inverted)

            //append the brush for the selection of subsection
            context.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", 24) // Make brush rects same height
                .attr("height", height2-25) // Make brush rects same height
                .attr("fill", "#E6E7E8");
            //end slider part-----------------------------------------------------------------------------------

            

            nodes.sort(function(a,b){
              if (a.degree>b.degree)
                return -1;
              else
                return 1;

            });

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

            nodeCurrent.sort(function(a,b){
              if (a.degree>b.degree)
                return -1;
              else
                return 1;

            });

           // colaNetwork(nodeCurrent, linkCurrent);
           // colaNetwork(nodeSuspicious, linkSuspicious)
            colaNetwork(nodes, links);

            console.log("Done after COLA");


            //for brusher of the slider bar at the bottom
            function brushed() {
                xScaleTime.domain(brush.empty() ? xScaleTime2.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent
                var d1 = (xScaleTime.domain()[0].getTime() - new Date("May 11, 2015 14:00").getTime())/1000;
                var d2 = (xScaleTime.domain()[1].getTime() - new Date("May 11, 2015 14:00").getTime())/1000;
                xScale.domain([d1,d2]);
                 buttonClick1();
                //orderNodesTimeline();
                //sortDownstream(nodes,links,[1,1,0,1]);

                svg.select(".x.axis") // replot xAxis with transition when brush used
                    .transition()
                    .call(xAxis);
            };
        });
    });
 });


function getNodeSize(d) {
   return  5+ Math.pow(d.neighbors.length,0.6);
}

function addLinks(links1) {
    //Create all the line svgs but without locations yet
    linkArcs = linkArcs.data(links1, function(d) { return d.id; });
    linkArcs.exit().remove();
    linkArcs
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke", function (d) {return colores_google(d.category);})
        .style("stroke-width", function (d) { return 1;});
    linkArcs = svg.selectAll(".linkArc");
}


function addNodes(nodes1) {
    node = node.data(nodes1, function(d) { return d.id;});
    node.exit().remove();
    node.enter().append("circle")
        .attr("class", "node")
        .attr('r', 1)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr("fill", function (d) { return suspicious[d.id] ? colorSuspicious : 
            //Gail,Feindt,2040565
            d.id=="2040565" ? "#f00" :
            ((d.neighbors.length<2) ? color1 : color2); })
        .attr("fill-opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode);
    node = svg.selectAll(".node");
}

function mouseoverNode(d){
     var list = " ";
    svg.selectAll(".linkArc").attr("stroke-opacity", function(l){
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
    checkVisibility();
}

// Mouseover the list of node ids in the string input str
function mouseoverLinksIDs(str){
    svg.selectAll(".linkArc").attr("stroke-opacity", function(l){
         if (str.indexOf(" "+l.source.id+" ")>=0 && str.indexOf(" "+l.target.id+" ")>=0){
             return 0.7;
         }
         else
            return 0.02;
    });
    checkVisibility();
}


function mouseoutNode() {
    svg.selectAll(".node")
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);
    svg.selectAll(".nodeText")
        .attr("fill-opacity", 1);
    svg.selectAll(".linkArc").attr("stroke-opacity", arcOpacity);
    svg.selectAll(".lineNodes")
        .attr("stroke-opacity",1);

    checkVisibility();
}



function linkArc(d) {
    var dx = d.target.xx - d.source.xx,
        dy = d.target.yy - d.source.yy,
        dr = Math.sqrt(dx * dx + dy * dy)/2;
   // if (d.source.y<d.target.y )
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
   // else
   //     return "M" + +d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
}

function linkArc2(d) {
    var xx = xScale(d.time),
        dy = d.target.yy - d.source.yy,
        dr = dy;
  // if (d.source.yy<d.target.yy)
        return "M" + xx + "," + d.source.yy + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.target.yy;
  //  else
  //      return "M" + xx + "," + d.target.yy + "A" + dr + "," + dr + " 0 0,1 " + xx + "," + d.source.yy;
}


