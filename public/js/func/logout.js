async function logout() {
    const resp = await fetch("/logout", {
        method: "POST",
    });

    const data = await resp.json();

    if (data.status == "success") {
        window.location.href = "/login"
    } else {
        console.log(data.status, data.err)
    }
}