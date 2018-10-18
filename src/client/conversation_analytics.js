// Analytics.js after improving code quality
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10){
    dd = "0" + dd;
}
if (mm < 10){
    mm = "0" + mm;
}
today = yyyy + "-" + mm + "-" + dd;
var currentDate = today;

//var shown;
var date = new Date(currentDate);

Template.conversation_analytics.rendered = function() {
    Session.set("connectaReady", false);
    $("#usageStats").hide();
    Meteor.startup(function() {
        $.getScript("https://cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js", function() {
            // script has loaded
            Session.set("conectaReady", true);
        });
    });

    //**************** calendar code ****************

    //dateFormat = "dd/mm/yy";
    $("#from").datepicker({
        dateFormat: "dd/mm/yy",
        defaultDate: new Date(),
        changeYear: true,
        changeMonth: true,
        numberOfMonths: 1,
        autoclose: true,
        maxDate: new Date()
    });

    $("#to").attr("disabled", "disabled");

    Session.set("time", "Daily");
    Session.set("top_trans_count", 10);
    Session.set("intent_filter", "all");
    Session.set("action_filter", "all");

    Meteor.call("getAnalyticalData", "Last_Sync", function(err, result) {
        var res = JSON.parse(result.outputtext);
        //console.log("data", JSON.parse(result.outputtext));
        Session.set("lastUpdated", res[0].key);
    });

    //**************** count API call ****************
    Meteor.call("getAnalyticalData", "stats", function(err, result) {
        var summary = JSON.parse(result.outputtext);
        Session.set("statsData", summary);
    });

    //**************** transaction call ****************

    Meteor.call("getTableData", "All", "All", "10", function(err, result) {
        var data = JSON.parse(result.outputtext);
        //console.log("transaction", data);
        Session.set("tableData", data);
    });

    //**************** intent pie chart plot ****************
    Meteor.call("getAnalyticalData", "action", function(err, result) {

        var res = JSON.parse(result.outputtext);
        //console.log("action check res: ", res);
        Session.set("action", res);

    });

    //**************** intent pie chart plot ****************
    Meteor.call("getAnalyticalData", "intent", function(err, result) {
        Session.set("chathistory", result.outputtext);
        var res = JSON.parse(result.outputtext);

        if (res.length == 0){
            d3.select("#intentPieChart").append("p")
                .text("No data");

            d3.select("#conversationTable").append("p")
                .text("No data");

            $("#select").attr("disabled", "disabled");
            $("#select").css("cursor", "not-allowed");
        } else {
            $("#select").attr("enabled", "enabled");
            $("#select").css("cursor", "default");

            var intentArray = [];
            for (var i = 0; i < res.length; i++) {
                var obj = {};
                obj["name"] = res[i].key;
                obj["id"] = res[i].id;
                intentArray.push(obj);

            }

            //console.log("Intent check res: ", res);
            Session.set("intents", intentArray);
            //console.log("Intent Array : ", intentArray);

            var analyticalArray = Session.get("chathistory");
            var width = 520,
                height = 250;

            var data = JSON.parse(analyticalArray);

            //**************** Intent horizontal Bar Chart **************** 
            var chart = document.getElementById("intentPieChart"),
                axisMargin = 20,
                margin = 20,
                valueMargin = 4,
                barHeight = (height - axisMargin - margin * 2) * 0.4 / data.length,
                barPadding = (height - axisMargin - margin * 2) * 0.6 / data.length,
                bar, svg, scale, xAxis, labelWidth = 0;

            var max = d3.max(data.map(function(i) {
                return i.value;
            }));

            svg = d3.select(chart)
                .append("svg")
                .attr("width", width)
                .attr("height", 250);

            bar = svg.selectAll("g")
                .data(data)
                .enter()
                .append("g");

            bar.attr("class", "bar")
                .attr("cx", 0)
                .attr("transform", function(d, i) {
                    return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
                });

            bar.append("text")
                .style("font-size", "13px")
                .style("fill", "#333")
                .attr("class", "label")
                .attr("y", barHeight / 2)
                .attr("dy", ".35em") //vertical align middle
                //.text(function(d) {
                .text(function(){
                    //return d.key;
                    return "";
                }).each(function() {
                    labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
                });

            scale = d3.scale.linear()
                .domain([0, max])
                .range([0, width - margin * 2 - labelWidth]);

            xAxis = d3.svg.axis()
                .scale(scale)
                .tickSize(-height + 2 * margin + axisMargin)
                .orient("bottom");

            bar.append("rect")
                .style("fill", "steelblue")
                .attr("transform", "translate(" + labelWidth + ", 0)")
                .attr("height", barHeight + 12)
                .attr("width", function(d) {
                    return scale(d.value);
                });

            bar.append("text")
                .style("fill", "white")
                .attr("class", "value")
                .attr("y", barHeight / 2)
                .attr("dx", function(d) {
                    var width = this.getBBox().width;
                    return -Math.max(width + valueMargin, scale(d.value)) / 2;
                })
                .attr("dy", ".60em") //vertical align middle
                .attr("text-anchor", "middle")       
                .text(function(d) {
                    return d.key + " [ " + d.value + " ]";
                })
                .attr("x", function(d) {
                    var width = this.getBBox().width;
                    return Math.max(width + valueMargin, scale(d.value));
                });

            //console.log("value Calculated  labelWidth : ", labelWidth);
            svg.insert("g", ":first-child")
                .attr("class", "axis")
                .attr("transform", "translate(" + (margin + labelWidth) + "," + (height - axisMargin - margin) + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "end");
            //**************** END of Intent horizontal Bar Chart ****************
        }
    });

    //**************** gridster code ****************
    //var gridster;
    $(".gridster ul").gridster({
        widget_base_dimensions: [100, 100],
        widget_margins: [5, 5],
        helper: "clone"
    }).data("gridster");


    //**************** FeedBack pie chart plot ****************
    Meteor.call("getAnalyticalData", "satisfaction", function(err, result) {
        var feedbackAnalyticalArray = JSON.parse(result.outputtext);
        //console.log("feedback : ", feedbackAnalyticalArray);

        if (feedbackAnalyticalArray.length == 0) {
            d3.select("#feedbackPieChart").append("p")
                .text("No data");
        }else{
            var width = 530,
                height = 250,
                radius = Math.min(width, height) / 2;
            
            var color = d3.scale.category20c();
            var arc = d3.svg.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.value;
                });

            var svg1 = d3.select("#feedbackPieChart").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 3.8 + "," + height / 1.9 + ")");

            var data1 = feedbackAnalyticalArray;
            data1.forEach(function(d) {
                d.value = +d.value;
            });

            var g1 = svg1.selectAll(".arc")
                .data(pie(data1))
                .enter().append("g")
                .attr("class", "arc");

            g1.append("path")
                .attr("d", arc)
                .attr("data-legend", function(d) {
                    return d.data.key;
                })
                .attr("data-legend-pos", function(d, i) {
                    return i;
                })
                .style("fill", function(d) {
                    return color(d.data.key);
                });

            g1.append("text")
                .attr("transform", function(d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) {
                    return d.data.value;
                })
                .style("fill", "#fff");

            var padding = 20,
                legx = radius + padding;

            svg1.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + legx + ", 0)")
                .style("font-size", "10px")
                .call(d3.legend);
        }
    });


    //**************** legend plot ****************
    (function() {
        d3.legend = function(g) {
            g.each(function() {
                var g = d3.select(this),
                    items = {},
                    svg = d3.select(g.property("nearestViewportElement")),
                    legendPadding = g.attr("data-style-padding") || 5,
                    lb = g.selectAll(".legend-box").data([true]),
                    li = g.selectAll(".legend-items").data([true]);

                lb.enter().append("rect").classed("legend-box", true);
                li.enter().append("g").classed("legend-items", true);

                svg.selectAll("[data-legend]").each(function() {
                    var self = d3.select(this);
                    items[self.attr("data-legend")] = {
                        pos: self.attr("data-legend-pos") || this.getBBox().y,
                        color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != "none" ? self.style("fill") : self.style("stroke")
                    };
                });

                items = d3.entries(items).sort(function(a, b) {
                    return a.value.pos - b.value.pos;
                });


                li.selectAll("text")
                    .data(items, function(d) {
                        return d.key;
                    })
                    .call(function(d) {
                        d.enter().append("text");
                    })
                    .call(function(d) {
                        d.exit().remove();
                    })
                    .attr("y", function(d, i) {
                        return i - 4 + "em";
                    })
                    .attr("x", "1em")
                    .text(function(d) {
                        return d.key;
                    });

                li.selectAll("circle")
                    .data(items, function(d) {
                        return d.key;
                    })
                    .call(function(d) {
                        d.enter().append("circle");
                    })
                    .call(function(d) {
                        d.exit().remove();
                    })
                    .attr("cy", function(d, i) {
                        return i - 4.25 + "em";
                    })
                    .attr("cx", 0)
                    .attr("r", "0.4em")
                    .style("fill", function(d) {
                        return d.value.color;
                    });

                //**************** Reposition and resize the box ****************
                var lbbox = li[0][0].getBBox();
                lb.attr("x", (lbbox.x - legendPadding - 6))
                    .attr("y", (lbbox.y - legendPadding - 9))
                    .attr("height", (lbbox.height + 12 + 2 * legendPadding))
                    .attr("width", (lbbox.width + 2 * legendPadding));
            });
            return g;
        };
    })();

    var inputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    //console.log("date", inputDate);

    $("#from").val(inputDate);
    $("#to").val(inputDate);

    today = today + "/0";
    //console.log("todays date", today);

    Session.set("startDate", currentDate);
    Session.set("endDate", currentDate);

    //**************** line chart plot ****************
    Meteor.call("getChartData", "day", today, function(err, result) {
        $("#feedbackPieChart").find("rect").css("width", "100px");
        //var res = JSON.parse(result.outputtext);

        //console.log("response", res);
        $("#day").attr("enabled", "enabled");
        $("#day").css("cursor", "default");
        $("#month").attr("enabled", "enabled");
        $("#month").css("cursor", "default");
        $("#week").attr("enabled", "enabled");
        $("#week").css("cursor", "default");
        $("#day").css("background-color", "darkcyan");

        var margin = {
                top: 20,
                right: 20,
                bottom: 100,
                left: 50
            },
            width = 730 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        //**************** set the ranges ****************
        var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x).ticks(6)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y).ticks(10)
            .orient("left");

        d3.select("#lineChart").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("#lineChart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var data = JSON.parse(result.outputtext);
        for (var i = 0; i < data.length; i++) {
            if (data[i].key == "User") {
                Session.set("userUsage", data[i].value);
            } else if (data[i].key == "Conversation") {
                Session.set("conversationUsage", data[i].value);
            } else if (data[i].key == "topic") {
                Session.set("intentUsage", data[i].value);
            }
        }

        result = data.map(function(a) {
            return a.key;
        });

        var tempData = [];

        for (i = 1; i <= 24; i++) {
            var obj = {};
            if (result.includes(i)) {
                if (i < 12) {
                    obj["key"] = i + " AM";
                } else if (i == 24) {
                    obj["key"] = 12 + " AM";
                } else if (i == 12) {
                    obj["key"] = 12 + " PM";
                } else {
                    obj["key"] = i - 12 + " PM";
                }
                var value = data.filter(function(obj) {
                    return obj.key == i;
                });
                obj["value"] = value[0].value;
                tempData.push(obj);
            } else {
                if (i < 12) {
                    obj["key"] = i + " AM";
                } else if (i == 24) {
                    obj["key"] = 12 + " AM";
                } else if (i == 12) {
                    obj["key"] = 12 + " PM";
                } else {
                    obj["key"] = i - 12 + " PM";
                }
                obj["value"] = 0;
                tempData.push(obj);
            }
        }

        data = tempData;
        //console.log("result", data);

        // format the data
        data.forEach(function(d) {
            d.key = d.key;
            d.value = +d.value;
        });

        // Scale the range of the data
        x.domain(data.map(function(d) {

            return d.key;
        }));

        y.domain([0, d3.max(data, function(d) {
            return d.value;
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "1.2em")
            .attr("dy", "1.15em")
            .attr("transform", function() {
                return "rotate(0)";
            });

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-4.41em")
            .style("text-anchor", "end")
            .text("No. of Conversations");

        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .style("fill", "steelblue")
            .attr("x", function(d) {
                return x(d.key);
            })
            .attr("width", x.rangeBand())
            .attr("height", 0)
            .transition()
            .duration(400)
            .delay(function(d, i) {
                return i * 10;
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("height", function(d) {
                return height - y(d.value);
            });

        var ticks = d3.selectAll(".x text");
        ticks.attr("class", function(d, i) {
            if (i % 4 != 0) d3.select(this).remove();
        });

        $("#usageStats").show();

    });

};


Template.conversation_analytics.helpers({
    analyticalData() {
        if (Session.get("tableData")) {
            //console.log("dtat hai", Session.get("tableData"));
            return Session.get("tableData");
        } else
            return [];
    },

    getActions() {
        if (Session.get("action")) {
            //console.log("action hai", Session.get("action"));
            return Session.get("action");
        } else {
            return [];
        }
    },

    getIntents() {
        if (Session.get("intents")) {
            //console.log("dtat hai", Session.get("intents"));
            return Session.get("intents");
        } else {
            return [];
        }
    },

    lastUpdate() {
        if (Session.get("lastUpdated")) {
            return Session.get("lastUpdated");
        } else {
            return "";
        }
    },

    userUsage() {
        if (Session.get("userUsage")) {
            return Session.get("userUsage");
        } else {
            return "0";
        }
    },

    conversationUsage() {
        if (Session.get("conversationUsage")) {
            return Session.get("conversationUsage");
        } else {
            return "0";
        }
    },

    intentUsage() {
        if (Session.get("intentUsage")) {
            return Session.get("intentUsage");
        } else {
            return "0";
        }
    },

    durationUsage() {
        if (Session.get("time")) {
            return Session.get("time");
        } else {
            return "";
        }
    },

    summaryLabel(index) {
        if (Session.get("statsData") && Session.get("statsData").length <= 5) {
            return Session.get("statsData")[index].key;
        } else {
            return "";
        }
    },

    summaryValue(index) {
        if (Session.get("statsData") && Session.get("statsData").length <= 5) {
            return Session.get("statsData")[index].value;
        } else {
            return "";
        }
    }
});

Template.conversation_analytics.events({
    "click #day": function() {
        //console.log("day clicked");

        $("#week").css("background-color", "gray");
        $("#day").css("background-color", "darkcyan");
        $("#month").css("background-color", "gray");

        $("#lineChart svg").remove();
        $("#lineChart .tooltip").remove();

        Session.set("time", "Daily");
        $("#usageStats").hide();
        $("#to").attr("disabled", "disabled");

        var date = new Date(currentDate);

        var inputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        //console.log("date", inputDate);

        $("#from").val(inputDate);
        $("#to").val(inputDate);
        Session.set("startDate", currentDate);
        Session.set("endDate", currentDate);

        Meteor.call("getChartData", "day", today, function(err, result) {
            // set the dimensions and margins of the graph
            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 100,
                    left: 50
                },
                width = 730 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
            var y = d3.scale.linear().range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x).ticks(10)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y).ticks(10)
                .orient("left");

            d3.select("#lineChart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            // append the svg obgect to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = d3.select("#lineChart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            var data = JSON.parse(result.outputtext);
            for (var i = 0; i < data.length; i++) {
                if (data[i].key == "User") {
                    Session.set("userUsage", data[i].value);
                } else if (data[i].key == "Conversation") {
                    Session.set("conversationUsage", data[i].value);
                } else if (data[i].key == "topic") {
                    Session.set("intentUsage", data[i].value);
                }
            }

            result = data.map(function(a) {
                return a.key;
            });

            var tempData = [];

            for (i = 1; i <= 24; i++) {
                var obj = {};
                if (result.includes(i)) {
                    if (i < 12) {
                        obj["key"] = i + " AM";
                    } else if (i == 24) {
                        obj["key"] = 12 + " AM";
                    } else if (i == 12) {
                        obj["key"] = 12 + " PM";
                    } else {
                        obj["key"] = i - 12 + " PM";
                    }
                    var value = data.filter(function(obj) {
                        return obj.key == i;
                    });
                    obj["value"] = value[0].value;
                    tempData.push(obj);
                } else {
                    if (i < 12) {
                        obj["key"] = i + " AM";
                    } else if (i == 24) {
                        obj["key"] = 12 + " AM";
                    } else if (i == 12) {
                        obj["key"] = 12 + " PM";
                    } else {
                        obj["key"] = i - 12 + " PM";
                    }
                    obj["value"] = 0;
                    tempData.push(obj);
                }
            }

            data = tempData;
            //console.log("result", data);

            // format the data
            data.forEach(function(d) {
                d.key = d.key;
                d.value = +d.value;
            });

            // Scale the range of the data
            x.domain(data.map(function(d) {
                return d.key;
            }));

            y.domain([0, d3.max(data, function(d) {
                return d.value;
            })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "1.2em")
                .attr("dy", "1.15em")
                .attr("transform", function() {
                    return "rotate(0)";
                });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-4.41em")
                .style("text-anchor", "end")
                .text("No. of Conversations");

            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                .style("fill", "steelblue")
                .attr("x", function(d) {
                    return x(d.key);
                })
                .attr("width", x.rangeBand())
                .attr("height", 0)
                .transition()
                .duration(400)
                .delay(function(d, i) {
                    return i * 10;
                })
                .attr("y", function(d) {
                    return y(d.value);
                })
                .attr("height", function(d) {
                    return height - y(d.value);
                });

            var ticks = d3.selectAll(".x text");
            ticks.attr("class", function(d, i) {
                if (i % 4 != 0) d3.select(this).remove();
            });

            $("#lineChart p").remove();
            $("#usageStats").show();
        });
    },

    "click #month": function() {
        //console.log("month clicked");
        $("#lineChart svg").remove();
        $("#lineChart .tooltip").remove();

        $("#week").css("background-color", "gray");
        $("#day").css("background-color", "gray");
        $("#month").css("background-color", "darkcyan");

        Session.set("time", "Monthly");

        $("#usageStats").hide();
        $("#to").attr("disabled", "disabled");
        date = new Date();

        var last = new Date(date.getTime() - (29 * 24 * 60 * 60 * 1000));

        var day = last.getDate();
        if (day < 10) {
            day = "0" + day;
        }

        var month = last.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }

        var year = last.getFullYear();
        var startDay = year + "-" + month + "-" + day;

        date = new Date(startDay);
        var inputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

        $("#from").val(inputDate);

        date = new Date(currentDate);
        var outputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

        $("#to").val(outputDate);

        var range = startDay + "/" + currentDate;

        Session.set("startDate", startDay);
        Session.set("endDate", currentDate);
        //console.log(range);

        Meteor.call("getChartData", "month", range, function(err, result) {
            // set the dimensions and margins of the graph
            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 100,
                    left: 50
                },
                width = 730 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
            var y = d3.scale.linear().range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x).ticks(10)
                .tickFormat(d3.time.format("%d %b"))
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y).ticks(10)
                .orient("left");

            d3.select("#lineChart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var svg = d3.select("#lineChart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            var data = JSON.parse(result.outputtext);
            for (var i = 0; i < data.length; i++) {
                if (data[i].key == "User") {
                    Session.set("userUsage", data[i].value);
                } else if (data[i].key == "Conversation") {
                    Session.set("conversationUsage", data[i].value);
                } else if (data[i].key == "topic") {
                    Session.set("intentUsage", data[i].value);
                }
            }

            var rangeSplit = range.split("/");
            //console.log("split", rangeSplit);
            var startDate = rangeSplit[0];
            var endDate = rangeSplit[1];

            var year = parseInt(startDate.substring(0, 4));
            var month = parseInt(startDate.substring(5, 7)) - 1;
            var startDay = parseInt(startDate.substring(8));
            var endDay = parseInt(endDate.substring(8));
            var startMonth = parseInt(startDate.substring(5, 7));
            var endMonth = parseInt(endDate.substring(5, 7));
            var dateSpan = false;

            if (startMonth != endMonth) {
                dateSpan = true;
            }

            //console.log("startdate", startMonth);
            //console.log("enddate", endMonth);

            var monthStart = new Date(year, month, 1);
            var monthEnd = new Date(year, month + 1, 1);
            var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
            //console.log("days", monthLength);

            if (startMonth < 10) {
                startMonth = "0" + startMonth;
            }

            i = startDay;
            result = data.map(function(a) {
                var key = a.key;
                //console.log(key.substring);
                return key.substring(5);
            });

            //console.log("result", result);

            var tempData = [];
            if (dateSpan == false) {
                while (i <= endDay) {
                    var obj = {};

                    if (result.includes(startMonth + "-" + i) || result.includes(startMonth + "-0" + i)) {
                        if (i < 10) {
                            obj["key"] = startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = startMonth + "-" + i;
                        }

                        var value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        //console.log("value", value);
                        obj["value"] = value[0].value;
                        tempData.push(obj);

                    } else {
                        if (i < 10) {
                            obj["key"] = startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = startMonth + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }
            } else {
                while (i <= monthLength) {
                    obj = {};
                    //console.log(startMonth + "-" + i);

                    if (result.includes(startMonth + "-" + i) || result.includes(startMonth + "-0" + +i)) {
                        if (i < 10) {
                            obj["key"] = startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = startMonth + "-" + i;
                        }

                        value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        //console.log("value", value);
                        obj["value"] = value[0].value;
                        tempData.push(obj);

                    } else {
                        if (i < 10) {
                            obj["key"] = startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = startMonth + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }
                i = 1;

                if (endMonth < 10) {
                    endMonth = "0" + endMonth;
                }
                while (i <= endDay) {
                    obj = {};
                    if (result.includes(endMonth + "-" + i) || result.includes(endMonth + "-0" + i)) {
                        if (i < 10) {
                            obj["key"] = endMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = endMonth + "-" + i;
                        }

                        value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        obj["value"] = value[0].value;
                        tempData.push(obj);
                    } else {

                        if (i < 10) {
                            obj["key"] = endMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = endMonth + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }

            }

            //console.log("monthData", tempData);
            data = tempData;

            // format the data
            data.forEach(function(d) {
                d.key = new Date(d.key);
                d.value = +d.value;
            });

            // Scale the range of the data
            x.domain(data.map(function(d) {
                return d.key;
            }));

            y.domain([0, d3.max(data, function(d) {
                return d.value;
            })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-1.0em")
                .attr("dy", "-0.35em")
                .attr("transform", function() {
                    return "rotate(-90)";
                });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-4.41em")
                .style("text-anchor", "end")
                .text("No. of Conversations");

            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                .style("fill", "steelblue")
                .attr("x", function(d) {
                    return x(d.key);
                })
                .attr("width", x.rangeBand())
                .attr("height", 0)
                .transition()
                .duration(400)
                .delay(function(d, i) {
                    return i * 10;
                })
                .attr("y", function(d) {
                    return y(d.value);
                })
                .attr("height", function(d) {
                    return height - y(d.value);
                });

            $("#usageStats").show();
        });
    },

    "click #week": function() {
        //console.log("week clicked");
        $("#lineChart svg").remove();
        $("#lineChart .tooltip").remove();

        $("#week").css("background-color", "darkcyan");
        $("#day").css("background-color", "gray");
        $("#month").css("background-color", "gray");

        Session.set("time", "Weekly");
        $("#usageStats").hide();
        $("#to").attr("disabled", "disabled");

        var date = new Date();

        var last = new Date(date.getTime() - (6 * 24 * 60 * 60 * 1000));
        var day = last.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        var month = last.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }

        var year = last.getFullYear();
        var startDay = year + "-" + month + "-" + day;

        Session.set("startDate", startDay);
        Session.set("endDate", currentDate);

        var range = startDay + "/" + currentDate;
        //console.log(range);

        date = new Date(startDay);
        var inputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        $("#from").val(inputDate);

        date = new Date(currentDate);
        var outputDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        $("#to").val(outputDate);

        Meteor.call("getChartData", "week", range, function(err, result) {
            // set the dimensions and margins of the graph
            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 100,
                    left: 50
                },
                width = 730 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
            var y = d3.scale.linear().range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x).ticks(10)
                .tickFormat(d3.time.format("%d %b"))
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y).ticks(10)
                .orient("left");

            d3.select("#lineChart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var svg = d3.select("#lineChart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            var data = JSON.parse(result.outputtext);

            for (var i = 0; i < data.length; i++) {
                if (data[i].key == "User") {
                    Session.set("userUsage", data[i].value);
                } else if (data[i].key == "Conversation") {
                    Session.set("conversationUsage", data[i].value);
                } else if (data[i].key == "topic") {
                    Session.set("intentUsage", data[i].value);
                }
            }
            var rangeSplit = range.split("/");
            //console.log("split", rangeSplit);
            var startDate = rangeSplit[0];
            var endDate = rangeSplit[1];

            var year = parseInt(startDate.substring(0, 4));
            var month = parseInt(startDate.substring(5, 7)) - 1;
            var startDay = parseInt(startDate.substring(8));
            var endDay = parseInt(endDate.substring(8));

            //console.log("startDay", startDay);
            //console.log("endDay", endDay);

            var startMonth = parseInt(startDate.substring(5, 7));
            var endMonth = parseInt(endDate.substring(5, 7));
            var dateSpan = false;

            if (startMonth != endMonth) {
                dateSpan = true;
            }

            //console.log("startdate", startMonth);
            //console.log("enddate", endMonth);

            var monthStart = new Date(year, month, 1);
            var monthEnd = new Date(year, month + 1, 1);
            var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
            //console.log("days", monthLength);

            month = month + 1;
            startMonth = month;
            if (month < 10) {
                month = "0" + month;
            }

            i = startDay;
            result = data.map(function(a) {
                var key = a.key;
                return parseInt(key.substring(8, 10));
            });

            //console.log("result", result);

            var tempData = [];
            if (dateSpan == false) {
                while (i <= endDay) {

                    var obj = {};
                    if (result.includes(i)) {
                        if (i < 10) {
                            obj["key"] = year + "-" + month + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + month + "-" + i;
                        }

                        var value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        //console.log("value", value);
                        obj["value"] = value[0].value;
                        tempData.push(obj);
                    } else {
                        if (i < 10) {
                            obj["key"] = year + "-" + month + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + month + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }
            } else {

                while (i <= monthLength) {
                    obj = {};
                    if (result.includes(i)) {
                        if (i < 10) {
                            obj["key"] = year + "-" + startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + startMonth + "-" + i;
                        }

                        value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        obj["value"] = value[0].value;
                        tempData.push(obj);
                    } else {

                        if (i < 10) {
                            obj["key"] = year + "-" + startMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + startMonth + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }
                i = 1;
                if (endMonth < 10) {
                    endMonth = "0" + endMonth;
                }
                while (i <= endDay) {
                    obj = {};
                    if (result.includes(i)) {
                        if (i < 10) {
                            obj["key"] = year + "-" + endMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + endMonth + "-" + i;
                        }

                        value = data.filter(function(obj) {
                            var k = obj.key;
                            return parseInt(k.substring(8, 10)) == i;
                        });

                        obj["value"] = value[0].value;
                        tempData.push(obj);
                    } else {

                        if (i < 10) {
                            obj["key"] = year + "-" + endMonth + "-" + "0" + i;
                        } else {
                            obj["key"] = year + "-" + endMonth + "-" + i;
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                    i++;
                }

            }

            //console.log("weekData", tempData);
            data = tempData;

            // format the data
            data.forEach(function(d) {
                d.key = new Date(d.key);
                d.value = +d.value;
            });

            // Scale the range of the data
            x.domain(data.map(function(d) {
                return d.key;
            }));

            y.domain([0, d3.max(data, function(d) {
                return d.value;
            })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "2.0em")
                .attr("dy", "1.15em")
                .attr("transform", function() {
                    return "rotate(0)";
                });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-4.41em")
                .style("text-anchor", "end")
                .text("No. of Conversations");

            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                .style("fill", "steelblue")
                .attr("x", function(d) {
                    return x(d.key);
                })
                .attr("width", x.rangeBand())
                .attr("height", 0)
                .transition()
                .duration(400)
                .delay(function(d, i) {
                    return i * 10;
                })
                .attr("y", function(d) {
                    return y(d.value);
                })
                .attr("height", function(d) {
                    return height - y(d.value);
                });

            $("#usageStats").show();
        });
    },

    "click #view": function(event) {

        var url = event.currentTarget.name;
        var res = [];

        var el = event.currentTarget.closest("tr");

        if ($(el).hasClass("no-data")) {
            //console.log("empty row found. adding data");

            Meteor.call("getConversationData", url, function(err, result) {
                $("#analyticalTable tr").removeClass("state-open");
                $("#analyticalTable tr.t_details").hide(600);

                if (result.outputtext == undefined) {
                    $(event.target).closest("tr").after(
                        "<tr class=\"t_details\">" +
                        "<td colspan = \"5\">" + "<table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"padding-left:50px;\">" +
                        "No Data Available" +

                        "</table></td>" +
                        "</tr>");
                    //shown = true;
                } else {
                    res = JSON.parse(result.outputtext);
                    var insertrows = "";

                    for (var i = 0; i < res.length; i++) {
                        insertrows = insertrows + "<tr>" +
                            "<td class = \"innerTableTd\">" + "<b>" + res[i].user_name + "</b> (" + res[i].time + ") : </td>" +
                            "</tr><tr>" +
                            "<td class = \"innerTableTd\">" + res[i].input + "</td>" +
                            "</tr><tr>" +
                            "<td class = \"innerTableTd\">" + "<b>HolmesChatBot  </b> (" + res[i].time + ") :</td>" +
                            "</tr><tr>" +
                            "<td class = \"innerTableTd\">" + res[i].output + "</td>" +
                            "</tr>";
                        "</tr>";
                    }

                    $(event.target).closest("tr").after(
                        "<tr class=\"t_details\">" +
                        "<td colspan = \"5\">" + "<table id = \"innerTable\" cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"padding-left:50px; width: 100%;\">" +
                        "<thead>" +
                        "</thead>" +
                        "<tbody style = \"width: 200%; height: 200px; overflow-y:auto; overflow-x:hidden;\">" +
                        insertrows +
                        "</tbody>" +
                        "</table></td>" +
                        "</tr>");
                    //shown = true;
                }

                $(el).next(".t_details").show(600);
                $(el).removeClass("no-data").addClass("state-open");

            });

        }    //if same row is clicked
        else if ($(el).hasClass("state-open")) {
            //console.log("data is already there. do not load");
            $(el).addClass("state-closed").removeClass("state-open");
            $(el).next(".t_details").hide(600);

        } else if ($(el).hasClass("state-closed")) {
            //console.log("show data");
            $("#analyticalTable tr").removeClass("state-open");
            $(el).addClass("state-open");

            $("#analyticalTable tr").addClass("state-closed");
            $(el).removeClass("state-closed");

            $(".t_details").hide(600);
            $(el).next(".t_details").show(600);
        }
    },

    "change #timeline": function(event) {
        //console.log("hi", event.currentTarget.value);
        var count = event.currentTarget.value;
        Session.set("top_trans_count", count);

        var action_filter = Session.get("action_filter");
        var intent_filter = Session.get("intent_filter");

        $("#analyticalTable tr").removeClass("state-open");
        $("#analyticalTable tr.t_details").hide(600);

        Meteor.call("getTableData", intent_filter, action_filter, count, function(err, result) {
            var data = JSON.parse(result.outputtext);
            //console.log("table data", data);
            Session.set("tableData", data);
        });
    },

    "click #dateSubmit": function() {
        var startDate = Session.get("startDate");
        var endDate = Session.get("endDate");
        var range = startDate + "/" + endDate;
        var parameter = Session.get("time");

        if (parameter == "Daily") {
            $("#lineChart svg").remove();
            $("#lineChart .tooltip").remove();
            $("#usageStats").hide();

            Meteor.call("getChartData", "day", range, function(err, result) {
                // set the dimensions and margins of the graph
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 50
                    },
                    width = 730 - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                // set the ranges
                var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x).ticks(10)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y).ticks(10)
                    .orient("left");

                d3.select("#lineChart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                // append the svg obgect to the body of the page
                // appends a 'group' element to 'svg'
                // moves the 'group' element to the top left margin
                var svg = d3.select("#lineChart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                ////console.log("data hai", JSON.parse(result.outputtext))
                var data = JSON.parse(result.outputtext);
                for (var i = 0; i < data.length; i++) {
                    if (data[i].key == "User") {
                        Session.set("userUsage", data[i].value);
                    } else if (data[i].key == "Conversation") {
                        Session.set("conversationUsage", data[i].value);
                    } else if (data[i].key == "topic") {
                        Session.set("intentUsage", data[i].value);
                    }
                }

                result = data.map(function(a) {
                    return a.key;
                });

                var tempData = [];

                for (i = 1; i <= 24; i++) {
                    var obj = {};

                    if (result.includes(i)) {
                        if (i < 12) {
                            obj["key"] = i + " AM";
                        } else if (i == 24) {
                            obj["key"] = 12 + " AM";
                        } else if (i == 12) {
                            obj["key"] = 12 + " PM";
                        } else {
                            obj["key"] = i - 12 + " PM";
                        }

                        var value = data.filter(function(obj) {
                            return obj.key == i;
                        });

                        obj["value"] = value[0].value;
                        tempData.push(obj);
                    } else {
                        if (i < 12) {
                            obj["key"] = i + " AM";
                        } else if (i == 24) {
                            obj["key"] = 12 + " AM";
                        } else if (i == 12) {
                            obj["key"] = 12 + " PM";
                        } else {
                            obj["key"] = i - 12 + " PM";
                        }

                        obj["value"] = 0;
                        tempData.push(obj);
                    }
                }

                data = tempData;
                //console.log("result", data);

                // format the data
                data.forEach(function(d) {
                    d.key = d.key;
                    d.value = +d.value;
                });

                // Scale the range of the data
                x.domain(data.map(function(d) {

                    return d.key;
                }));

                y.domain([0, d3.max(data, function(d) {
                    return d.value;
                })]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "1.2em")
                    .attr("dy", "1.15em")
                    .attr("transform", function() {
                        return "rotate(0)";
                    });

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "-4.41em")
                    .style("text-anchor", "end")
                    .text("No. of Conversations");

                svg.selectAll("bar")
                    .data(data)
                    .enter().append("rect")
                    .style("fill", "steelblue")
                    .attr("x", function(d) {
                        return x(d.key);
                    })
                    .attr("width", x.rangeBand())
                    .attr("height", 0)
                    .transition()
                    .duration(400)
                    .delay(function(d, i) {
                        return i * 10;
                    })
                    .attr("y", function(d) {
                        return y(d.value);
                    })
                    .attr("height", function(d) {
                        return height - y(d.value);
                    });

                var ticks = d3.selectAll(".x text");
                ticks.attr("class", function(d, i) {
                    if (i % 4 != 0) d3.select(this).remove();
                });

                $("#lineChart p").remove();
                $("#usageStats").show();
            });
        } else if (parameter == "Weekly") {
            $("#lineChart svg").remove();
            $("#lineChart .tooltip").remove();
            $("#usageStats").hide();

            Meteor.call("getChartData", "week", range, function(err, result) {
                // set the dimensions and margins of the graph
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 50
                    },
                    width = 730 - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                // set the ranges
                var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x).ticks(10)
                    .tickFormat(d3.time.format("%d %b"))
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y).ticks(10)
                    .orient("left");

                d3.select("#lineChart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                var svg = d3.select("#lineChart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                ////console.log("data hai", JSON.parse(result.outputtext))
                var data = JSON.parse(result.outputtext);
                //console.log("data week : ", data);

                for (var i = 0; i < data.length; i++) {
                    if (data[i].key == "User") {
                        Session.set("userUsage", data[i].value);
                    } else if (data[i].key == "Conversation") {
                        Session.set("conversationUsage", data[i].value);
                    } else if (data[i].key == "topic") {
                        Session.set("intentUsage", data[i].value);
                    }
                }

                var rangeSplit = range.split("/");
                //console.log("split", rangeSplit);
                var startDate = rangeSplit[0];
                var endDate = rangeSplit[1];

                var year = parseInt(startDate.substring(0, 4));
                var month = parseInt(startDate.substring(5, 7)) - 1;
                var startDay = parseInt(startDate.substring(8));
                var endDay = parseInt(endDate.substring(8));
                //console.log("startDay", startDay);
                //console.log("endDay", endDay);

                var startMonth = parseInt(startDate.substring(5, 7));
                var endMonth = parseInt(endDate.substring(5, 7));
                var dateSpan = false;

                if (startMonth != endMonth) {
                    dateSpan = true;
                }

                //console.log("startdate", startMonth);
                //console.log("enddate", endMonth);

                var monthStart = new Date(year, month, 1);
                var monthEnd = new Date(year, month + 1, 1);
                var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
                //console.log("days", monthLength);

                month = month + 1;
                startMonth = month;
                if (month < 10) {
                    month = "0" + month;
                }

                i = startDay;
                result = data.map(function(a) {
                    var key = a.key;
                    return parseInt(key.substring(8, 10));
                });

                //console.log("result", result);

                var tempData = [];
                if (dateSpan == false) {
                    while (i <= endDay) {

                        var obj = {};
                        if (result.includes(i)) {
                            if (i < 10) {
                                obj["key"] = year + "-" + month + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + month + "-" + i;
                            }

                            var value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });
                            
                            //console.log("value", value);
                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {
                            if (i < 10) {
                                obj["key"] = year + "-" + month + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + month + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }
                } else {

                    while (i <= monthLength) {
                        obj = {};
                        if (result.includes(i)) {
                            if (i < 10) {
                                obj["key"] = year + "-" + startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + startMonth + "-" + i;
                            }

                            value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });

                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {

                            if (i < 10) {
                                obj["key"] = year + "-" + startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + startMonth + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }
                    i = 1;
                    if (endMonth < 10) {
                        endMonth = "0" + endMonth;
                    }
                    while (i <= endDay) {
                        obj = {};
                        if (result.includes(i)) {
                            if (i < 10) {
                                obj["key"] = year + "-" + endMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + endMonth + "-" + i;
                            }

                            value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });

                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {

                            if (i < 10) {
                                obj["key"] = year + "-" + endMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = year + "-" + endMonth + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }

                }

                //console.log("weekData", tempData);
                data = tempData;

                // format the data
                data.forEach(function(d) {
                    d.key = new Date(d.key);
                    d.value = +d.value;
                });

                // Scale the range of the data
                x.domain(data.map(function(d) {
                    return d.key;
                }));

                y.domain([0, d3.max(data, function(d) {
                    return d.value;
                })]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "2.0em")
                    .attr("dy", "1.15em")
                    .attr("transform", function() {
                        return "rotate(0)";
                    });

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "-4.41em")
                    .style("text-anchor", "end")
                    .text("No. of Conversations");

                svg.selectAll("bar")
                    .data(data)
                    .enter().append("rect")
                    .style("fill", "steelblue")
                    .attr("x", function(d) {
                        return x(d.key);
                    })
                    .attr("width", x.rangeBand())
                    .attr("height", 0)
                    .transition()
                    .duration(400)
                    .delay(function(d, i) {
                        return i * 10;
                    })
                    .attr("y", function(d) {
                        return y(d.value);
                    })
                    .attr("height", function(d) {
                        return height - y(d.value);
                    });
                $("#usageStats").show();
            });

        } else if (parameter == "Monthly") {
            $("#lineChart svg").remove();
            $("#lineChart .tooltip").remove();
            $("#usageStats").hide();
            Meteor.call("getChartData", "month", range, function(err, result) {
                // set the dimensions and margins of the graph
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 50
                    },
                    width = 730 - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                // set the ranges
                var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x).ticks(10)
                    .tickFormat(d3.time.format("%d %b"))
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y).ticks(10)
                    .orient("left");

                d3.select("#lineChart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                var svg = d3.select("#lineChart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                var data = JSON.parse(result.outputtext);
                for (var i = 0; i < data.length; i++) {
                    if (data[i].key == "User") {
                        Session.set("userUsage", data[i].value);
                    } else if (data[i].key == "Conversation") {
                        Session.set("conversationUsage", data[i].value);
                    } else if (data[i].key == "topic") {
                        Session.set("intentUsage", data[i].value);
                    }
                }

                var rangeSplit = range.split("/");
                //console.log("split", rangeSplit);
                var startDate = rangeSplit[0];
                var endDate = rangeSplit[1];

                function parseDate(str) {
                    var mdy = str.split("-");
                    return new Date(mdy[0], mdy[1] - 1, mdy[2]);
                }

                function daydiff(first, second) {
                    return Math.round((second - first) / (1000 * 60 * 60 * 24));
                }

                var days = daydiff(parseDate(startDate), parseDate(endDate));
                //console.log("days", days);

                var year = parseInt(startDate.substring(0, 4));
                var month = parseInt(startDate.substring(5, 7)) - 1;
                var startDay = parseInt(startDate.substring(8));
                var endDay = parseInt(endDate.substring(8));
                var startMonth = parseInt(startDate.substring(5, 7));
                var endMonth = parseInt(endDate.substring(5, 7));
                var dateSpan = false;

                if (startMonth != endMonth) {
                    dateSpan = true;
                }

                //console.log("startdate", startMonth);
                //console.log("enddate", endMonth);

                var monthStart = new Date(year, month, 1);
                var monthEnd = new Date(year, month + 1, 1);
                var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);

                if (startMonth < 10) {
                    startMonth = "0" + startMonth;
                }

                i = startDay;
                result = data.map(function(a) {
                    var key = a.key;
                    return key.substring(5);
                });

                //console.log("result", result);

                var tempData = [];
                if (dateSpan == false) {
                    while (i <= endDay) {
                        var obj = {};
                        if (result.includes(startMonth + "-" + i) || result.includes(startMonth + "-0" + i)) {
                            if (i < 10) {
                                obj["key"] = startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = startMonth + "-" + i;
                            }

                            var value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });

                            //console.log("value", value);
                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {
                            if (i < 10) {
                                obj["key"] = startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = startMonth + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }
                } else {
                    while (i <= monthLength) {
                        obj = {};
                        if (result.includes(startMonth + "-" + i) || result.includes(startMonth + "-0" + i)) {
                            if (i < 10) {
                                obj["key"] = startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = startMonth + "-" + i;
                            }

                            value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });

                            //console.log("value", value);
                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {
                            if (i < 10) {
                                obj["key"] = startMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = startMonth + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }
                    i = 1;

                    if (endMonth < 10) {
                        endMonth = "0" + endMonth;
                    }
                    while (i <= endDay) {
                        obj = {};
                        if (result.includes(endMonth + "-" + i) || result.includes(endMonth + "-0" + i)) {
                            if (i < 10) {
                                obj["key"] = endMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = endMonth + "-" + i;
                            }

                            value = data.filter(function(obj) {
                                var k = obj.key;
                                return parseInt(k.substring(8, 10)) == i;
                            });

                            obj["value"] = value[0].value;
                            tempData.push(obj);
                        } else {

                            if (i < 10) {
                                obj["key"] = endMonth + "-" + "0" + i;
                            } else {
                                obj["key"] = endMonth + "-" + i;
                            }

                            obj["value"] = 0;
                            tempData.push(obj);
                        }
                        i++;
                    }

                }

                //console.log("monthData", tempData);
                data = tempData;

                // format the data
                data.forEach(function(d) {
                    d.key = new Date(d.key);
                    d.value = +d.value;
                });

                // Scale the range of the data
                x.domain(data.map(function(d) {
                    return d.key;

                }));
                y.domain([0, d3.max(data, function(d) {
                    return d.value;
                })]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-1.0em")
                    .attr("dy", "-0.35em")
                    .attr("transform", function() {
                        return "rotate(-90)";
                    });

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "-4.41em")
                    .style("text-anchor", "end")
                    .text("No. of Conversations");

                svg.selectAll("bar")
                    .data(data)
                    .enter().append("rect")
                    .style("fill", "steelblue")
                    .attr("x", function(d) {
                        return x(d.key);
                    })
                    .attr("width", x.rangeBand())
                    .attr("height", 0)
                    .transition()
                    .duration(400)
                    .delay(function(d, i) {
                        return i * 10;
                    })
                    .attr("y", function(d) {
                        return y(d.value);
                    })
                    .attr("height", function(d) {
                        return height - y(d.value);
                    });
                $("#usageStats").show();

                if (days > 31) {
                    var quot = days / 30;
                    var ticks = d3.selectAll(".x text");
                    ticks.attr("class", function(d, i) {
                        if (i % quot != 0) d3.select(this).remove();
                    });
                }
            });
        }
    },

    "click #sync": function() {
        Meteor.call("getAnalyticalData", "run_ETL", function(err, result) {
            var res = JSON.parse(result.outputtext);
            //console.log("data", JSON.parse(result.outputtext));
            Session.set("lastUpdated", res[0].key);
            location.reload();
        });
    },

    "change #from": function(event) {
        //console.log("time", Session.get("time"));
        var elm = event.currentTarget.value;
        elm = elm.toString();

        var dateParts = elm.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        var startDate = dateParts[3] + "-" + dateParts[2] + "-" + dateParts[1];

        Session.set("startDate", startDate);

        var nextDate,
            tmpDate,
            endDate;

        if (Session.get("time") == "Daily") {
            var selectedDate = $("#from").val();
            //console.log("date", selectedDate);

            var dateSplit = selectedDate.split("/");

            nextDate = dateSplit[0] + "/" + dateSplit[1] + "/" + dateSplit[2];
            //console.log("selectedDate", selectedDate);
            //console.log("nextDate", nextDate);

            $("#to").datepicker({
                dateFormat: "dd/mm/yy",
                changeMonth: true
            });

            $("#to").datepicker("option", "minDate", selectedDate);
            $("#to").datepicker("option", "maxDate", nextDate);

        } else if (Session.get("time") == "Weekly") {

            selectedDate = $("#from").val();
            //console.log("Start date Weekly : ", selectedDate);

            dateSplit = selectedDate.split("/");

            var monthStart = new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]), 1);
            var monthEnd = new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]) + 1, 1);
            var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
            //console.log("noOfDays of this month :", monthLength);

            if ((parseInt(dateSplit[0]) + 6) <= monthLength) {
                nextDate = (parseInt(dateSplit[0]) + 6) + "/" + dateSplit[1] + "/" + dateSplit[2];
            } else {
                if ((parseInt(dateSplit[1]) + 1) <= 12) {
                    nextDate = (parseInt(dateSplit[0]) + 6 - monthLength) + "/" + (parseInt(dateSplit[1]) + 1) + "/" + dateSplit[2];
                } else {
                    nextDate = (parseInt(dateSplit[0]) + 6 - monthLength) + "/" + (parseInt(dateSplit[1]) + 1 - 12) + "/" + (parseInt(dateSplit[2]) + 1);
                }
            }

            //console.log("selectedDate Weekly : ", selectedDate);
            //console.log("nextDate Weekly  : ", nextDate);

            $("#to").datepicker({
                dateFormat: "dd/mm/yy",
                changeMonth: true
            });

            $("#to").datepicker("option", "minDate", selectedDate);
            $("#to").datepicker("option", "maxDate", nextDate);
            $("#to").val(nextDate);
            tmpDate = nextDate.split("/");
            endDate = tmpDate[2] + "-" + tmpDate[1] + "-" + tmpDate[0];

            Session.set("endDate", endDate);

        } else if (Session.get("time") == "Monthly") {
            var month, year, last_date_of_month;
            selectedDate = $("#from").val();
            //console.log("date", selectedDate);
            dateSplit = selectedDate.split("/");

            if ((parseInt(dateSplit[1]) + 1) <= 12) {

                if (parseInt(dateSplit[0]) == 1) {
                    month = parseInt(dateSplit[1]);
                    year = parseInt(dateSplit[2]);

                    last_date_of_month = new Date(year, month, 0).getDate();
                    nextDate = last_date_of_month + "/" + dateSplit[1] + "/" + dateSplit[2];

                } else {
                    nextDate = (parseInt(dateSplit[0]) - 1) + "/" + (parseInt(dateSplit[1]) + 1) + "/" + dateSplit[2];
                }
            } else {
                if (parseInt(dateSplit[0]) == 1) {
                    month = parseInt(dateSplit[1]);
                    year = parseInt(dateSplit[2]);

                    last_date_of_month = new Date(year, month, 0).getDate();
                    nextDate = last_date_of_month + "/" + dateSplit[1] + "/" + dateSplit[2];

                } else {
                    nextDate = dateSplit[0] + "/" + (parseInt(dateSplit[1]) + 1 - 12) + "/" + (parseInt(dateSplit[2]) + 1);
                }

            }

            //console.log("selectedDate Monthly ", selectedDate);
            //console.log("nextDate Monthly ", nextDate);

            $("#to").datepicker({
                dateFormat: "dd/mm/yy",
                changeMonth: true
            });

            $("#to").datepicker("option", "minDate", selectedDate);
            $("#to").datepicker("option", "maxDate", nextDate);
            $("#to").val(nextDate);

            tmpDate = nextDate.split("/");
            endDate = tmpDate[2] + "-" + tmpDate[1] + "-" + tmpDate[0];
            Session.set("endDate", endDate);
        }
        $("#to").removeAttr("disabled");

    },

    "mouseover #usageChart": function() {
        $("#from").datepicker("hide").blur();
        $("#to").datepicker("hide").blur();
    },

    "change #to": function(event) {
        var elm = event.currentTarget.value;
        elm = elm.toString();

        var dateParts = elm.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        var endDate = dateParts[3] + "-" + dateParts[2] + "-" + dateParts[1];

        //console.log("endDate", endDate);
        Session.set("endDate", endDate);

    },

    "click .gridster li": function() {
        if ($("#from").datepicker("widget").is(":visible")) {
            //console.log("opened");
        }
    },



    "change #filter_intent": function(event) {
        //console.log("hi", event.currentTarget.value);
        var intent_filter = event.currentTarget.value;
        Session.set("intent_filter", intent_filter);

        $("#analyticalTable tr").removeClass("state-open");
        $("#analyticalTable tr.t_details").hide(600);

        var count = Session.get("top_trans_count");

        var action_filter = Session.get("action_filter");
        //console.log("intent_filter Value : ", intent_filter);
        //console.log("action_filter Value : ", action_filter);

        //console.log("top_trans_count : ", Session.get("top_trans_count"));

        Meteor.call("getTableData", intent_filter, action_filter, count, function(err, result) {
            var data = JSON.parse(result.outputtext);
            //console.log("table data", data);
            Session.set("tableData", data);
        });
    },

    "change #filter_action": function(event) {
        //console.log("hi", event.currentTarget.value);
        var action_filter = event.currentTarget.value;
        Session.set("action_filter", action_filter);

        $("#analyticalTable tr").removeClass("state-open");
        $("#analyticalTable tr.t_details").hide(600);

        var count = Session.get("top_trans_count");
        var intent_filter = Session.get("intent_filter");

        //console.log("intent_filter Value : ", intent_filter);
        //console.log("action_filter Value : ", action_filter);
        //console.log("top_trans_count : ", Session.get("top_trans_count"));

        Meteor.call("getTableData", intent_filter, action_filter, count, function(err, result) {
            var data = JSON.parse(result.outputtext);
            //console.log("table data", data);
            Session.set("tableData", data);
        });
    },
});