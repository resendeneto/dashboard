#!/usr/bin/env python3
"""
GitHub + Vercel MCP Server para Dashboard Social.

Ferramentas:
  - github_create_repo    → Cria repositório no GitHub
  - github_push_changes   → Commita e faz push das alterações do dashboard
  - github_repo_status    → Status do repositório e último commit
  - vercel_deploy         → Faz deploy no Vercel via CLI
  - pipeline_sync         → Push no GitHub + deploy no Vercel em sequência

Configuração (.env ou variáveis de ambiente):
  GITHUB_TOKEN            → Token pessoal com escopo 'repo'
  GITHUB_USERNAME         → Seu usuário do GitHub
  GITHUB_REPO_NAME        → Nome do repositório (padrão: dashboard-social)
  DASHBOARD_PATH          → Caminho para a pasta do dashboard
  VERCEL_TOKEN            → Token do Vercel (opcional, usa CLI se não definido)
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "github-vercel",
    instructions=(
        "Servidor MCP para sincronizar o Dashboard Social com GitHub e Vercel. "
        "Use github_push_changes para salvar alterações e vercel_deploy para publicar. "
        "Use pipeline_sync para fazer os dois de uma vez."
    ),
)

GH_API = "https://api.github.com"
DASHBOARD_PATH = os.environ.get(
    "DASHBOARD_PATH",
    r"C:\Users\PedroHenriqueFerreir\OneDrive - Grupo BS Tecnologia\Área de Trabalho\Vscode\dashboard-social",
)


def _token() -> str:
    t = os.environ.get("GITHUB_TOKEN", "").strip()
    if not t:
        raise ValueError("GITHUB_TOKEN não configurado. Veja .env.example.")
    return t


def _username() -> str:
    u = os.environ.get("GITHUB_USERNAME", "").strip()
    if not u:
        raise ValueError("GITHUB_USERNAME não configurado.")
    return u


def _repo() -> str:
    return os.environ.get("GITHUB_REPO_NAME", "dashboard-social").strip()


def _gh_headers() -> dict:
    return {
        "Authorization": f"Bearer {_token()}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _run(cmd: list[str], cwd: str | None = None) -> tuple[int, str, str]:
    result = subprocess.run(
        cmd, capture_output=True, text=True, cwd=cwd or DASHBOARD_PATH
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()


@mcp.tool(annotations={"readOnlyHint": False, "idempotentHint": True})
async def github_create_repo(
    private: bool = True,
    description: str = "Dashboard Social — Instagram + Meta Ads analytics",
) -> str:
    """
    Cria um repositório no GitHub para o Dashboard Social.

    Args:
        private:     True para repositório privado (padrão: True).
        description: Descrição do repositório.
    """
    async with httpx.AsyncClient() as client:
        existing = await client.get(
            f"{GH_API}/repos/{_username()}/{_repo()}",
            headers=_gh_headers(),
        )
        if existing.status_code == 200:
            data = existing.json()
            return json.dumps(
                {"status": "already_exists", "url": data["html_url"], "clone_url": data["clone_url"]},
                indent=2, ensure_ascii=False,
            )

        response = await client.post(
            f"{GH_API}/user/repos",
            headers=_gh_headers(),
            json={"name": _repo(), "description": description, "private": private, "auto_init": False},
        )

    if response.status_code not in (200, 201):
        raise ValueError(f"GitHub API {response.status_code}: {response.text}")

    data = response.json()
    code, _, err = _run(["git", "remote", "add", "origin", data["clone_url"]])
    if code != 0 and "already exists" not in err:
        raise ValueError(f"Erro ao adicionar remote: {err}")

    return json.dumps(
        {
            "status":    "created",
            "url":       data["html_url"],
            "clone_url": data["clone_url"],
            "private":   data["private"],
            "next_step": "Use github_push_changes para enviar os arquivos.",
        },
        indent=2, ensure_ascii=False,
    )


@mcp.tool(annotations={"readOnlyHint": False, "idempotentHint": False})
async def github_push_changes(
    message: str = "",
    branch: str = "main",
) -> str:
    """
    Commita todas as alterações do dashboard e faz push para o GitHub.

    Args:
        message: Mensagem do commit (gerada automaticamente se vazia).
        branch:  Branch de destino (padrão: main).
    """
    if not message:
        message = f"chore: sync dashboard {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    steps = []

    code, out, err = _run(["git", "status", "--porcelain"])
    if not out and code == 0:
        return json.dumps({"status": "nothing_to_commit", "message": "Sem alterações para commitar."}, indent=2)

    _run(["git", "add", "."])
    steps.append("git add .")

    code, out, err = _run(["git", "commit", "-m", message])
    if code != 0 and "nothing to commit" not in err:
        raise ValueError(f"Erro no commit: {err}")
    steps.append(f"git commit: {out[:100]}")

    code, _, err = _run(["git", "branch", "-M", branch])
    code, out, err = _run(["git", "push", "-u", "origin", branch])
    if code != 0:
        raise ValueError(f"Erro no push: {err}")
    steps.append(f"git push origin {branch}")

    return json.dumps(
        {"status": "success", "branch": branch, "message": message, "steps": steps},
        indent=2, ensure_ascii=False,
    )


@mcp.tool(annotations={"readOnlyHint": True})
async def github_repo_status() -> str:
    """
    Retorna o status do repositório: branch atual, último commit, arquivos modificados
    e URL do repositório no GitHub.
    """
    _, branch, _ = _run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    _, log, _    = _run(["git", "log", "--oneline", "-5"])
    _, status, _ = _run(["git", "status", "--short"])
    _, remote, _ = _run(["git", "remote", "get-url", "origin"])

    return json.dumps(
        {
            "branch":          branch or "main",
            "remote":          remote,
            "last_commits":    log.splitlines(),
            "pending_changes": status.splitlines() or [],
            "dashboard_path":  DASHBOARD_PATH,
        },
        indent=2, ensure_ascii=False,
    )


@mcp.tool(annotations={"readOnlyHint": False, "idempotentHint": True})
async def vercel_deploy(production: bool = True) -> str:
    """
    Faz deploy do dashboard no Vercel usando a CLI (npx vercel).

    Args:
        production: True para deploy de produção com `--prod` (padrão: True).
    """
    node_path = r"C:\Program Files\nodejs"
    env = {**os.environ, "PATH": f"{node_path};{os.environ.get('PATH', '')}"}

    cmd = ["npx", "vercel", "deploy", "--yes"]
    if production:
        cmd.append("--prod")

    result = subprocess.run(
        cmd, capture_output=True, text=True, cwd=DASHBOARD_PATH, env=env, timeout=120,
    )

    output = result.stdout.strip() + ("\n" + result.stderr.strip() if result.stderr.strip() else "")
    url = next((line for line in output.splitlines() if line.startswith("https://")), None)

    return json.dumps(
        {
            "status":     "success" if result.returncode == 0 else "error",
            "production": production,
            "url":        url,
            "output":     output[-1000:],
        },
        indent=2, ensure_ascii=False,
    )


@mcp.tool(annotations={"readOnlyHint": False, "idempotentHint": False})
async def pipeline_sync(
    commit_message: str = "",
    deploy_production: bool = True,
) -> str:
    """
    Pipeline completo: commita alterações no GitHub e faz deploy no Vercel.

    Args:
        commit_message:    Mensagem do commit (gerada automaticamente se vazia).
        deploy_production: True para deploy de produção (padrão: True).
    """
    results = {}

    try:
        push_result = json.loads(await github_push_changes(commit_message))
        results["github"] = push_result
    except Exception as e:
        results["github"] = {"status": "error", "error": str(e)}

    try:
        deploy_result = json.loads(await vercel_deploy(deploy_production))
        results["vercel"] = deploy_result
    except Exception as e:
        results["vercel"] = {"status": "error", "error": str(e)}

    overall = "success" if all(r.get("status") in ("success", "nothing_to_commit") for r in results.values()) else "partial"

    return json.dumps(
        {"status": overall, "results": results},
        indent=2, ensure_ascii=False,
    )


if __name__ == "__main__":
    mcp.run()
