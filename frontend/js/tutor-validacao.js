const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("login.html");

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("login.html");
});

document.getElementById("tutorOnboardingForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const areaAtuacao = document.getElementById("areaAtuacao").value.trim();
    const formacao = document.getElementById("formacao").value.trim();
    const situacaoCurso = document.getElementById("situacaoCurso").value;

    const comprovante = document.getElementById("docComprovante").files[0];
    const identidade = document.getElementById("docIdentidade").files[0];

    if (!areaAtuacao || !formacao || !situacaoCurso || !comprovante || !identidade) {
        alert("Preencha tudo e anexe os documentos.");
        return;
    }

    try {
        // A) atualiza dados do tutor
        await api("/tutors/me", {
            method: "PUT",
            body: { areaAtuacao, formacao, situacaoCurso }
        });

        // B) envia documentos
        const fd = new FormData();
        fd.append("comprovante", comprovante);
        fd.append("identidade", identidade);

        await api("/tutors/me/documents", {
            method: "POST",
            body: fd,
            isForm: true
        });

        alert("Enviado! Aguarde a validação do coordenador.");
        localStorage.removeItem("token"); //evita ficar “logado” sem poder entrar
        window.location.replace("login.html?msg=aguarde-validacao");

    } catch (err) {
        console.error(err);
        alert(err.message || "Erro ao enviar dados.");
    }
});
