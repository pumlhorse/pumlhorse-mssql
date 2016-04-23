var Promise = require("bluebird")
var helpers = require("../helpers/promiseHelpers")

describe("SqlClient", function () {
    var proxyquire = require("proxyquire")
    
    var _sqlClient
    var requestMock = {
        query: function () {},
        input: function () {}
    }
    var sqlMock = {
        Request: function () {return requestMock },
        Float: "FLOAT_VALUE"
    }
    beforeEach(function () {
        _sqlClient = proxyquire("../lib/sqlClient", {
            "mssql": sqlMock,
            "@noCallThru": true
        })
    })
    
    describe("insert", function () {
        it("throws an error if table is null", function () {
            //Arrange
            
            //Act
            try {
                _sqlClient.insert();
                fail()
            }
            catch (e) {
                //Assert
                expect(e.message).toBe("Parameter 'table' is required")
            }
        });
        
        it("throws an error if data is null", function () {
            //Arrange
            
            //Act
            try {
                _sqlClient.insert(null, "table");
                fail()
            }
            catch (e) {
                //Assert
                expect(e.message).toBe("Parameter 'data' is required")
            }
        });
        
        it("issues a query for table with multiple rows", function (done) {
            //Arrange
            spyOn(requestMock, "query").and.returnValue(Promise.resolve({}))
            var date = new Date()
            var data = [
                {
                    col1: "col 1 value",
                    secondColumn: 33
                },
                {
                    col3: "col 3 value",
                    fourthColumn: date
                }
            ]
            
            //Act
            var promise = _sqlClient.insert(null, "tableName", data)
            
            //Assert
            promise.then(function () {
                expect(requestMock.input).toHaveBeenCalledWith("val_0", "col 1 value")
                expect(requestMock.input).toHaveBeenCalledWith("val_1", 33)
                expect(requestMock.query).toHaveBeenCalledWith(
                    "INSERT INTO tableName ([col1], [secondColumn]) VALUES (@val_0, @val_1)")
                expect(requestMock.input).toHaveBeenCalledWith("val_0", "col 3 value")
                expect(requestMock.input).toHaveBeenCalledWith("val_1", date)
                expect(requestMock.query).toHaveBeenCalledWith(
                    "INSERT INTO tableName ([col3], [fourthColumn]) VALUES (@val_0, @val_1)")
            })
            .finally(helpers.assertPromiseResolved(promise, done))
            
        });
        
        it("properly handles floating points", function (done) {
            //Arrange
            spyOn(requestMock, "input")
            spyOn(requestMock, "query").and.returnValue(Promise.resolve({}))
            var date = new Date()
            var data = [
                {
                    floatVal: 33.98
                }
            ]
            
            //Act
            var promise = _sqlClient.insert(null, "tableName", data)
            
            //Assert
            promise.then(function () {
                expect(requestMock.input).toHaveBeenCalledWith("val_0", sqlMock.Float, 33.98)
                expect(requestMock.query).toHaveBeenCalledWith(
                    "INSERT INTO tableName ([floatVal]) VALUES (@val_0)")
            })
            .finally(helpers.assertPromiseResolved(promise, done))
        });
    })
    
    describe("query", function () {
        it("throws an error if sql is null", function () {
            //Arrange
            
            //Act
            try {
                _sqlClient.query();
                fail()
            }
            catch (e) {
                //Assert
                expect(e.message).toBe("Parameter 'sql' is required")
            }
        });
        
        it("returns an empty recordset", function (done) {
            //Arrange
            spyOn(requestMock, "query").and.returnValue(Promise.resolve([]))
            
            //Act
            var promise = _sqlClient.query(null, "some select")
            
            //Assert
            promise.then(function (result) {
                expect(result.length).toBe(0)
                expect(requestMock.query).toHaveBeenCalledWith("some select")
            })
            .finally(helpers.assertPromiseResolved(promise, done))
            
        });
        
        it("returns records", function (done) {
            //Arrange
            spyOn(requestMock, "input")
            var data = [
                {
                    col1: "col1 value",
                    col2: 33
                },
                {
                    col1: "col1 value2",
                    col2: 333
                }
            ]
            spyOn(requestMock, "query").and.returnValue(Promise.resolve(data))
            
            //Act
            var promise = _sqlClient.query(null, "some select")
            
            //Assert
            promise.then(function (result) {
                expect(result.length).toBe(2)
                expect(result[0].col1).toBe("col1 value")
                expect(result[0].col2).toBe(33)
                expect(result[1].col1).toBe("col1 value2")
                expect(result[1].col2).toBe(333)
                expect(requestMock.query).toHaveBeenCalledWith("some select")
                expect(requestMock.input).not.toHaveBeenCalled()
            })
            .finally(helpers.assertPromiseResolved(promise, done))
        });
        
        it("allows inputting parameters", function (done) {
            //Arrange
            spyOn(requestMock, "input")
            spyOn(requestMock, "query").and.returnValue(Promise.resolve([]))
            
            //Act
            var promise = _sqlClient.query(null, "parameterized select", {
                param1: "a value",
                parameter2: true
            })
            
            //Assert
            promise.then(function () {
                expect(requestMock.input).toHaveBeenCalledWith("param1", "a value")
                expect(requestMock.input).toHaveBeenCalledWith("parameter2", true)
                expect(requestMock.query).toHaveBeenCalledWith("parameterized select")
            })
            .finally(helpers.assertPromiseResolved(promise, done))
        });
        
        it("properly handles float parameters", function (done) {
            //Arrange
            spyOn(requestMock, "input")
            spyOn(requestMock, "query").and.returnValue(Promise.resolve([]))
            
            //Act
            var promise = _sqlClient.query(null, "parameterized select", {
                floatParam: 12.34
            })
            
            //Assert
            promise.then(function () {
                expect(requestMock.input).toHaveBeenCalledWith("floatParam", sqlMock.Float, 12.34)
                expect(requestMock.query).toHaveBeenCalledWith("parameterized select")
            })
            .finally(helpers.assertPromiseResolved(promise, done))
        });
    })
})