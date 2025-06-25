<?php 

require_once "modelos/compras.modelo.php";
require_once "modelos/clientes.modelo.php";

class ControladorCompras{

    // GET /compras/cliente/{id}
    public function obtenerComprasPorCliente($id_cliente) {
        // Validar autenticación (igual que en carrito)
        if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
            echo json_encode(["status" => 401, "detalle" => "Credenciales requeridas"]);
            return;
        }

        $id_cliente_api = $_SERVER['PHP_AUTH_USER'];
        $llave = $_SERVER['PHP_AUTH_PW'];

        // Obtener el ID real del cliente usando las credenciales
        $cliente_id_real = ModeloClientes::obtenerIdPorCredenciales($id_cliente_api, $llave);
        if (!$cliente_id_real) {
            echo json_encode(["status" => 403, "detalle" => "Credenciales inválidas"]);
            return;
        }

        // Usar el ID real del cliente, no el que viene en la URL
        $compras = ModeloCompras::obtenerComprasPorCliente($cliente_id_real);
        
        if ($compras && count($compras) > 0) {
            echo json_encode([
                "status" => 200,
                "compras" => $compras
            ]);
        } else {
            echo json_encode([
                "status" => 200,
                "compras" => [],
                "mensaje" => "No se encontraron compras"
            ]);
        }
    }
}
?>