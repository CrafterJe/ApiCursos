<?php

require_once "modelos/cursos.modelo.php";
require_once "modelos/clientes.modelo.php";

class ControladorCursos{

    /*=============================================
    Validar autenticación Basic
    =============================================*/
    private function validarAutenticacion() {
        // Verificar si existen las cabeceras de autenticación
        if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
            return false;
        }

        $id_cliente = $_SERVER['PHP_AUTH_USER'];
        $llave_secreta = $_SERVER['PHP_AUTH_PW'];

        // Obtener todos los clientes registrados
        $clientes = ModeloClientes::index("clientes");

        // Verificar credenciales
        foreach ($clientes as $cliente) {
            if ($cliente["id_cliente"] === $id_cliente && $cliente["llave_secreta"] === $llave_secreta) {
                return true;
            }
        }

        return false;
    }

    /*=============================================
    Mostrar cursos
    =============================================*/
    public function index($pagina = null) {

    // Validar autenticación básica
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !$this->validarAutenticacion()) {
        echo json_encode([
            "status" => 401,
            "detalle" => "Acceso no autorizado. Credenciales inválidas."
        ], true);
        return;
    }

    // Parámetros comunes
    $tabla1 = "cursos";
    $tabla2 = "clientes";

    if ($pagina !== null) {
        $pagina = (int)$pagina;

        if ($pagina <= 0) {
            echo json_encode([
                "status" => 400,
                "detalle" => "Número de página inválido"
            ], true);
            return;
        }

        $limite = 9;
        $desde = ($pagina - 1) * $limite;

        // Obtener cursos paginados
        $cursos = ModeloCursos::index($tabla1, $tabla2, $limite, $desde);
        $total = ModeloCursos::total($tabla1); // Asegúrate de tener este método en el modelo

        echo json_encode([
            "status" => 200,
            "total_registros" => $total,
            "total_paginas" => ceil($total / $limite),
            "pagina_actual" => $pagina,
            "detalle" => $cursos
        ], true);
        return;

    } else {
        // Obtener todos los cursos sin paginación
        $cursos = ModeloCursos::index($tabla1, $tabla2, null, null);

        echo json_encode([
            "status" => 200,
            "total_registros" => count($cursos),
            "detalle" => $cursos
        ], true);
        return;
    }
}


    /*=============================================
    Crear curso
    =============================================*/
    private function obtenerIdClienteAutenticado() {
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) return false;

    $clientes = ModeloClientes::index("clientes");
    foreach ($clientes as $cliente) {
        if ($cliente["id_cliente"] === $_SERVER['PHP_AUTH_USER'] &&
            $cliente["llave_secreta"] === $_SERVER['PHP_AUTH_PW']) {
            return $cliente["id"];
        }
    }

    return false;
}

    
    public function create($datos){
    // Agregar id_creador desde autenticación
    $id_creador = $this->obtenerIdClienteAutenticado();
    if (!$id_creador) {
        echo json_encode(["status" => 401, "detalle" => "No autenticado"]);
        return;
    }

    $datos["id_creador"] = $id_creador;
    $datos["created_at"] = date('Y-m-d H:i:s');
    $datos["updated_at"] = date('Y-m-d H:i:s');

    $create = ModeloCursos::create("cursos", $datos);

    if ($create === "ok") {
        $json = ["status" => 200, "detalle" => "Curso registrado con éxito"];
    } else {
        $json = ["status" => 500, "detalle" => "Error al registrar el curso: $create"];
    }

    echo json_encode($json, true);
    return;
}


    /*=============================================
    Mostrar un curso específico
    =============================================*/
    public function show($id) {
    $curso = ModeloCursos::show("cursos", "clientes", $id);

    if (!$curso) {
        $json = array(
            "status" => 404,
            "detalle" => "Curso no encontrado"
        );
    } else {
        $json = array(
            "status" => 200,
            "detalle" => $curso
        );
    }

    echo json_encode($json, true);
}


    /*=============================================
    Actualizar curso
    =============================================*/
    public function update($id, $datos){

        $datos = array(
            "id" => $id,
            "titulo" => $datos["titulo"],
            "descripcion" => $datos["descripcion"],
            "instructor" => $datos["instructor"], 
            "imagen" => $datos["imagen"],
            "precio" => $datos["precio"],
            "updated_at" => date('Y-m-d H:i:s')
        );

        $update = ModeloCursos::update("cursos", $datos);

        if($update == "ok"){
            $json = array(
                "status" => 200,
                "detalle" => "Curso actualizado con éxito"
            );
        } else {
            $json = array(
                "status" => 404,
                "detalle" => "Error al actualizar el curso"
            );
        }

        echo json_encode($json, true);
    }

    /*=============================================
    Eliminar curso
    =============================================*/
    public function delete($id){

        $delete = ModeloCursos::delete("cursos", $id);

        if($delete == "ok"){
            $json = array(
                "status" => 200,
                "detalle" => "Curso eliminado con éxito"
            );
        } else {
            $json = array(
                "status" => 404,
                "detalle" => "Error al eliminar el curso"
            );
        }

        echo json_encode($json, true);
    }

    public function misCursos() {
    error_log("🚀 === INICIO misCursos() ===");

    if (!$this->validarAutenticacion()) {
        error_log("❌ Autenticación fallida");
        echo json_encode([
            "status" => 401,
            "detalle" => "Acceso no autorizado. Credenciales inválidas."
        ]);
        return;
    }

    $id_real = $this->obtenerIdClienteAutenticado();

    if (!$id_real) {
        error_log("❌ No se pudo obtener ID real");
        echo json_encode([
            "status" => 403,
            "detalle" => "No se pudo obtener el ID del cliente"
        ]);
        return;
    }

    $cursos = ModeloCursos::misCursos("cursos", "clientes", $id_real);

    echo json_encode([
        "status" => 200,
        "total_registros" => count($cursos),
        "detalle" => $cursos
    ]);
    error_log("📤 Respuesta enviada: " . json_encode($cursos));
}

}

?>