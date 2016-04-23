module.exports = {
    insert: insert,
    query: runQuery
}

var _ = require("underscore")
var Promise = require("bluebird")
var sql = require("mssql")

function insert(connection, table, data) { 
    if (!table) throw new Error("Parameter 'table' is required") 
    if (!data) throw new Error("Parameter 'data' is required") 
        
    return Promise.each(data, insertRow)
        
    function insertRow(row) {
               
        var columns = []
        var values = []
        var params = {}
        _.keys(row).forEach(function(key, i) {
            columns.push("[" + key + "]")
            var token = "val_" + i
            values.push("@" + token)
            params[token] = row[key]
        })
        
        return runQuery(connection, "INSERT INTO " + table + " (" + 
            columns.join(", ") +
            ") VALUES (" + 
            values.join(", ") +
            ")", params)      
    }
}

function runQuery(connection, sqlStatement, params) {
    if (!sqlStatement) throw new Error("Parameter 'sql' is required") 
    
    var request = new sql.Request(connection)
    
    if (params) {
        _.mapObject(params, function (val, key) {
            addInputParameterToRequest(request, key, val)
        })
    }
    
    return request.query(sqlStatement)
}

function addInputParameterToRequest(request, name, value) {
    //mssql library doesn't detect floating point
    if (value && value.constructor === Number &&
        value.toString().indexOf(".") > -1) {
        request.input(name, sql.Float, value)
    }
    else {
        request.input(name, value)
    }
}