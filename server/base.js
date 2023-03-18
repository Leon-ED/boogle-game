const mysql = require('mysql');

getBase = function() {
    const base = mysql.createConnection(
        {
            host: "localhost",
            user: "root",
            password: "root",
            database: "boogle"


        }
    );
    if (base) {
        console.log("Database connection successful!");
    } else {
        console.log("Database connection failed!");
    }
    return base;



}

module.exports = {
    getBase
}
