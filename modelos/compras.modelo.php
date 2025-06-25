<?php
require_once "conexion.php";

class ModeloCompras {
    public static function obtenerComprasPorCliente($id_cliente) {
    try {
        $sql = "SELECT c.Idpago, c.FechaCompra, c.MetodoPago, cu.id AS id_curso, cu.titulo, cu.imagen, cu.instructor, cu.precio
                FROM compras c
                INNER JOIN cursos cu ON c.Idcurso = cu.id
                WHERE c.Idcliente = :id_cliente
                ORDER BY c.Idpago DESC";

        $stmt = Conexion::conectar()->prepare($sql);
        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_INT);
        $stmt->execute();
        $compras = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $agrupadas = [];
        foreach ($compras as $compra) {
            $idpago = $compra['Idpago'];
            if (!isset($agrupadas[$idpago])) {
                $agrupadas[$idpago] = [
                    "fecha" => $compra["FechaCompra"],
                    "metodo" => $compra["MetodoPago"],
                    "cursos" => []
                ];
            }
            $agrupadas[$idpago]["cursos"][] = [
                "id" => $compra["id_curso"],
                "titulo" => $compra["titulo"],
                "imagen" => $compra["imagen"],
                "instructor" => $compra["instructor"],
                "precio" => $compra["precio"]
            ];
        }

        return array_values(array_map(function ($key, $value) {
            return array_merge(["idpago" => $key], $value);
        }, array_keys($agrupadas), $agrupadas));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => 500, "detalle" => "Error SQL: " . $e->getMessage()]);
        exit();
    }
}

}
