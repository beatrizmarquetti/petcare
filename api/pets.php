<?php
header('Content-Type: application/json');
require_once '../includes/database.php';
require_once '../includes/helpers.php';

$metodo = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    $banco = conectarBanco();

    if ($metodo === 'GET') {

        if ($id) {
            $query = $banco->prepare('SELECT * FROM pets WHERE id = ?');
            $query->execute([$id]);
            $pet = $query->fetch();

            if (!$pet) {
                responderJSON(false, null, 'Pet não encontrado.', 404);
            }

            responderJSON(true, $pet);

        } else {
            $busca   = $_GET['busca']   ?? '';
            $especie = $_GET['especie'] ?? '';

            $sql    = 'SELECT p.*, COUNT(r.id) as total_registros
                       FROM pets p
                       LEFT JOIN registros r ON r.pet_id = p.id
                       WHERE 1=1';
            $params = [];

            if ($busca) {
                $sql     .= ' AND p.nome LIKE ?';
                $params[] = "%$busca%";
            }

            if ($especie) {
                $sql     .= ' AND p.especie = ?';
                $params[] = $especie;
            }

            $sql .= ' GROUP BY p.id ORDER BY p.nome ASC';

            $query = $banco->prepare($sql);
            $query->execute($params);

            responderJSON(true, $query->fetchAll());
        }

    } elseif ($metodo === 'POST') {

        $dados = json_decode(file_get_contents('php://input'), true) ?? [];

        $erros = validarPet($dados);
        if ($erros) {
            responderJSON(false, null, implode(' ', $erros), 422);
        }

        $query = $banco->prepare(
            'INSERT INTO pets (nome, especie, raca, nascimento, peso, emoji, observacoes)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $query->execute([
            limparTexto($dados['nome']),
            $dados['especie'],
            limparTexto($dados['raca'] ?? ''),
            $dados['nascimento'] ?: null,
            $dados['peso'] !== '' ? (float)$dados['peso'] : null,
            limparTexto($dados['emoji'] ?? '🐾'),
            limparTexto($dados['observacoes'] ?? '')
        ]);

        $novoId = $banco->lastInsertId();
        $query2 = $banco->prepare('SELECT * FROM pets WHERE id = ?');
        $query2->execute([$novoId]);

        responderJSON(true, $query2->fetch(), 'Pet cadastrado com sucesso!', 201);

    } elseif ($metodo === 'PUT') {

        if (!$id) {
            responderJSON(false, null, 'ID é obrigatório.', 400);
        }

        $dados = json_decode(file_get_contents('php://input'), true) ?? [];
        $erros = validarPet($dados);
        if ($erros) {
            responderJSON(false, null, implode(' ', $erros), 422);
        }

        $query = $banco->prepare(
            'UPDATE pets SET nome=?, especie=?, raca=?, nascimento=?, peso=?, emoji=?, observacoes=?
             WHERE id=?'
        );
        $query->execute([
            limparTexto($dados['nome']),
            $dados['especie'],
            limparTexto($dados['raca'] ?? ''),
            $dados['nascimento'] ?: null,
            $dados['peso'] !== '' ? (float)$dados['peso'] : null,
            limparTexto($dados['emoji'] ?? '🐾'),
            limparTexto($dados['observacoes'] ?? ''),
            $id
        ]);

        if ($query->rowCount() === 0) {
            responderJSON(false, null, 'Pet não encontrado.', 404);
        }

        responderJSON(true, null, 'Pet atualizado com sucesso!');

    } elseif ($metodo === 'DELETE') {

        if (!$id) {
            responderJSON(false, null, 'ID é obrigatório.', 400);
        }

        $query = $banco->prepare('DELETE FROM pets WHERE id = ?');
        $query->execute([$id]);

        if ($query->rowCount() === 0) {
            responderJSON(false, null, 'Pet não encontrado.', 404);
        }

        responderJSON(true, null, 'Pet excluído com sucesso!');

    } else {
        responderJSON(false, null, 'Método não permitido.', 405);
    }

} catch (Exception $e) {
    responderJSON(false, null, 'Erro no servidor: ' . $e->getMessage(), 500);
}
?>