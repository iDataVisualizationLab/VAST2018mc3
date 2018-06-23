var data = null;
$("#page").css("visibility","hidden");
function readData(fileName) {
    d3.csv(fileName, function (error, rawData) {
        if (error) throw error;
        debugger;

    });
}
