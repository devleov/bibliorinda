async function logout() {
    const resp = await fetch("/logout", { method: "POST" });
    const data = await resp.json();

    if (data.status == "success") {
        $(".alert").addClass("alert-success show")
        $(".text-alert").html('<i class="fa-solid fa-check-circle me-2"></i>' + data.message)

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            window.location.href = "/login";
        }, 2000)

        return;
    } 

    $(".alert").addClass("alert-danger show")
    $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + data.message)
    console.error(data.err)
}