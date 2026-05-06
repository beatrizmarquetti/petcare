<?php
header('Content-Type: application/json');
require_once '../includes/database.php';
require_once '../includes/helpers.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id'])     ? (int)$_GET['id']     : null;
$petId  = isset($_GET['pet_id']) ? (int)$_GET['pet_id'] : null;

try {
    $banco = conectarBanco();

    if ($metodo === 'GET') {

        if ($id) {
            $query = $banco->prepare(
                'SELECT r.*, p.nome as nome_pet
                 FROM registros r
                 JOIN pets p ON p.id = r.pet_id
                 WHERE r.id = ?'
            );
            $query->execute([$id]);
            $registro = $query->fetch();

            if (!$registro) {
                responderJSON(false, null, 'Registro não encontrado.', 404);
            }

            responderJSON(true, $registro);

        } else {
            $tipo = $_GET['tipo'] ?? '';

            $sql    = 'SELECT r.*, p.nome as nome_pet, p.emoji
                       FROM registros r
                       JOIN pets p ON p.id = r.pet_id
                       WHERE 1=1';
            $params = [];

            if ($petId) {
                $sql     .= ' AND r.pet_id = ?';
                $params[] = $petId;
            }

            if ($tipo) {
                $sql     .= ' AND r.tipo = ?';
                $params[] = $tipo;
            }

            $sql .= ' ORDER BY r.data DESC, r.horario DESC';

            $query = $banco->prepare($sql);
            $query->execute($params);

            responderJSON(true, $query->fetchAll());
        }

    } elseif ($metodo === 'POST') {

        $dados = json_decode(file_get_contents('php://input'), true) ?? [];
        $erros = validarRegistro($dados);
        if ($erros) {
            responderJSON(false, null, implode(' ', $erros), 422);
        }

                $query = $banco->prepare(
            'INSERT INTO registros (pet_id, tipo, titulo, descricao, data, horario, proximo, concluido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $query->execute([
            (int)$dados['pet_id'],
            $dados['tipo'],
            limparTexto($dados['titulo']),
            limparTexto($dados['descricao'] ?? ''),
            $dados['data'],
            $dados['horario'] ?: null,
            $dados['proximo'] ?: null,
            isset($dados['concluido']) ? 1 : 0
        ]);

        $novoId = $banco->lastInsertId();
        $query2 = $banco->prepare(
            'SELECT r.*, p.nome as nome_pet
             FROM registros r
             JOIN pets p ON p.id = r.pet_id
             WHERE r.id = ?'
        );
        $query2->execute([$novoId]);

        responderJSON(true, $query2->fetch(), 'Registro criado com sucesso!', 201);

    } elseif ($metodo === 'PUT') {

        if (!$id) {
            responderJSON(false, null, 'ID é obrigatório.', 400);
        }

        $dados = json_decode(file_get_contents('php://input'), true) ?? [];
        $erros = validarRegistro($dados);
        if ($erros) {
            responderJSON(false, null, implode(' ', $erros), 422);
        }

                $query = $banco->prepare(
            'UPDATE registros
            SET pet_id=?, tipo=?, titulo=?, descricao=?, data=?, horario=?, proximo=?, concluido=?
            WHERE id=?'
        );
        $query->execute([
            (int)$dados['pet_id'],
            $dados['tipo'],
            limparTexto($dados['titulo']),
            limparTexto($dados['descricao'] ?? ''),
            $dados['data'],
            $dados['horario'] ?: null,
            $dados['proximo'] ?: null,
            isset($dados['concluido']) ? 1 : 0,
            $id
        ]);

        if ($query->rowCount() === 0) {
            responderJSON(false, null, 'Registro não encontrado.', 404);
        }

        responderJSON(true, null, 'Registro atualizado com sucesso!');

    } elseif ($metodo === 'DELETE') {

        if (!$id) {
            responderJSON(false, null, 'ID é obrigatório.', 400);
        }

        $query = $banco->prepare('DELETE FROM registros WHERE id = ?');
        $query->execute([$id]);

        if ($query->rowCount() === 0) {
            responderJSON(false, null, 'Registro não encontrado.', 404);
        }

        responderJSON(true, null, 'Registro excluído com sucesso!');

    } else {
        responderJSON(false, null, 'Método não permitido.', 405);
    }

} catch (Exception $e) {
    responderJSON(false, null, 'Erro no servidor: ' . $e->getMessage(), 500);
}
?>