// usuarios Hardcodeados para pruebas.
// Puede cambiarse para almacenar datos de usuarios en una base de datos.
var users = [
    { id: 1, name: "jim", email: "jim@mail.com", password: "jim123" },
    { id: 2, name: "sam", email: "sam@mail.com", password: "sam123" }
];


var checkCredentials = function (username, password) {
    // Check if username/password are good
    var user = users.find(function (u) {
        return u.name === username && u.password === password;
    });

    return user
}

exports.checkCredentials = checkCredentials;