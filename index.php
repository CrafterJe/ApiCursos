<?php

if (trim($_SERVER["REQUEST_URI"], "/") === "api-rest" || trim($_SERVER["REQUEST_URI"], "/") === "") {
    header("Location: frontend/login.html");
    exit();
}

// Manejo de excepciones y errores
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode(["status" => 500, "detalle" => "Error del servidor: " . $e->getMessage()]);
    exit();
});

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "status" => 500,
        "detalle" => "Error en $errfile línea $errline: $errstr"
    ]);
    exit();
});

// Cargar controladores necesarios
require_once "controladores/clientes.controlador.php";
require_once "controladores/cursos.controlador.php";
require_once "controladores/carrito.controlador.php";
require_once "controladores/compras.controlador.php";

// Redirigir el enrutamiento a rutas.php
require_once "rutas/rutas.php";
