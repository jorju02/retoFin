//Funcion de inicio
function inicio() {
    var token = localStorage.getItem("token");
    if (token == null) {
        $(".modal").css("display", "block");
        hidechart();
    } else {
        $(".modal").css("display", "none");
        var misNombres = JSON.parse(localStorage.getItem("nombreEmpresa"));
        misNombres.forEach((element) => {
            $("#" + element).appendTo("#selected");
        });
        misEmpresas();
        hidechart();
    }
}

//Drag and drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function safe(empresa) {
    var nombre = empresa;
    $(document).ready(function () {
        $("img").css("pointer-events", "none");
        $("#" + nombre).css("pointer-events", "all");
    });
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    $(document).ready(function () {
        $("img").css("pointer-events", "all");
    });
}

//Funcion para ocultar todas las empreass
function ocultarTabla() {
    $("#main").css("display", "none");
    $("#lupa").css("display", "block");
    $("#cartas").css("display", "flex");
}

//Funcion de mostrar la tabla con las empresas a seleccionar
function mostrarTabla() {
    $("#main").css("display", "block");
    $("#lupa").css("display", "none");
    $("#cartas").css("display", "none");
}

//Funcion para añadir las empresas seleccionadas al localStorage
function misEmpresas() {
    var sEmpresas = document.getElementById("select").getElementsByTagName("img");
    var nombreEmpresa = [];
    for (var i = 0; i < sEmpresas.length; i++) {
        nombreEmpresa.push(sEmpresas[i].id);
    }
    //Crear el localStorage con las empresas seleccionadas y crear las cartas necesarias
    localStorage.setItem("nombreEmpresa", JSON.stringify(nombreEmpresa));
    cartas();
}


//Funcion de crear las cartas con el fetch de la base de datos del docker
function cartas() {
    var lastValue;
    $(".card").remove();
    var misNombres = JSON.parse(localStorage.getItem("nombreEmpresa"));

    // Fetch para conseguir el ultimo dato de la base de datos
    var getOptions = {
        method: "POST",
        redirect: "follow",
    };

    //Parte estatica de la carta:
    fetch("//10.10.17.220:80/api/last", getOptions)
        .then((response) => response.json())
        .then((result) => {
            // Comparar cada nombre de las empresas con los nombres del localStorage
            result.data.forEach(function (element) {
                misNombres.forEach(function (nombre) {
                    //En caso de que coincida el nombre se imprimira su imagen, nombre y valor
                    if (element.nombre === nombre) {
                        lastValue = element.valor;
                        var cartahtml = `<div class="card">
                              <img src=img/${element.nombre}.png id="c${element.nombre}" alt="${element.nombre}" class="card-img-top"><br>
                                <div id="price${element.nombre}" class="infotarj"> 
                                <h5>${element.valor}€</h5>
                                </div>
                                <button type="button" onclick="showchart('${element.nombre}')"class="btn btn-info btn-block btn-round" width="30px" >Mostrar</button>
                            </div>`;
                        var card = $(cartahtml);
                        $("[name~='info']").css("margin-left", "10px");
                        $(".card-columns").append(card);
                    }
                });
            });
        })
        .catch((error) => {
            console.log("error", error);
        });
    setInterval(() => {
        var getOptions = {
            method: "POST",
            redirect: "follow",
        };

        fetch("//10.10.17.220:80/api/last", getOptions)
            .then((response) => response.json())
            .then((result) => {
                result.data.forEach(function (element) {
                    misNombres.forEach(function (nombre) {
                        if (element.nombre === nombre) {
                            if (lastValue > element.valor) {
                                document.getElementById("price" + element.nombre).innerHTML =
                                    "<h5 style='color: blue;'>" + element.valor + "€</h5>";
                                setTimeout(function () {
                                    document.getElementById("price" + element.nombre).innerHTML =
                                        "<h5>" + element.valor + "€</h5>";
                                }, 3000);
                            } else if (lastValue < element.valor) {
                                document.getElementById("price" + element.nombre).innerHTML =
                                    "<h5 style='color: green;'>" + element.valor + "€</h5>";
                                setTimeout(function () {
                                    document.getElementById("price" + element.nombre).innerHTML =
                                        "<h5>" + element.valor + "€</h5>";
                                }, 3000);
                            }
                            lastValue = element.valor;
                        }
                    });
                });
            })
            .catch((error) => {
                console.log("error", error);
            });
    }, 60 * 1000);
}

//Funcion para realizar el registro mediante el middleware de la api de laravel
function registercheck() {
    const nombre = document.getElementById("name2").value;
    const email = document.getElementById("email2").value;
    const password = document.getElementById("password2").value;
    var formdata = new FormData();
    formdata.append("name", nombre);
    formdata.append("email", email);
    formdata.append("password", password);
    var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
    };

    fetch("//10.10.17.220:80/api/register", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            //console.log(result);
            const texto = document.getElementById("message2");
            texto.innerHTML =
                "<p style='color: green;'>Registro Correcto. Redirigiendo a logueo</p>";
            setTimeout(function () {
                mostrarLogin();
                document.getElementById("name2").value = "";
                document.getElementById("email2").value = "";
                document.getElementById("password2").value = "";
            }, 2000);
        })
        .catch((error) => {
            console.log("error", error);
            const texto = document.getElementById("message2");
            texto.innerHTML = "<p style='color: blue;'>Registro incorrecto</p>";
            document.getElementById("passwordr").value = "";
        });
}

//Funcion para comprobar los datos del login y crear un token para usar cada persona a traves del middleware de laravel.
function logincheck() {
    localStorage.removeItem("token");
    const email = document.getElementById("email1").value;
    const password = document.getElementById("password1").value;
    var formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);

    var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
    };

    fetch("//10.10.17.220:80/api/login", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            //console.log(result);
            localStorage.setItem("token", result["authorisation"]["token"]);
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
            const texto = document.getElementById("message1");
            texto.innerHTML =
                "<p style='color: green;'>Inicio de sesion correcto, entrando...</p>";
            setTimeout(function () {
                document.getElementById("email1").value = "";
                document.getElementById("password1").value = "";
                texto.innerHTML = "";
                $(".modal").css("display", "none");
            }, 2000);
        })
        .catch((error) => {
            console.log("error", error);
            const texto = document.getElementById("message1");
            texto.innerHTML =
                "<p style='color: blue;'>Email o password incorrectos</p>";
            document.getElementById("password1").value = "";
        });
}

//Funcion para realizar el logout.
function logoutCheck() {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    var formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
    };

    fetch("//10.10.17.220:80/api/logout", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            //console.log(result);
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            localStorage.removeItem("nombreEmpresa");
            location.reload();
        })
        .catch((error) => console.log("error", error));
}

//Modal

//Declaracion de variables
var modal = document.getElementById("myModal");

//Funcion para mostrar el formulario de registro
function mostrarRegistro() {
    $("#registerForm").css("display", "block");
    $("#tituloRegistro").css("display", "block");
    $("#loginForm").css("display", "none");
    $("#tituloLogin").css("display", "none");
}
//Funcion para mostrar el formulario de login
function mostrarLogin() {
    $("#registerForm").css("display", "none");
    $("#tituloRegistro").css("display", "none");
    $("#loginForm").css("display", "block");
    $("#tituloLogin").css("display", "block");
}

//Funcion para generar el grafico

let valores = [];
var chartEmpresa;

function anual() {
    valores = [];
    var requestOptions = {
        method: "POST",
        redirect: "follow",
    };

    fetch("//10.10.17.220:80/api/stockAno", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            //console.log(result);
            result.data.forEach(function (element) {
                if (element.nombre === chartEmpresa) {
                    //console.log(element);
                    valores.push(element.media_valor);
                }
                Highcharts.chart("tablaResult", {
                    yAxis: {
                        title: {
                            text: "Valor",
                        },
                    },
                    xAxis: {
                        categories: [
                            "Enero",
                            "Febrero",
                            "Marzo",
                            "Abril",
                            "Mayo",
                            "Junio",
                            "Julio",
                            "Agosto",
                            "Septiembre",
                            "Octubre",
                            "Noviembre",
                            "Diciembre",
                        ],
                        title: {
                            text: "Meses",
                        },
                    },

                    legend: {
                        layout: "vertical",
                        align: "right",
                        verticalAlign: "middle",
                    },

                    plotOptions: {
                        series: {
                            label: {
                                connectorAllowed: false,
                            },
                        },
                    },

                    series: [
                        {
                            name: chartEmpresa,
                            data: valores,
                        },
                    ],

                    responsive: {
                        rules: [
                            {
                                condition: {
                                    maxWidth: 500,
                                },
                                chartOptions: {
                                    legend: {
                                        layout: "horizontal",
                                        align: "center",
                                        verticalAlign: "bottom",
                                    },
                                },
                            },
                        ],
                    },
                });
            });
        })
        .catch((error) => console.log("error", error));
    //console.log(valores);
}





function showchart(empresaSelect) {
    document.getElementsByClassName("chartModal")[0].style.display = "block";
    //console.log(empresaSelect);
    chartEmpresa = empresaSelect;
    anual();
}

function hidechart() {
    document.getElementsByClassName("chartModal")[0].style.display = "none";
    document.getElementById("tablaResult").innerHTML = "";
}

