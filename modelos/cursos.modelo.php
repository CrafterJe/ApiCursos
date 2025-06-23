<?php
require_once "conexion.php";

class ModeloCursos {

    /*=============================================
    Obtener cursos (paginados o todos)
    =============================================*/
    public static function index($tabla1, $tabla2, $cantidad, $desde) {
    $conexion = Conexion::conectar();

    if ($cantidad !== null) {
        $stmt = $conexion->prepare("SELECT $tabla1.id, $tabla1.titulo, $tabla1.descripcion, $tabla1.instructor, $tabla1.imagen, $tabla1.precio, $tabla1.id_creador, $tabla2.nombre, $tabla2.apellido FROM $tabla1 INNER JOIN $tabla2 ON $tabla1.id_creador = $tabla2.id LIMIT :desde, :cantidad");
        $stmt->bindParam(":desde", $desde, PDO::PARAM_INT);
        $stmt->bindParam(":cantidad", $cantidad, PDO::PARAM_INT);
    } else {
        $stmt = $conexion->prepare("SELECT $tabla1.id, $tabla1.titulo, $tabla1.descripcion, $tabla1.instructor, $tabla1.imagen, $tabla1.precio, $tabla1.id_creador, $tabla2.nombre, $tabla2.apellido FROM $tabla1 INNER JOIN $tabla2 ON $tabla1.id_creador = $tabla2.id");
    }

    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt = null;

    return $resultados;
}
public static function total($tabla) {
    $conexion = Conexion::conectar();
    $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM $tabla");
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    return $resultado['total'];
}


    /*=============================================
    Crear curso
    =============================================*/
    static public function create($tabla, $datos) {
    try {
        $conexion = Conexion::conectar();

        $stmt = $conexion->prepare("INSERT INTO $tabla 
            (titulo, descripcion, instructor, imagen, precio, id_creador, created_at, updated_at) 
            VALUES 
            (:titulo, :descripcion, :instructor, :imagen, :precio, :id_creador, :created_at, :updated_at)");

        $stmt->bindParam(":titulo", $datos["titulo"], PDO::PARAM_STR);
        $stmt->bindParam(":descripcion", $datos["descripcion"], PDO::PARAM_STR);
        $stmt->bindParam(":instructor", $datos["instructor"], PDO::PARAM_STR);
        $stmt->bindParam(":imagen", $datos["imagen"], PDO::PARAM_STR);
        $stmt->bindParam(":precio", $datos["precio"], PDO::PARAM_STR);

        // id_creador
        if (isset($datos["id_creador"])) {
            $stmt->bindParam(":id_creador", $datos["id_creador"], PDO::PARAM_INT);
        } else {
            $null = null;
            $stmt->bindParam(":id_creador", $null, PDO::PARAM_NULL);
        }

        $stmt->bindParam(":created_at", $datos["created_at"], PDO::PARAM_STR);
        $stmt->bindParam(":updated_at", $datos["updated_at"], PDO::PARAM_STR);

        if ($stmt->execute()) {
            return "ok";
        } else {
            $error = $stmt->errorInfo();
            return $error[2]; // Mensaje de error SQL
        }

    } catch (PDOException $e) {
        return "PDOException: " . $e->getMessage();
    }
}




    /*=============================================
    Mostrar curso específico
    =============================================*/
    static public function show($tabla1, $tabla2, $id) {
        $conexion = Conexion::conectar();

        $stmt = $conexion->prepare("SELECT $tabla1.id, $tabla1.titulo, $tabla1.descripcion, $tabla1.instructor, $tabla1.imagen, $tabla1.precio, $tabla1.id_creador, $tabla2.nombre, $tabla2.apellido FROM $tabla1 INNER JOIN $tabla2 ON $tabla1.id_creador = $tabla2.id WHERE $tabla1.id = :id");

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt = null;

        return $resultado;
    }

    /*=============================================
    Mostrar mis cursos
    =============================================*/
    public static function obtenerCursosPorCreador($tabla, $id_creador)
    {
        $stmt = Conexion::conectar()->prepare("SELECT * FROM $tabla WHERE id_creador = :id_creador");
        $stmt->bindParam(":id_creador", $id_creador, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    static public function misCursos($tabla1, $tabla2, $id_cliente) {
    error_log("🔍 ModeloCursos::misCursos() - Buscando para ID: $id_cliente");
    
    $conexion = Conexion::conectar();
    
    $sql = "SELECT $tabla1.id, $tabla1.titulo, $tabla1.descripcion, $tabla1.instructor, 
                   $tabla1.imagen, $tabla1.precio, $tabla1.id_creador, 
                   $tabla2.nombre, $tabla2.apellido 
            FROM $tabla1 
            INNER JOIN $tabla2 ON $tabla1.id_creador = $tabla2.id 
            WHERE $tabla1.id_creador = :id_creador
            ORDER BY $tabla1.created_at DESC";
    
    error_log("🔍 SQL Query: $sql");
    error_log("🔍 Parámetro id_creador: $id_cliente");
    
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(":id_creador", $id_cliente, PDO::PARAM_INT);
    $stmt->execute();
    
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("🔍 Resultados encontrados: " . count($resultados));
    error_log("🔍 Datos: " . print_r($resultados, true));
    
    $stmt = null;
    return $resultados;
}

    public static function obtenerPorCreador($tabla, $id_creador) {
    $stmt = Conexion::conectar()->prepare("SELECT * FROM $tabla WHERE id_creador = :id_creador");
    $stmt->bindParam(":id_creador", $id_creador, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

static public function obtenerIdPorCredenciales($id_cliente, $llave_secreta) {
    error_log("🔍 Buscando ID para credenciales: $id_cliente");
    
    $stmt = Conexion::conectar()->prepare(
        "SELECT id FROM clientes 
         WHERE id_cliente = :id_cliente 
         AND llave_secreta = :llave_secreta"
    );

    $stmt->bindParam(":id_cliente", $id_cliente, PDO::PARAM_STR);
    $stmt->bindParam(":llave_secreta", $llave_secreta, PDO::PARAM_STR);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    error_log("🔍 Resultado búsqueda ID: " . print_r($resultado, true));
    
    return $resultado ? $resultado["id"] : null;
}

    /*=============================================
    Actualizar curso
    =============================================*/
    static public function update($tabla, $datos) {
        $conexion = Conexion::conectar();

        $stmt = $conexion->prepare("UPDATE cursos SET titulo=:titulo, descripcion=:descripcion, instructor=:instructor, imagen=:imagen, precio=:precio, updated_at=:updated_at WHERE id=:id");

        $stmt->bindParam(":id", $datos["id"], PDO::PARAM_INT);
        $stmt->bindParam(":titulo", $datos["titulo"], PDO::PARAM_STR);
        $stmt->bindParam(":descripcion", $datos["descripcion"], PDO::PARAM_STR);
        $stmt->bindParam(":instructor", $datos["instructor"], PDO::PARAM_STR);
        $stmt->bindParam(":imagen", $datos["imagen"], PDO::PARAM_STR);
        $stmt->bindParam(":precio", $datos["precio"], PDO::PARAM_STR);
        $stmt->bindParam(":updated_at", $datos["updated_at"], PDO::PARAM_STR);

        if ($stmt->execute()) {
            return "ok";
        } else {
            print_r($stmt->errorInfo());
        }

        $stmt = null;
    }

    /*=============================================
    Eliminar curso
    =============================================*/
    static public function delete($tabla, $id) {
        $conexion = Conexion::conectar();

        $stmt = $conexion->prepare("DELETE FROM $tabla WHERE id=:id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return "ok";
        } else {
            print_r($stmt->errorInfo());
        }

        $stmt = null;
    }
}
?>
