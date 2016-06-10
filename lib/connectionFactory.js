var _ = require("underscore")
var sql = require("mssql")

module.exports = {
    connect: connect
}

function connect(connectionString) {
    if (!connectionString) connectionString = arguments[0]
    if (!connectionString) throw new Error("connectionString is required")
    
    return sql.connect(connectionString)
}