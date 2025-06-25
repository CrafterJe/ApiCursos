<?php
require_once "conexion.php";
class ModeloClientes{

    /*=============================================
	Mostrar todos los registros
	=============================================*/

    static public function index($tabla) {
        $stmt = Conexion::conectar()->prepare("SELECT * FROM $tabla");
        $stmt->execute();
        $resultado = $stmt->fetchAll();
        
        $stmt = null; 
        return $resultado;
    }

    static public function create($tabla, $datos) {
        $stmt = Conexion::conectar()->prepare("INSERT INTO $tabla(nombre, apellido, email, id_cliente, llave_secreta, created_at, updated_at) VALUES (:nombre, :apellido, :email, :id_cliente, :llave_secreta, :created_at, :updated_at)");

        $stmt->bindParam(":nombre", $datos["nombre"], PDO::PARAM_STR);
        $stmt->bindParam(":apellido", $datos["apellido"], PDO::PARAM_STR);
        $stmt->bindParam(":email", $datos["email"], PDO::PARAM_STR);
        $stmt->bindParam(":id_cliente", $datos["id_cliente"], PDO::PARAM_STR);
        $stmt->bindParam(":llave_secreta", $datos["llave_secreta"], PDO::PARAM_STR);
        $stmt->bindParam(":created_at", $datos["created_at"], PDO::PARAM_STR);
        $stmt->bindParam(":updated_at", $datos["updated_at"], PDO::PARAM_STR);

        if ($stmt->execute()) {
            $stmt = null;
            return "ok";
        } else {
            print_r($stmt->errorInfo());
        }

        $stmt = null;
    }



    static public function obtenerIdPorCredenciales($id_cliente, $llave_secreta) {
        $stmt = Conexion::conectar()->prepare(
            "SELECT id FROM clientes 
             WHERE id_cliente = :id_cliente 
             AND llave_secreta = :llave_secreta"
        );

        $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
        $stmt->bindParam(":llave_secreta", $llave_secreta, PDO::PARAM_STR);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return $resultado ? $resultado["id"] : null;
    }

    // GET /clientes/perfil
    public static function obtenerPerfil($id_cliente) {
        $sql = "SELECT nombre, apellido, email FROM clientes WHERE id_cliente = :id";
        $stmt = Conexion::conectar()->prepare($sql);
        $stmt->bindParam(":id", $id_cliente, PDO::PARAM_STR); 
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>