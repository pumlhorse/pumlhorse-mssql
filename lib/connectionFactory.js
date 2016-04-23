var _ = require("underscore")
var sql = require("mssql")

module.exports = {
    connect: connect
}

function getConnection(server, port, username, password, database, options) {
    if (!server) throw new Error("server is required")
    
    var allOptions = _.extend({ port: port, database: database}, options)
    
    var config = {
        server: server,
        userName: username,
        password: password,
        options: allOptions
    }
    
    var connection = new Connection(config)
}

function connect(connectionString) {
    if (!connectionString) connectionString = arguments[0]
    if (!connectionString) throw new Error("connectionString is required")
    
    return sql.connect(connectionString)
}