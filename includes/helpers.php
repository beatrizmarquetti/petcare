<?php
function limparTexto($texto) {
    return htmlspecialchars(strip_tags(trim($texto)), ENT_QUOTES, 'UTF-8');
}

function validarPet($dados) {
    $erros = [];

    $nome = trim($dados['nome'] ?? '');
    if (empty($nome)) {
        $erros[] = 'O nome do pet é obrigatório.';
    } elseif (strlen($nome) < 2) {
        $erros[] = 'O nome deve ter pelo menos 2 caracteres.';
    } elseif (strlen($nome) > 50) {
        $erros[] = 'O nome deve ter no máximo 50 caracteres.';
    }

    $especiesValidas = ['dog', 'cat', 'rabbit', 'bird', 'fish', 'hamster', 'reptile', 'other'];
    $especie = trim($dados['especie'] ?? '');
    if (empty($especie)) {
        $erros[] = 'A espécie é obrigatória.';
    } elseif (!in_array($especie, $especiesValidas)) {
        $erros[] = 'Espécie inválida.';
    }

    $peso = $dados['peso'] ?? '';
    if ($peso !== '' && (!is_numeric($peso) || (float)$peso <= 0 || (float)$peso > 999)) {
        $erros[] = 'O peso deve ser um número entre 0 e 999 kg.';
    }

    $nascimento = $dados['nascimento'] ?? '';
    if ($nascimento !== '') {
        $data = DateTime::createFromFormat('Y-m-d', $nascimento);
        if (!$data || $data > new DateTime()) {
            $erros[] = 'Data de nascimento inválida.';
        }
    }

    return $erros;
}

function validarRegistro($dados) {
    $erros = [];

    $titulo = trim($dados['titulo'] ?? '');
    if (empty($titulo)) {
        $erros[] = 'O título do registro é obrigatório.';
    } elseif (strlen($titulo) > 100) {
        $erros[] = 'O título deve ter no máximo 100 caracteres.';
    }

    $tiposValidos = ['feeding', 'cleaning', 'vet', 'medication', 'exercise', 'grooming', 'other'];
    if (!in_array($dados['tipo'] ?? '', $tiposValidos)) {
        $erros[] = 'Tipo de cuidado inválido.';
    }

    $data = $dados['data'] ?? '';
    if (empty($data)) {
        $erros[] = 'A data é obrigatória.';
    } else {
        $dataObj = DateTime::createFromFormat('Y-m-d', $data);
        if (!$dataObj) {
            $erros[] = 'Formato de data inválido.';
        }
    }

    $petId = $dados['pet_id'] ?? '';
    if (empty($petId) || !is_numeric($petId)) {
        $erros[] = 'Pet não encontrado.';
    }

    return $erros;
}

function responderJSON($sucesso, $dados = null, $mensagem = '', $codigo = 200) {
    http_response_code($codigo);
    header('Content-Type: application/json');
    echo json_encode([
        'sucesso'   => $sucesso,
        'dados'     => $dados,
        'mensagem'  => $mensagem
    ]);
    exit;
}
?>