document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const authModal = document.getElementById("authModal");
    const authForm = document.getElementById("authForm");
    const toggleAuth = document.getElementById("toggleAuth");
    const modalTitle = document.getElementById("modalTitle");

    let isLogin = true;

    if (localStorage.getItem("token")) {
        window.location.href = "dashboard.html";
    }

    const openModal = (type) => {
        isLogin = type === "login";
        modalTitle.innerText = isLogin ? "Login" : "Sign Up";
        toggleAuth.innerText = isLogin ? "Don't have an account? Sign up" : "Already have an account? Login";
        authModal.style.display = "flex";
    };

    loginBtn?.addEventListener("click", () => openModal("login"));
    signupBtn?.addEventListener("click", () => openModal("signup"));

    toggleAuth?.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(isLogin ? "signup" : "login");
    });

    window.onclick = (e) => {
        if (e.target === authModal) authModal.style.display = "none";
    };

    authForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            if (isLogin) {
                await api.auth.login(email, password);
            } else {
                await api.auth.signup(email, password);
                await api.auth.login(email, password);
            }
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
});
