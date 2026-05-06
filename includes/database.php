<?php
define('CAMINHO_BANCO', __DIR__ . '/../data/petcare.db');

function conectarBanco() {
    $pasta = dirname(CAMINHO_BANCO);
    if (!is_dir($pasta)) {
        mkdir($pasta, 0755, true);
    }

    $banco = new PDO('sqlite:' . CAMINHO_BANCO);
    $banco->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $banco->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $banco->exec('PRAGMA foreign_keys = ON;');

    return $banco;
}

function criarTabelas() {
    $banco = conectarBanco();

    $banco->exec("
        CREATE TABLE IF NOT EXISTS pets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nome        TEXT NOT NULL,
            especie     TEXT NOT NULL,
            raca        TEXT,
            nascimento  TEXT,
            peso        REAL,
            emoji       TEXT DEFAULT '🐾',
            observacoes TEXT,
            criado_em   TEXT DEFAULT (datetime('now','localtime'))
        );
    ");

    $banco->exec("
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            titulo TEXT NOT NULL,
            descricao TEXT,
            data TEXT NOT NULL,
            horario TEXT,
            proximo TEXT,
            concluido INTEGER DEFAULT 0,
            criado_em TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
        );
    ");
}

criarTabelas();
?>