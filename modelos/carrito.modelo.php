<?php
require_once "conexion.php";

class ModeloCarrito {

    /* Mostrar todos los productos del carrito de un cliente CON información del curso */
    static public function obtenerCarritoPorCliente($tabla, $id_cliente) {
        $stmt = Conexion::conectar()->prepare("
            SELECT 
                c.id, 
                c.id_cliente, 
                c.id_curso, 
                c.cantidad, 
                c.fecha_agregado,
                cur.titulo,
                cur.descripcion,
                cur.instructor,
                cur.imagen,
                cur.precio
            FROM $tabla c 
            INNER JOIN cursos cur ON c.id_curso = cur.id 
            WHERE c.id_cliente = :id_cliente
        ");
        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /* Agregar producto al carrito */
    static public function agregar($tabla, $datos) {
        // Primero verificar si el curso ya está en el carrito
        $stmt = Conexion::conectar()->prepare("SELECT id FROM $tabla WHERE id_cliente = :id_cliente AND id_curso = :id_curso");
        $stmt->bindParam(":id_cliente", $datos["id_cliente"], PDO::PARAM_STR);
        $stmt->bindParam(":id_curso", $datos["id_curso"], PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return "El curso ya está en el carrito";
        }
        
        $stmt = Conexion::conectar()->prepare("INSERT INTO $tabla (id_cliente, id_curso, cantidad) VALUES (:id_cliente, :id_curso, :cantidad)");
        $stmt->bindParam(":id_cliente", $datos["id_cliente"], PDO::PARAM_STR);
        $stmt->bindParam(":id_curso", $datos["id_curso"], PDO::PARAM_INT);
        $stmt->bindParam(":cantidad", $datos["cantidad"], PDO::PARAM_INT);
        return $stmt->execute() ? "ok" : Conexion::conectar()->errorInfo();
    }

    /* Eliminar un producto del carrito */
    static public function eliminar($tabla, $id) {
        $stmt = Conexion::conectar()->prepare("DELETE FROM $tabla WHERE id = :id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        return $stmt->execute() ? "ok" : Conexion::conectar()->errorInfo();
    }

    static public function contarPorCliente($id_cliente) {
        $stmt = Conexion::conectar()->prepare("SELECT COUNT(*) FROM carrito WHERE id_cliente = :id_cliente");
        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    static public function contarCursos($tabla, $id_cliente) {
        $stmt = Conexion::conectar()->prepare("SELECT COUNT(*) AS total FROM $tabla WHERE id_cliente = :id_cliente");
        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    static public function contarItems($id_cliente){
        $stmt = Conexion::conectar()->prepare("SELECT COUNT(*) as total FROM carrito WHERE id_cliente = :id_cliente");
        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR); 
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resultado["total"] ?? 0;
    }

    public static function obtenerTotalPorCliente($tabla, $id_cliente)
    {
        try {
            $conexion = Conexion::conectar();
            $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM $tabla WHERE id_cliente = :id_cliente");
            $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
            $stmt->execute();
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            return $resultado ? $resultado['total'] : 0;
        } catch (Exception $e) {
            return 0;
        }
    }

    static public function registrarCompra($tabla, $datos) {
        $stmt = Conexion::conectar()->prepare("
            INSERT INTO $tabla (Idcliente, MetodoPago, FechaCompra, Idcurso, TotalCompra)
            VALUES (:idc, :metodo, :fecha, :idcurso, :total)
        ");
        $stmt->bindParam(":idc", $datos["Idcliente"], PDO::PARAM_INT);
        $stmt->bindParam(":metodo", $datos["MetodoPago"], PDO::PARAM_STR);
        $stmt->bindParam(":fecha", $datos["FechaCompra"], PDO::PARAM_STR);
        $stmt->bindParam(":idcurso", $datos["Idcurso"], PDO::PARAM_INT);
        $stmt->bindParam(":total", $datos["TotalCompra"], PDO::PARAM_STR);

        $stmt->execute();
        return $stmt;
    }
    
    static public function vaciarCarrito($tabla, $id_cliente) {
        $stmt = Conexion::conectar()->prepare("DELETE FROM $tabla WHERE id_cliente = :idc");
        $stmt->bindParam(":idc", $id_cliente, PDO::PARAM_STR);
        $stmt->execute();
    }

    
    static public function obtenerCantidad($tabla, $id_cliente) {
    $stmt = Conexion::conectar()->prepare("SELECT COUNT(*) as cantidad FROM $tabla WHERE id_cliente = :id_cliente");
    $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC)["cantidad"];
}

}