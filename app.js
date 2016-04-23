var connectionFactory = require("./lib/connectionFactory")
var sqlClient = require("./lib/sqlClient")

module.exports = pumlhorse.module("mssql")
    .function("connect", ["connectionString", connectionFactory.connect])
    .function("insert", ["connection", "table", "data", sqlClient.insert])
    .function("query", ["connection", "sql", "parameters", sqlClient.query])
    .asExport()