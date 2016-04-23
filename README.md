# pumlhorse-mssql
Provides Microsoft SQL functions for [Pumlhorse](https://www.github.com/mdickin/pumlhorse) scripts

Wraps [node-mssql](https://github.com/patriksimek/node-mssql) package

## Installing npm module
`npm install node-mssql`

## Referencing module
See [Pumlhorse documentation](https://www.github.com/mdickin/pumlhorse)

## Connecting to a database
The `connect` function takes a connection string. See [node-mssql](https://github.com/patriksimek/node-mssql) documentation
for connection string details.

```yaml
steps:
  - connect: "Server=(local);Database=MyDatabase;User ID=my_username;Password=my_password"
```

It's likely that you would want to store this connection string in a context file and reference the
variable instead.

## Inserting data

The following code inserts three records into the myFavoriteMovies table.

```yaml
steps:
  - connect: $sqlConnectionString
  - insert:
      table: myFavoriteMovies
      data:
        - name: Shawshank Redemption
          stars: 4.5
          notes: Excellent cinematography
          reviewer: $username
          reviewDate: ${new Date()}
        - name: The Matrix
          stars: 4.5
          notes: Groundbreaking
          reviewer: $username
          reviewDate: ${new Date()}
        - name: Hot Rod
          stars: 5
          notes: Just plain perfect
          reviewer: $username
          reviewDate: ${new Date()}
```

## Retrieving data
Assuming that the data above has been inserted, we can retrieve it like so

```yaml
steps:
  - connect: $sqlConnectionString
  - movies = query:
      parameters:
        stars: 4
      sql: >
             SELECT Name, Stars, Notes, ID
             FROM FavoriteMovies
             WHERE Stars >= @stars
             ORDER BY Stars, Name DESC
  - for:
      each: row
      in: $movies
      steps:
        - log: 
            - %s (%s stars) - %s
            - $row.Name
            - $row.Stars
            - $row.Notes
```

The code above outputs the following lines:
- `Hot Rod (5 stars) - Just plain perfect`
- `Shawshank Redemption (4.5 stars) - Excellent cinematography`
- `The Matrix (4.5 stars) - Groundbreaking`

If you don't want to use the `for` function, you can reference the result as an array: 
```yaml
  - log: $movies[0].Name # logs "Hot Rod"
```

## Other queries
The `query` function accepts more SQL statements than just `SELECT`. All commands
should be accepted, with the exception of `CREATE PROCEDURE` and queries with temp tables.
See [node-mssql query documentation](http://patriksimek.github.io/node-mssql/#query) for more
info 

## Multiple connections
If your script needs multiple connections, you can explicity pass the connection to the functions

```yaml
steps:
  - conn1 = connect: $sqlConnection1String
  - conn2 = connect: $sqlConnection2String
  - insert:
      connection: $conn1
      table: table1
      data:
        - #table1 data
  - insert:
      connection: $conn2
      table: table2
      data:
        - #table2 data
  - movies = query:
      connection: $conn1
      parameters:
        #parameters
      sql: #SQL query
```