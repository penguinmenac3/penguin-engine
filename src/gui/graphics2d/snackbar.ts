export function snackbar(message: string, divForSnackbar: string = "snackbar") {
    // Get the snackbar DIV
    var x = document.getElementById(divForSnackbar)!

    // Add the "show" class to DIV
    x.className = "show"
    x.innerText = message

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", "") }, 3000)
}
