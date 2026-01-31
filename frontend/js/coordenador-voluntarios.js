// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaVoluntarios");

// MOCK — depois vem do backend:
// GET /tutors (lista) e PUT /tutors/:id/validate (aprovar)
let voluntarios = [
  { id: 1, nome: "João Tutor", area: "Letras", validado: false },
  { id: 2, nome: "Maria Tutor", area: "Matemática", validado: true },
];

function render() {
  lista.innerHTML = "";

  voluntarios.forEach(v => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${v.nome}</strong><br>
      Área de formação: ${v.area}<br>
      Status: ${v.validado ? "VALIDADO" : "PENDENTE"}<br><br>
      ${
        v.validado
          ? `<button class="btn btn-outline" disabled type="button">Já validado</button>`
          : `<button class="btn btn-primary" type="button" onclick="validar(${v.id})">Validar</button>`
      }
    `;

    lista.appendChild(div);
  });
}

window.validar = function(id){
  const ok = confirm("Deseja validar este voluntário?");
  if (!ok) return;

  voluntarios = voluntarios.map(v => v.id === id ? { ...v, validado: true } : v);
  render();

  // Futuro backend:
  // await apiFetch(`/tutors/${id}/validate`, { method: "PUT" });
};

render();
