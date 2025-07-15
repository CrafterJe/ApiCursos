<?php

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$scriptName = $_SERVER["SCRIPT_NAME"];
$baseDirectory = dirname($scriptName);
$ruta = ($baseDirectory === DIRECTORY_SEPARATOR) ? trim($uri, "/") : trim(str_replace($baseDirectory, "", $uri), "/");

$arrayRutas = explode("/", $ruta);
$metodo = $_SERVER["REQUEST_METHOD"];

// =============================
// Rutas de Cursos
// =============================

if (count($arrayRutas) === 1 && $arrayRutas[0] === "cursos") {
    $cursos = new ControladorCursos();

    if ($metodo === "GET") {
        $pagina = isset($_GET['pagina']) && is_numeric($_GET['pagina']) ? (int) $_GET['pagina'] : null;
        $cursos->index($pagina);
        return;
    }

    if ($metodo === "POST") {
        $datos = json_decode(file_get_contents("php://input"), true);
        if (!$datos) {
            echo json_encode(["status" => 400, "detalle" => "JSON inválido"]);
            return;
        }

        $campos = ['titulo', 'descripcion', 'instructor', 'imagen', 'precio'];
        foreach ($campos as $campo) {
            if (empty($datos[$campo])) {
                echo json_encode(["status" => 400, "detalle" => "El campo '$campo' es obligatorio"]);
                return;
            }
        }

        $cursos->create($datos);
        return;
    }
}

if (count($arrayRutas) === 2 && $arrayRutas[0] === "cursos" && $arrayRutas[1] === "mis") {
    $cursos = new ControladorCursos();
    $cursos->misCursos();
    return;
}

if (count($arrayRutas) === 2 && $arrayRutas[0] === "cursos") {
    $id = $arrayRutas[1];
    $cursos = new ControladorCursos();

    if ($metodo === "GET") {
        $cursos->show($id);
        return;
    }

    if ($metodo === "PUT") {
        $putData = json_decode(file_get_contents("php://input"), true);
        if (!$putData) {
            echo json_encode(["status" => 400, "detalle" => "JSON inválido"]);
            return;
        }

        $cursos->update($id, $putData);
        return;
    }

    if ($metodo === "DELETE") {
        $cursos->delete($id);
        return;
    }
}

// =============================
// Rutas de Clientes
// =============================

if (count($arrayRutas) === 1 && $arrayRutas[0] === "clientes" && $metodo === "POST") {
    $datos = json_decode(file_get_contents("php://input"), true);
    if (!$datos) {
        echo json_encode(["status" => 400, "detalle" => "JSON inválido"]);
        return;
    }

    $campos = ['nombre', 'apellido', 'email'];
    foreach ($campos as $campo) {
        if (empty($datos[$campo])) {
            echo json_encode(["status" => 400, "detalle" => "El campo '$campo' es obligatorio"]);
            return;
        }
    }

    $clientes = new ControladorClientes();
    $clientes->create($datos);
    return;
}

if (count($arrayRutas) === 2 && $arrayRutas[0] === "clientes" && $arrayRutas[1] === "login" && $metodo === "POST") {
    $datos = json_decode(file_get_contents("php://input"), true);
    if (!$datos) {
        echo json_encode(["status" => 400, "detalle" => "JSON inválido"]);
        return;
    }

    $login = new ControladorClientes();
    $login->login($datos);
    return;
}

if ($metodo === "POST" && isset($_GET["ruta"]) && $_GET["ruta"] === "login") {
    $datos = json_decode(file_get_contents("php://input"), true);
    $login = new ControladorClientes();
    $login->login($datos);
    return;
}

// GET /clientes/perfil
if (count($arrayRutas) === 2 && $arrayRutas[0] === "clientes" && $arrayRutas[1] === "perfil" && $metodo === "GET") {
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
        echo json_encode(["status" => 401, "detalle" => "No autorizado"]);
        return;
    }

    $id_cliente = $_SERVER['PHP_AUTH_USER'];
    $llave_secreta = $_SERVER['PHP_AUTH_PW'];

    $respuesta = ModeloClientes::obtenerPerfil($id_cliente);

    if ($respuesta) {
        echo json_encode([
            "status" => 200,
            "nombre" => $respuesta["nombre"],
            "apellido" => $respuesta["apellido"],
            "correo" => $respuesta["email"]
        ]);
    } else {
        echo json_encode(["status" => 403, "detalle" => "Token inválido"]);
    }

    return;
}



// =============================
// Rutas del Carrito
// =============================

if (count($arrayRutas) === 1 && $arrayRutas[0] === "carrito" && $metodo === "POST") {
    $datos = json_decode(file_get_contents("php://input"), true);
    if (!$datos) {
        echo json_encode(["status" => 400, "detalle" => "JSON inválido"]);
        return;
    }

    $carrito = new ControladorCarrito();
    $carrito->create($datos);
    return;
}

// GET /carrito/contador
if (count($arrayRutas) === 2 && $arrayRutas[0] === "carrito" && $arrayRutas[1] === "contador") {
    $carrito = new ControladorCarrito();
    $carrito->contar();
    return;
}

if (count($arrayRutas) === 2 && $arrayRutas[0] === "carrito" && $metodo === "GET") {
    $idCliente = $arrayRutas[1];
    $carrito = new ControladorCarrito();
    $carrito->obtenerPorCliente($idCliente);
    return;
}

if (count($arrayRutas) === 3 && $arrayRutas[0] === "carrito" && $arrayRutas[1] === "eliminar" && $metodo === "DELETE") {
    $idCarrito = $arrayRutas[2];
    $carrito = new ControladorCarrito();
    $carrito->delete($idCarrito);
    return;
}

if (count($arrayRutas) === 1 && $arrayRutas[0] === "pagar" && $metodo === "POST") {
    $datos = json_decode(file_get_contents("php://input"), true);
    $carrito = new ControladorCarrito();
    $carrito->procesarPago($datos);
    return;
}
// GET /carrito/cantidad/{id_cliente}
if (count($arrayRutas) === 3 && $arrayRutas[0] === "carrito" && $arrayRutas[1] === "cantidad" && $metodo === "GET") {
    $idCliente = $arrayRutas[2];
    $carrito = new ControladorCarrito();
    $carrito->cantidad($idCliente);
    return;
}


// =============================
// Rutas de Compras
// =============================

if (count($arrayRutas) === 3 && $arrayRutas[0] === "compras" && $arrayRutas[1] === "cliente" && $metodo === "GET") {
    $idCliente = $arrayRutas[2];
    $compras = new ControladorCompras();
    $compras->obtenerComprasPorCliente($idCliente);
    return;
}

// =============================
// Rutas de YouTube (GET /youtube/canal/:id)
// =============================
if (count($arrayRutas) === 3 && $arrayRutas[0] === "youtube" && $arrayRutas[1] === "canal" && $metodo === "GET") {
    require_once "controladores/youtube.controlador.php";
    $idCanal = $arrayRutas[2];
    $respuesta = YoutubeControlador::ctrObtenerCanal($idCanal);
    echo json_encode($respuesta, JSON_PRETTY_PRINT);
    return;
}



// =============================
// Ruta no válida
// =============================
echo json_encode(["detalle" => "Ruta no válida"]);
return;
