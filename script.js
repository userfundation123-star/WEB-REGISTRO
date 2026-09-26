// ============================================
// CONFIGURAÇÃO DO SUPABASE
// Cole aqui suas chaves (Project Settings > API)
// ============================================
const SUPABASE_URL = "https://avnpzgywjcajwpjykqeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bnB6Z3l3amNhandwanlrcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTgwNTksImV4cCI6MjEwNTkzNDA1OX0.lOi8Ixd4WOwPMRxu6KbEQD5mmte1fEOmU0hbgs8pcfU";

let banco = null;
try {
  if (!SUPABASE_URL.startsWith("https://")) {
    throw new Error("Cole a SUPABASE_URL correta no script.js (começa com https://).");
  }
  banco = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (erro) {
  alert("Erro de configuração: " + erro.message);
  console.error(erro);
}

// Elementos da página
const form = document.getElementById("formVeiculo");
const lista = document.getElementById("listaVeiculos");
const mensagem = document.getElementById("mensagem");
const busca = document.getElementById("busca");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

let veiculos = [];

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? "#dc2626" : "#16a34a";
  setTimeout(() => (mensagem.textContent = ""), 3000);
}

// LISTAR (SELECT)
async function carregarVeiculos() {
  if (!banco) return;
  const { data, error } = await banco
    .from("veiculos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    mostrarMensagem("Erro ao carregar: " + error.message, true);
    return;
  }
  veiculos = data;
  mostrarTabela(veiculos);
}

function mostrarTabela(dados) {
  lista.innerHTML = "";
  if (dados.length === 0) {
    lista.innerHTML = '<tr><td colspan="7" style="text-align:center">Nenhum veículo cadastrado.</td></tr>';
    return;
  }
  dados.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.placa}</td>
      <td>${v.marca}</td>
      <td>${v.modelo}</td>
      <td>${v.ano}</td>
      <td>${v.cor || "-"}</td>
      <td>${v.tipo}</td>
      <td>
        <button class="btn-editar" onclick="editarVeiculo(${v.id})">Editar</button>
        <button class="btn-excluir" onclick="excluirVeiculo(${v.id})">Excluir</button>
      </td>`;
    lista.appendChild(tr);
  });
}

// SALVAR (INSERT ou UPDATE)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("id").value;
  const veiculo = {
    placa: document.getElementById("placa").value.toUpperCase().trim(),
    marca: document.getElementById("marca").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    ano: parseInt(document.getElementById("ano").value),
    cor: document.getElementById("cor").value.trim(),
    tipo: document.getElementById("tipo").value,
  };

  let resultado;
  if (id) {
    resultado = await banco.from("veiculos").update(veiculo).eq("id", id);
  } else {
    resultado = await banco.from("veiculos").insert([veiculo]);
  }

  if (resultado.error) {
    mostrarMensagem("Erro: " + resultado.error.message, true);
    return;
  }

  mostrarMensagem(id ? "Veículo atualizado!" : "Veículo cadastrado!");
  limparFormulario();
  carregarVeiculos();
});

// EDITAR (preenche o formulário)
function editarVeiculo(id) {
  const v = veiculos.find((x) => x.id === id);
  if (!v) return;
  document.getElementById("id").value = v.id;
  document.getElementById("placa").value = v.placa;
  document.getElementById("marca").value = v.marca;
  document.getElementById("modelo").value = v.modelo;
  document.getElementById("ano").value = v.ano;
  document.getElementById("cor").value = v.cor || "";
  document.getElementById("tipo").value = v.tipo;
  tituloForm.textContent = "Editar Veículo";
  btnCancelar.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// EXCLUIR (DELETE)
async function excluirVeiculo(id) {
  if (!confirm("Deseja excluir este veículo?")) return;
  const { error } = await banco.from("veiculos").delete().eq("id", id);
  if (error) {
    mostrarMensagem("Erro ao excluir: " + error.message, true);
    return;
  }
  mostrarMensagem("Veículo excluído!");
  carregarVeiculos();
}

function limparFormulario() {
  form.reset();
  document.getElementById("id").value = "";
  tituloForm.textContent = "Novo Veículo";
  btnCancelar.style.display = "none";
}

btnCancelar.addEventListener("click", limparFormulario);

// BUSCA
busca.addEventListener("input", () => {
  const termo = busca.value.toLowerCase();
  const filtrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(termo) ||
      v.marca.toLowerCase().includes(termo) ||
      v.modelo.toLowerCase().includes(termo)
  );
  mostrarTabela(filtrados);
});

// Carrega ao abrir a página
carregarVeiculos();
