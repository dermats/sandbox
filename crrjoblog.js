function exportToCsv(filename, rows) {
	var processRow = function (row) {
		var finalVal = '';
		for (var j = 0; j < row.length; j++) {
			var innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
			if (row[j] instanceof Date) {
				innerValue = row[j].toLocaleString();
			};
			var result = innerValue.replace(/"/g, '""');
			if (result.search(/("|;|\n)/g) >= 0)
				result = '"' + result + '"';
			if (j > 0)
				finalVal += ';';
			finalVal += result;
		}
		return finalVal + '\n';
	};
	var csvFile = '';
	for (var i = 0; i < rows.length; i++) {
		csvFile += processRow(rows[i]);
	}
	var blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
	var link = document.createElement("a");
	if (link.download !== undefined) { // feature detection
		var url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

var tableId = document.querySelectorAll("[id^=__table]")[0].id;
var oTable =  sap.ui.getCore().byId(tableId);
var data = oTable.getData();
var details = []
var detailsCsv = [['Id', 'Status', 'SO', 'SoItems', 'ItemCount', 'ExecTime', 'LastUpdate', 'TimeInQueue', 'failedStep']];
for (var i in data.data) {
     var runUid = data.data[i].runUid; 
     document.title = 'Get ' + runUid;
     jQuery.ajax({async:false, url: '/api/control/v1/runmonitor/jobs/' + runUid + '/detail', success: function(result) {
         var logRef = result.runLogResponse[0].contentRef || false;
         if (logRef) {
             jQuery.ajax({async:false, url: '/api/control/v1/runmonitor/resources/' + logRef, success: function(result2) {
                  result.runLogResponse[0].content = result2;
             }});
         }    
		 details.push(result);
         detailsCsv.push([
			runUid, 
			result.jobRunResponse.runStatus, 
			result.runLogResponse[0].content.Input.SONo,
			"'" + result.runLogResponse[0].content.SO_Data.Items_Updated.map(x => x.SalesOrderItem).join(","),
			result.runLogResponse[0].content.SO_Data.Line_Item_Count,
			Math.ceil(result.jobRunResponse.executionTime / 1000),
			result.jobRunResponse.lastUpdated,
			result.runStatusResponse.length > 2 ? Math.ceil((Date.parse(result.runStatusResponse[1].updated) - Date.parse(result.runStatusResponse[0].updated)) / 1000) : 'n/a',
			result.jobRunResponse.runStatus == 'failed' ? result.runStatusResponse[2].detail : ''
		 ]);    
     }});
     document.title='Done';
	 console.log(details);
}
exportToCsv(details[0].jobRunResponse.lastUpdated.substr(0,10) + '.csv', detailsCsv);