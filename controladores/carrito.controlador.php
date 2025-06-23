<?php
require_once "modelos/carrito.modelo.php";
require_once "modelos/clientes.modelo.php"; 

class ControladorCarrito {

    public function index($id_cliente) {
        $carrito = ModeloCarrito::obtenerCarritoPorCliente("carrito", $id_cliente);
        
        // Formato de respuesta consistente
        if (empty($carrito)) {
            echo json_encode([
                "status" => 200,
                "detalle" => []
            ]);
        } else {
            echo json_encode([
                "status" => 200,
                "detalle" => $carrito
            ]);
        }
    }

    public function create($datos) {
        if (!isset($_SERVER["PHP_AUTH_USER"])) {
            echo json_encode(["status" => 401, "detalle" => "Falta autenticación"]);
            return;
        }

        $id_cliente = $_SERVER["PHP_AUTH_USER"];

        if (!isset($datos["id_curso"])) {
            echo json_encode([
                "status" => 400,
                "detalle" => "Falta id_curso"
            ]);
            return;
        }

        $datos["cantidad"] = isset($datos["cantidad"]) ? (int)$datos["cantidad"] : 1;
        $datos["id_cliente"] = $id_cliente;

        $respuesta = ModeloCarrito::agregar("carrito", $datos);

        if ($respuesta == "ok") {
            echo json_encode([
                "status" => 200,
                "detalle" => "Producto agregado al carrito"
            ]);
        } else {
            echo json_encode([
                "status" => 500,
                "detalle" => "Error al agregar producto",
                "error" => $respuesta
            ]);
        }
    }

    public function delete($id) {
        $respuesta = ModeloCarrito::eliminar("carrito", $id);

        if ($respuesta == "ok") {
            echo json_encode([
                "status" => 200,
                "detalle" => "Producto eliminado del carrito"
            ]);
        } else {
            echo json_encode([
                "status" => 500,
                "detalle" => "Error al eliminar producto",
                "error" => $respuesta
            ]);
        }
    }

    public function obtenerPorCliente($id_cliente) {
        $this->index($id_cliente);
    }
    
    public function contar() {
        if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
            echo json_encode(["status" => 401, "detalle" => "Credenciales requeridas"]);
            return;
        }

        $id_cliente = $_SERVER['PHP_AUTH_USER'];

        $total = ModeloCarrito::obtenerTotalPorCliente("carrito", $id_cliente);

        echo json_encode(["status" => 200, "total" => $total]);
    }

    public function procesarPago($datos) {
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
        echo json_encode(["status" => 401, "detalle" => "Faltan credenciales"]);
        return;
    }

    $id_cliente_api = $_SERVER['PHP_AUTH_USER'];
    $llave = $_SERVER['PHP_AUTH_PW'];

    $cliente_id = ModeloClientes::obtenerIdPorCredenciales($id_cliente_api, $llave);
    if (!$cliente_id) {
        echo json_encode(["status" => 403, "detalle" => "Credenciales inválidas"]);
        return;
    }

    $carrito = ModeloCarrito::obtenerCarritoPorCliente("carrito", $id_cliente_api);

    if (empty($carrito)) {
        echo json_encode(["status" => 400, "detalle" => "El carrito está vacío"]);
        return;
    }

    $totalCompra = 0;
    $cursosComprados = [];

    foreach ($carrito as $item) {
        $precio = floatval($item["precio"]);
        $totalCompra += $precio;

        // Guardar para frontend
        $cursosComprados[] = [
            "id_curso" => $item["id_curso"],
            "titulo" => $item["titulo"],
            "precio" => $precio,
            "imagen" => $item["imagen"],
            "instructor" => $item["instructor"]
        ];

        // Registrar en tabla de compras
        ModeloCarrito::registrarCompra("compras", [
            "Idcliente" => $cliente_id,
            "MetodoPago" => $datos["metodo"],
            "FechaCompra" => date("Y-m-d H:i:s"),
            "Idcurso" => $item["id_curso"],
            "TotalCompra" => $totalCompra
        ]);
    }

    // Vaciar carrito
    ModeloCarrito::vaciarCarrito("carrito", $id_cliente_api);

    // Devolver cursos comprados para mostrar en gracias.html
    echo json_encode([
        "status" => 200,
        "detalle" => $cursosComprados
    ]);
}

public function cantidad($id_cliente) {
    $cantidad = ModeloCarrito::obtenerCantidad("carrito", $id_cliente);
    echo json_encode([
        "status" => 200,
        "cantidad" => $cantidad
    ]);
}

}