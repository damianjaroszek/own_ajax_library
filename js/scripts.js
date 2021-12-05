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

function AJAX(config) { // jeżeli zostanie utworzona instancja obiektu bez użycia "new"

    if( !(this instanceof AJAX ) ) {  // dodaj "new" za użytkownika, zostaje przekazany config jako parametr funkcji
        return new AJAX(config); 
    }

    this._xhr = new XMLHttpRequest(); //uruchom zapytanie
    this._config = this._extendOptions(config); //przekaż config do _extendOptions, która jest utworzona na prototypie

    //console.log(this._config); // weryfikacja co zwraca defaultConfig po operacjach nadpisania

    this._assignEvents(); //przypisz zdarzenie

 

    this._beforeSend(); //otworzenie, przypianie nagłówków użytkownika, wysyłka danych

}

AJAX.prototype._extendOptions = function(config) {

    var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig)); //zamiana obiektu na string, następnie ponownie zamiana string na obiekt 
    //(możliwe tylko w przypadku gdy w config nie ma funkcji, bo tych się nie da serializować)
    //dzięki temu mamy nowy obiekt, już nie podmieniamy wartości na prototypie
    //stąd odwołujemy się do defaultConfig a nie _defaultConfig z prototypu
    //serializacja nie przekazuje funkcji, usuwa ją!!!

    for(var key in defaultConfig) {  // iteruj po domyślnej konfiguracji odwołując się do klucza (type:, url: ... itd)

        if(key in config) {  // jeżeli klucz znajdzie się w config to wtedy continue, przykladowo jeżeli Type znajduje się w config to znaczy, że go przekazaliśmy
            // i nic nie musimy z tym robić i przechodzimy do kolejnej iteracji
            continue;
        }
    
            config[key] = defaultConfig[key]; //jeżeli w type nie podaliśmy ani post ani get to zostanie zaczytany type z default config czyli GET

            //zrobilismy serializację _defaultConfig a ta nie zawierała żadnych funkcji więc jest ok, funkcje zostały przekazane przez obiekt przekazany przez użytkownika
            //czyli mamy zserializowany config bez funkcji success ale robimy dodanie tej funkcji poprzez dołączenie jej z danych wysłanych przez użytkownika
    
    }
    

     /*

      for(var "type:" in defaultConfig){
        if("type:" in config){         
            defaultConfig["type:"] = config["type:"]; // więc jak mielismy w defaultConfig[type:"GET"]=config[type:"POST"] wiec przy użyciu samego klucza nadpisujemy też wartość
                                                                  wtedy w  w defaultConfig[type:"POST"]
        }
    }

    */

    //console.log(config);
    return config; // funkcja zwraca defaultConfig po nadpisaniach a to wszystko znajduje się w this._config bo parę linijek 
    //wyżej mamy this._config = this._extendOptions(config);

};

AJAX.prototype._assignEvents = function() { //przypisanie zdarzenia

    this._xhr.addEventListener("readystatechange", this._handleResponse.bind(this), false); //gdy "radystatechange" wykonaj _handleResponse, bind jest konieczne 
    //ponieważ w np w _handleError nie moglibyśmy się odwołać do this._xhr 
    // this._handleResponse kierowałby na _xhr 
    /*
function AJAX(config){         
if( !(this instanceof AJAX)){  
return new AJAX(config);
}

this._xhr = new XMLHttpRequest();  // <---------------------------- tutaj kierowałby this._handleResponse a my chcemy żeby this kierował do AJAX.prototype._handleResponse = function(e){}; stąd użycie BIND -> this._handleResponse.bind(this)
this._config = this._extendOptions(config); 

//console.log(this._config);

this._assignEvents(); 
}
    */
    this._xhr.addEventListener("abort", this._handleError.bind(this), false);
    this._xhr.addEventListener("error", this._handleError.bind(this), false);
    this._xhr.addEventListener("timeout", this._handleError.bind(this), false);

};

AJAX.prototype._assignUserHeaders = function() { //funkcja przypisująca nagłówki podane przez użytkownika w config
    //console.log((Object.keys(this._config.headers))); //Object.keys jeżeli w parametrze podamy mu jakiś obiekt(_config) i odwołamy się do pola (headers) zwróci nam tablicę
                                                      // ['X-My-Header'] a tablica posiada funkcję length więc jeżeli length będzie różne od 0:

    if(Object.keys(this._config.headers).length) {

        for(var key in this._config.headers) { //przeiteruj _config.headers
            this._xhr.setRequestHeader(key, this._config.headers[key]); //ustaw nagłówek przypisując do niego wartość z _config.headers
        }

    }

};

AJAX.prototype._open = function() {

    this._xhr.open( //otwieramy połączenie
        this._config.type, //"POST"
        this._config.url, // "odbierz.php"
        this._config.options.async, //"true"
        this._config.options.username, //"null"
        this._config.options.password // "null"
    );
    this._xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); //nagłówek dzięki któremy zostanie nam odesłany json (zależne też od PHP)
    this._xhr.timeout = this._config.options.timeout; //timeout ustawiamy bezpośrednio na obiekcie xhr

};


//metoda sprawdzająca czy w data przekazano żądanie POST czy GET

AJAX.prototype._beforeSend = function(){

    var isData = Object.keys(this._config.data).length>0,  /* sprawdzamy czy 
    data: {
        firstName: "Piotr",
        lastName: "Kowalski"
    }, jeżeli >0 to zwróci tablicę*/
        data = null;

    if(this._config.type.toUpperCase() === "POST" && isData){ //uppercase po to gdyby ktoś podał post z małych liter isData jeżeli null to nie serialuzuj
        data = this._serializeFormData(this._config.data)

    }else if(this._config.type.toUpperCase() === "GET" && isData){
        
        this._config.url += "?" + this._serializeData(this._config.data); // dodanie znaku ? w adresie --> odbierz.php?firstName=Piotr&lastName=Kowalski%20Nowak
        // i nadpisanie pola url w config wartością firstName=Piotr&lastName=Kowalski%20Nowak, bo metoda GET przekazuje parametry w adresie URL
        

    }   

    console.log(this._config.url);

    this._open(); //otwórz rządanie AJAX
    this._assignUserHeaders(); //przypisz nagłówki jeżeli te poda user w config
    this._send(data); //wysyłka AJAX

};


AJAX.prototype._send = function(data) { //funkcja wykona się gdy serwer odpowie

    this._xhr.send();

};

AJAX.prototype._handleResponse = function(e) { //funkcja wykona się gdy serwer odpowie

    if(this._xhr.readyState === 4 && this._xhr.status >= 200 && this._xhr.status < 400) { //this kieruje bezpośrednio na obiekt a nie na konstruktor?
        console.log("Otrzymano odpowiedź");

        if(typeof this._config.success ==="function"){ //sprawdzamy czy w obiekcie ajax w success mamy do czynienia z funkcją
            this._config.success(this._xhr.response, this._xhr); //jeżeli jest to typ function to wywołaj funkcje
            /*  success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
        }  */
        }
    } else if(this._xhr.readyState === 4 && this._xhr.status >= 404){ //jeżeli wystąpi bład 404 wykonaj handleError
        this._handleError(); 
    }


};




AJAX.prototype._handleError = function(e) { 

  
        if(typeof this._config.failure ==="function"){ //sprawdzamy czy w obiekcie ajax w success mamy do czynienia z funkcją
            this._config.failure(this._xhr); //jeżeli jest to typ function to wywołaj funkcje
            /*  success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
        }  */
        }
    

};

// jeżeli w obiekcie mamy type get musimy podać dane w adresie url
AJAX.prototype._serializeData = function(data){

    var serialized = "";

    for(var key in data){ //firstName="Piotr"
                          //lastName="Kowalski" ==> jest += więc firstName=Piotr&lastName=Kowalski&
        serialized += key+"=" + encodeURIComponent(data[key]) + "&"; //encodeURIComponent gdy w adrsie pojawi się niedopuszczalny znak jakim jest spacja zostanie zamieniony np na %20
        // firstName=Piotr&lastName=Kowalski Nowak --> firstName=Piotr&lastName=Kowalski%20Nowak
    }

    return serialized.slice(0, serialized.length-1); // pozbycie się ostatniego znaku w adresie czyli & firstName=Piotr&lastName=Kowalski& --> firstName=Piotr&lastName=Kowalski
    
};


AJAX.prototype._serializeFormData = function(data){
    var serialized = new FormData();

    for(var key in data){
        serialized.append(key, data[key]);
    }

    return serialized;
};

// każde kolejne wywołanie obiektu AJAX z nową konfiguracją będzie nadpisywało bieżącą konfigurację, wiec jak domyslnie było GET, to po nadpisaniu gdzie był
// w config type: "POST" okaże, się że domyślnie chcemy POST a nie jak wcześniej zakładaliśmy GET
// to temu zaradzi var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig))

AJAX.prototype._defaultConfig = { // jeżeli w config nie będziemy mieli podengo przez użytkownika jakiegoś pola, to podstawimy pole zdefiniowane domyślnie
    type: "GET",
    url: window.location.href,
    data: {},
    options: {
        async: true,
        timeout: 0, //--------->> jeżeli ktoś będzie chciał nadpisać domyślne opcje - przykładowo timeout podaje to tutaj [patrz komentarz options]
        username: null,
        password: null
    },
    headers: {}
 };

AJAX({ // zapisanie var a oznacza, że _xhr jest pod tym zapisane, gdyby nie było ubrane to w zmienną kod by się wykonał i zniknął
    type: "GET",
    url: "odbierz.php",
    data: {
        firstName: "Piotr",
        lastName: "Kowalski Nowak"
    },

        // options:{
    //     timeout: 10 //--------->> jeżeli ktoś będzie chciał nadpisać domyślne opcje - przykładowo timeout podaje to tutaj
    // },
    
    headers: {
        "X-My-Header": "123#asdf"
    },
    success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
        console.log(response);
    },
    failure: function(xhr) {
        console.log("Wystąpił błąd. Status: " + xhr.status);
    }
});