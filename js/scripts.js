/*

AJAX({
    type: "POST",
    url: "odbierz.php",
    data: {
        firstName: "Piotr",
        lastName: "Kowalski"
    },
    headers: {
        "X-My-Header": "123#asdf"
    },
    success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
    },
    failure: function(xhr) {
        console.log("Wystąpił błąd. Status: " + xhr.status);
    }
});

 */